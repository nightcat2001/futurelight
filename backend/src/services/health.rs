use crate::{
    domain::{DbHealthResponse, HealthResponse},
    errors::ApiError,
    repositories::health::HealthRepository,
};

pub struct HealthService {
    repository: HealthRepository,
}

impl HealthService {
    pub fn new(repository: HealthRepository) -> Self {
        Self { repository }
    }

    pub fn app_health() -> HealthResponse {
        HealthResponse {
            status: "ok",
            service: "futurelight-backend",
        }
    }

    pub async fn database_health(&self) -> Result<DbHealthResponse, ApiError> {
        self.repository.check_database().await.map_err(|error| {
            tracing::error!(%error, "postgres health check failed");
            ApiError::DatabaseUnavailable
        })?;

        Ok(DbHealthResponse {
            status: "ok",
            database: "postgres",
        })
    }
}
