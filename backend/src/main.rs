use std::net::SocketAddr;

use backend::{
    config::{AppCommand, AppConfig},
    content_checker, migrations,
    repositories::retention::RetentionRepository,
    routes,
    state::AppState,
};
use tower_http::trace::TraceLayer;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "backend=debug,tower_http=debug".into()),
        )
        .init();

    let config = AppConfig::from_env();

    if let Some(command) = config.command {
        match command {
            AppCommand::CheckContent => {
                let report = content_checker::run_content_check(&config.database_url)
                    .await
                    .expect("run content publish check");

                if report.failures.is_empty() {
                    println!(
                        "Content publish check passed for {} course(s), {} published.",
                        report.total_courses, report.published_courses
                    );
                } else {
                    eprintln!("Content publish check failed:");
                    for failure in report.failures {
                        eprintln!("- {failure}");
                    }
                    std::process::exit(1);
                }
                return;
            }
            AppCommand::Migrate => {
                migrations::run_migrations(&config.database_url)
                    .await
                    .expect("run database migrations");
                return;
            }
            AppCommand::RetentionCleanup => {
                let report = RetentionRepository::new(config.database_url)
                    .run_cleanup(
                        env_i32("SESSION_RETENTION_DAYS").unwrap_or(7),
                        env_i32("REVOKED_CONSENT_EVIDENCE_RETENTION_DAYS").unwrap_or(365),
                        env_i32("DETACHED_AUDIT_LOG_RETENTION_DAYS").unwrap_or(2555),
                    )
                    .await
                    .expect("run retention cleanup");

                println!(
                    "Retention cleanup passed: {} expired session(s) deleted, {} revoked consent evidence record(s) minimized, {} detached audit log(s) deleted.",
                    report.expired_sessions_deleted,
                    report.revoked_consent_evidence_minimized,
                    report.detached_audit_logs_deleted
                );
                return;
            }
        }
    }

    if config.run_migrations {
        migrations::run_migrations(&config.database_url)
            .await
            .expect("run database migrations");
    }

    let state = AppState::new(config.database_url, config.security);
    let app = routes::app_router(state).layer(TraceLayer::new_for_http());

    let addr = SocketAddr::from(([127, 0, 0, 1], config.port));
    tracing::info!("FutureLight backend listening on http://{addr}");

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("bind backend listener");
    axum::serve(listener, app).await.expect("serve backend");
}

fn env_i32(key: &str) -> Option<i32> {
    std::env::var(key)
        .ok()
        .and_then(|value| value.parse::<i32>().ok())
        .filter(|value| *value >= 0)
}
