use tokio_postgres::{Client, NoTls};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RetentionCleanupReport {
    pub expired_sessions_deleted: u64,
    pub revoked_consent_evidence_minimized: u64,
    pub detached_audit_logs_deleted: u64,
}

pub struct RetentionRepository {
    database_url: String,
}

impl RetentionRepository {
    pub fn new(database_url: String) -> Self {
        Self { database_url }
    }

    async fn connect(&self) -> Result<Client, tokio_postgres::Error> {
        let (client, connection) = tokio_postgres::connect(&self.database_url, NoTls).await?;
        tokio::spawn(async move {
            if let Err(error) = connection.await {
                tracing::error!(%error, "postgres retention connection error");
            }
        });
        Ok(client)
    }

    pub async fn run_cleanup(
        &self,
        session_retention_days: i32,
        revoked_consent_evidence_retention_days: i32,
        detached_audit_log_retention_days: i32,
    ) -> Result<RetentionCleanupReport, tokio_postgres::Error> {
        let client = self.connect().await?;

        let expired_sessions_deleted = client
            .execute(
                r#"
                DELETE FROM parent_sessions
                WHERE expires_at < now() - make_interval(days => $1::int)
                "#,
                &[&session_retention_days],
            )
            .await?;

        let revoked_consent_evidence_minimized = client
            .execute(
                r#"
                UPDATE consents
                SET status = 'expired',
                    evidence = jsonb_build_object(
                        'retention_status', 'minimized_after_revocation',
                        'minimized_at', now()::text
                    )
                WHERE status = 'revoked'
                    AND revoked_at IS NOT NULL
                    AND revoked_at < now() - make_interval(days => $1::int)
                    AND evidence <> jsonb_build_object(
                        'retention_status', 'minimized_after_revocation',
                        'minimized_at', evidence->>'minimized_at'
                    )
                "#,
                &[&revoked_consent_evidence_retention_days],
            )
            .await?;

        let detached_audit_logs_deleted = client
            .execute(
                r#"
                DELETE FROM audit_logs
                WHERE actor_parent_account_id IS NULL
                    AND child_id IS NULL
                    AND created_at < now() - make_interval(days => $1::int)
                "#,
                &[&detached_audit_log_retention_days],
            )
            .await?;

        Ok(RetentionCleanupReport {
            expired_sessions_deleted,
            revoked_consent_evidence_minimized,
            detached_audit_logs_deleted,
        })
    }
}
