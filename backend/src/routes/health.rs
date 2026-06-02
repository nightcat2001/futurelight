use axum::{Json, extract::State};

use crate::{
    domain::{DbHealthResponse, HealthResponse},
    errors::ApiError,
    repositories::health::HealthRepository,
    services::health::HealthService,
    state::AppState,
};

pub async fn health() -> Json<HealthResponse> {
    Json(HealthService::app_health())
}

pub async fn db_health(State(state): State<AppState>) -> Result<Json<DbHealthResponse>, ApiError> {
    let service = HealthService::new(HealthRepository::new(state.database_url));
    Ok(Json(service.database_health().await?))
}
