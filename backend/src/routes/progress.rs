use axum::{
    Json,
    extract::{Path, State},
    http::HeaderMap,
};

use crate::{
    domain::{AttemptRecord, LearningSession, ProgressRecord, RewardRecord},
    errors::ApiError,
    repositories::{auth::ParentAuthRepository, progress::ProgressRepository},
    services::{
        auth::AuthService,
        progress::{ProgressService, RecordAttemptRequest, StartSessionRequest},
    },
    state::AppState,
};

use super::auth::bearer_token;

pub async fn start_session(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(request): Json<StartSessionRequest>,
) -> Result<Json<LearningSession>, ApiError> {
    let parent = authenticated_parent(&state, &headers).await?;
    let service = ProgressService::new(ProgressRepository::new(state.database_url));
    Ok(Json(service.start_session(&parent.id, request).await?))
}

pub async fn complete_session(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(session_id): Path<String>,
) -> Result<Json<LearningSession>, ApiError> {
    let parent = authenticated_parent(&state, &headers).await?;
    let service = ProgressService::new(ProgressRepository::new(state.database_url));
    Ok(Json(
        service.complete_session(&parent.id, &session_id).await?,
    ))
}

pub async fn record_attempt(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(request): Json<RecordAttemptRequest>,
) -> Result<Json<AttemptRecord>, ApiError> {
    let parent = authenticated_parent(&state, &headers).await?;
    let service = ProgressService::new(ProgressRepository::new(state.database_url));
    Ok(Json(service.record_attempt(&parent.id, request).await?))
}

pub async fn list_child_progress(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(child_id): Path<String>,
) -> Result<Json<Vec<ProgressRecord>>, ApiError> {
    let parent = authenticated_parent(&state, &headers).await?;
    let service = ProgressService::new(ProgressRepository::new(state.database_url));
    Ok(Json(
        service.list_child_progress(&parent.id, &child_id).await?,
    ))
}

pub async fn list_child_rewards(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(child_id): Path<String>,
) -> Result<Json<Vec<RewardRecord>>, ApiError> {
    let parent = authenticated_parent(&state, &headers).await?;
    let service = ProgressService::new(ProgressRepository::new(state.database_url));
    Ok(Json(
        service.list_child_rewards(&parent.id, &child_id).await?,
    ))
}

async fn authenticated_parent(
    state: &AppState,
    headers: &HeaderMap,
) -> Result<crate::domain::ParentAccount, ApiError> {
    let token = bearer_token(headers)?;
    let service = AuthService::new(ParentAuthRepository::new(state.database_url.clone()));
    service.parent_for_token(token).await
}
