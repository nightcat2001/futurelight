use backend::{migrations, repositories::retention::RetentionRepository};
use tokio_postgres::{Client, NoTls};

const DEFAULT_DATABASE_URL: &str = "postgres://futurelight:futurelight@localhost:37432/futurelight";

#[tokio::test]
async fn retention_cleanup_minimizes_and_deletes_only_expired_privacy_records() {
    let database_url =
        std::env::var("DATABASE_URL").unwrap_or_else(|_| DEFAULT_DATABASE_URL.to_string());
    migrations::run_migrations(&database_url)
        .await
        .expect("migrations run");

    let client = connect(&database_url).await;
    let suffix = unique_suffix();
    let email = format!("retention-{suffix}@futurelight.test");
    cleanup_parent(&client, &email).await;

    let parent_id: String = client
        .query_one(
            r#"
            INSERT INTO parent_accounts (email, password_hash, display_name)
            VALUES ($1, 'test-hash', 'Retention Parent')
            RETURNING id::text
            "#,
            &[&email],
        )
        .await
        .expect("insert parent")
        .get("id");

    let child_id: String = client
        .query_one(
            r#"
            INSERT INTO children (parent_account_id, display_name, age_band, market_region, english_variant)
            VALUES ($1::text::uuid, 'Retention Child', '6-8', 'US', 'american')
            RETURNING id::text
            "#,
            &[&parent_id],
        )
        .await
        .expect("insert child")
        .get("id");

    let old_consent_id: String = client
        .query_one(
            r#"
            INSERT INTO consents (
                parent_account_id,
                child_id,
                consent_type,
                status,
                granted_at,
                revoked_at,
                evidence,
                created_at,
                updated_at
            )
            VALUES (
                $1::text::uuid,
                $2::text::uuid,
                'parental_privacy',
                'revoked',
                now() - interval '500 days',
                now() - interval '400 days',
                '{"source":"retention-test","parent_email":"retention@example.test"}'::jsonb,
                now() - interval '500 days',
                now() - interval '400 days'
            )
            RETURNING id::text
            "#,
            &[&parent_id, &child_id],
        )
        .await
        .expect("insert old revoked consent")
        .get("id");

    let fresh_consent_id: String = client
        .query_one(
            r#"
            INSERT INTO consents (
                parent_account_id,
                child_id,
                consent_type,
                status,
                granted_at,
                revoked_at,
                evidence
            )
            VALUES (
                $1::text::uuid,
                $2::text::uuid,
                'parental_privacy',
                'revoked',
                now() - interval '2 days',
                now() - interval '1 day',
                '{"source":"fresh-retention-test"}'::jsonb
            )
            RETURNING id::text
            "#,
            &[&parent_id, &child_id],
        )
        .await
        .expect("insert fresh revoked consent")
        .get("id");

    client
        .execute(
            r#"
            INSERT INTO parent_sessions (parent_account_id, token_hash, expires_at, created_at)
            VALUES
                ($1::text::uuid, $2, now() - interval '10 days', now() - interval '40 days'),
                ($1::text::uuid, $3, now() + interval '10 days', now())
            "#,
            &[
                &parent_id,
                &format!("expired-token-{suffix}"),
                &format!("fresh-token-{suffix}"),
            ],
        )
        .await
        .expect("insert sessions");

    let old_audit_id: String = client
        .query_one(
            r#"
            INSERT INTO audit_logs (action, entity_type, metadata, created_at)
            VALUES ('detached_old', 'retention_test', '{}', now() - interval '3000 days')
            RETURNING id::text
            "#,
            &[],
        )
        .await
        .expect("insert old audit")
        .get("id");
    let fresh_audit_id: String = client
        .query_one(
            r#"
            INSERT INTO audit_logs (action, entity_type, metadata, created_at)
            VALUES ('detached_fresh', 'retention_test', '{}', now())
            RETURNING id::text
            "#,
            &[],
        )
        .await
        .expect("insert fresh audit")
        .get("id");

    let report = RetentionRepository::new(database_url.clone())
        .run_cleanup(7, 365, 2555)
        .await
        .expect("run retention cleanup");

    assert_eq!(report.expired_sessions_deleted, 1);
    assert_eq!(report.revoked_consent_evidence_minimized, 1);
    assert_eq!(report.detached_audit_logs_deleted, 1);

    let old_evidence: serde_json::Value = client
        .query_one(
            "SELECT evidence FROM consents WHERE id = $1::text::uuid",
            &[&old_consent_id],
        )
        .await
        .expect("select old evidence")
        .get("evidence");
    assert_eq!(
        old_evidence["retention_status"].as_str(),
        Some("minimized_after_revocation")
    );

    let fresh_status: String = client
        .query_one(
            "SELECT status FROM consents WHERE id = $1::text::uuid",
            &[&fresh_consent_id],
        )
        .await
        .expect("select fresh consent")
        .get("status");
    assert_eq!(fresh_status, "revoked");

    assert!(audit_exists(&client, &old_audit_id).await.eq(&false));
    assert!(audit_exists(&client, &fresh_audit_id).await);

    cleanup_parent(&client, &email).await;
    cleanup_audit(&client, &fresh_audit_id).await;
}

fn unique_suffix() -> u128 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .expect("system clock after unix epoch")
        .as_nanos()
}

async fn connect(database_url: &str) -> Client {
    let (client, connection) = tokio_postgres::connect(database_url, NoTls)
        .await
        .expect("connect to postgres");
    tokio::spawn(async move {
        if let Err(error) = connection.await {
            eprintln!("postgres retention-test connection error: {error}");
        }
    });
    client
}

async fn cleanup_parent(client: &Client, email: &str) {
    client
        .execute(
            r#"
            DELETE FROM audit_logs
            WHERE actor_parent_account_id IN (
                SELECT id FROM parent_accounts WHERE email = $1
            )
            "#,
            &[&email],
        )
        .await
        .expect("cleanup audit logs");
    client
        .execute("DELETE FROM parent_accounts WHERE email = $1", &[&email])
        .await
        .expect("cleanup parent");
}

async fn cleanup_audit(client: &Client, audit_id: &str) {
    client
        .execute(
            "DELETE FROM audit_logs WHERE id = $1::text::uuid",
            &[&audit_id],
        )
        .await
        .expect("cleanup audit");
}

async fn audit_exists(client: &Client, audit_id: &str) -> bool {
    client
        .query_one(
            "SELECT EXISTS (SELECT 1 FROM audit_logs WHERE id = $1::text::uuid)",
            &[&audit_id],
        )
        .await
        .expect("audit exists")
        .get(0)
}
