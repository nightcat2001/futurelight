use std::{env, time::Duration};

use crate::security::SecurityConfig;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AppCommand {
    CheckContent,
    Migrate,
    RetentionCleanup,
}

#[derive(Debug, Clone)]
pub struct AppConfig {
    pub port: u16,
    pub database_url: String,
    pub run_migrations: bool,
    pub command: Option<AppCommand>,
    pub security: SecurityConfig,
}

impl AppConfig {
    pub fn from_env() -> Self {
        let port = env::var("PORT")
            .ok()
            .and_then(|value| value.parse::<u16>().ok())
            .unwrap_or(37200);
        let database_url = env::var("DATABASE_URL").unwrap_or_else(|_| {
            "postgres://futurelight:futurelight@localhost:37432/futurelight".to_string()
        });
        let run_migrations = env::var("RUN_MIGRATIONS")
            .map(|value| value != "false" && value != "0")
            .unwrap_or(true);
        let command = env::args().nth(1).and_then(|value| match value.as_str() {
            "check-content" => Some(AppCommand::CheckContent),
            "migrate" => Some(AppCommand::Migrate),
            "retention-cleanup" => Some(AppCommand::RetentionCleanup),
            _ => None,
        });
        let allowed_origins = env::var("ALLOWED_ORIGINS")
            .ok()
            .map(|value| {
                value
                    .split(',')
                    .map(str::trim)
                    .filter(|origin| !origin.is_empty())
                    .map(ToOwned::to_owned)
                    .collect::<Vec<_>>()
            })
            .unwrap_or_default();
        let rate_limit_window = env_usize("RATE_LIMIT_WINDOW_SECONDS")
            .map(|seconds| Duration::from_secs(seconds as u64))
            .unwrap_or_else(|| Duration::from_secs(60));
        let rate_limit_max_requests = env_usize("RATE_LIMIT_MAX_REQUESTS").unwrap_or(240);
        let auth_rate_limit_max_requests = env_usize("AUTH_RATE_LIMIT_MAX_REQUESTS").unwrap_or(30);

        Self {
            port,
            database_url,
            run_migrations,
            command,
            security: SecurityConfig::new(
                allowed_origins,
                rate_limit_window,
                rate_limit_max_requests,
                auth_rate_limit_max_requests,
            ),
        }
    }
}

fn env_usize(key: &str) -> Option<usize> {
    env::var(key)
        .ok()
        .and_then(|value| value.parse::<usize>().ok())
}
