use std::net::SocketAddr;

use backend::{
    config::{AppCommand, AppConfig},
    content_checker, migrations, routes,
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
