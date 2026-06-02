use std::collections::HashSet;

use tokio_postgres::NoTls;

const MIGRATIONS: &[(&str, &str)] = &[
    (
        "0001_initial_schema",
        include_str!("../migrations/0001_initial_schema.sql"),
    ),
    (
        "0002_parent_auth_sessions",
        include_str!("../migrations/0002_parent_auth_sessions.sql"),
    ),
    (
        "0003_seed_initial_course",
        include_str!("../migrations/0003_seed_initial_course.sql"),
    ),
    (
        "0004_seed_core_courses",
        include_str!("../migrations/0004_seed_core_courses.sql"),
    ),
    (
        "0005_parent_sound_preferences",
        include_str!("../migrations/0005_parent_sound_preferences.sql"),
    ),
    (
        "0006_seed_generated_image_assets",
        include_str!("../migrations/0006_seed_generated_image_assets.sql"),
    ),
    (
        "0007_generated_image_asset_metadata",
        include_str!("../migrations/0007_generated_image_asset_metadata.sql"),
    ),
    (
        "0008_content_admin_workflow",
        include_str!("../migrations/0008_content_admin_workflow.sql"),
    ),
    (
        "0009_market_variant_content_selection",
        include_str!("../migrations/0009_market_variant_content_selection.sql"),
    ),
];

pub async fn run_migrations(
    database_url: &str,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let (mut client, connection) = tokio_postgres::connect(database_url, NoTls).await?;
    let connection_task = tokio::spawn(async move {
        if let Err(error) = connection.await {
            tracing::error!(%error, "postgres migration connection error");
        }
    });

    client
        .batch_execute(
            r#"
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version text PRIMARY KEY,
                applied_at timestamptz NOT NULL DEFAULT now()
            );
            "#,
        )
        .await?;

    let applied = client
        .query("SELECT version FROM schema_migrations", &[])
        .await?
        .into_iter()
        .map(|row| row.get::<_, String>(0))
        .collect::<HashSet<_>>();

    for &(version, sql) in MIGRATIONS {
        if applied.contains(version) {
            tracing::debug!(migration = version, "database migration already applied");
            continue;
        }

        let transaction = client.transaction().await?;
        transaction.batch_execute(sql).await?;
        transaction
            .execute(
                "INSERT INTO schema_migrations (version) VALUES ($1)",
                &[&version],
            )
            .await?;
        transaction.commit().await?;

        tracing::info!(migration = version, "applied database migration");
    }

    drop(client);
    let _ = connection_task.await;

    Ok(())
}
