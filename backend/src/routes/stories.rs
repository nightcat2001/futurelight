use axum::{
    Json,
    extract::{Path, Query, State},
    http::HeaderMap,
};

use crate::{
    domain::{DailyFamilyTask, StoryDetail, StorySession, StorySummary},
    errors::ApiError,
    repositories::{auth::ParentAuthRepository, stories::StoryRepository},
    services::{
        auth::AuthService,
        stories::{
            CompleteFamilyTaskRequest, StartStorySessionRequest, StoryQuery, StoryService,
            UpdateStoryProgressRequest,
        },
    },
    state::AppState,
};

use super::auth::bearer_token;

pub async fn recommendations(
    State(state): State<AppState>,
    headers: HeaderMap,
    Query(query): Query<StoryQuery>,
) -> Result<Json<Vec<StorySummary>>, ApiError> {
    let parent = authenticated_parent(&state, &headers).await?;
    let service = StoryService::new(StoryRepository::new(state.database_url));
    Ok(Json(
        service
            .recommendations(
                &parent.id,
                &query.child_id,
                query.mode.as_deref().unwrap_or("standard"),
            )
            .await?,
    ))
}

pub async fn story_detail(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(story_id): Path<String>,
    Query(query): Query<StoryQuery>,
) -> Result<Json<StoryDetail>, ApiError> {
    let parent = authenticated_parent(&state, &headers).await?;
    let service = StoryService::new(StoryRepository::new(state.database_url));
    Ok(Json(
        service
            .story_detail(&parent.id, &query.child_id, &story_id)
            .await?,
    ))
}

pub async fn start_story_session(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(request): Json<StartStorySessionRequest>,
) -> Result<Json<StorySession>, ApiError> {
    let parent = authenticated_parent(&state, &headers).await?;
    let service = StoryService::new(StoryRepository::new(state.database_url));
    Ok(Json(service.start_session(&parent.id, request).await?))
}

pub async fn update_story_progress(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(session_id): Path<String>,
    Json(request): Json<UpdateStoryProgressRequest>,
) -> Result<Json<StorySession>, ApiError> {
    let parent = authenticated_parent(&state, &headers).await?;
    let service = StoryService::new(StoryRepository::new(state.database_url));
    Ok(Json(
        service
            .update_progress(&parent.id, &session_id, request)
            .await?,
    ))
}

pub async fn complete_story_session(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(session_id): Path<String>,
) -> Result<Json<StorySession>, ApiError> {
    let parent = authenticated_parent(&state, &headers).await?;
    let service = StoryService::new(StoryRepository::new(state.database_url));
    Ok(Json(
        service.complete_session(&parent.id, &session_id).await?,
    ))
}

pub async fn daily_family_task(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(child_id): Path<String>,
) -> Result<Json<DailyFamilyTask>, ApiError> {
    let parent = authenticated_parent(&state, &headers).await?;
    let service = StoryService::new(StoryRepository::new(state.database_url));
    Ok(Json(service.daily_task(&parent.id, &child_id).await?))
}

pub async fn complete_family_task(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(task_id): Path<String>,
    Json(request): Json<CompleteFamilyTaskRequest>,
) -> Result<Json<DailyFamilyTask>, ApiError> {
    let parent = authenticated_parent(&state, &headers).await?;
    let service = StoryService::new(StoryRepository::new(state.database_url));
    Ok(Json(
        service
            .complete_daily_task(&parent.id, &task_id, &request.child_id)
            .await?,
    ))
}

async fn authenticated_parent(
    state: &AppState,
    headers: &HeaderMap,
) -> Result<crate::domain::ParentAccount, ApiError> {
    let token = bearer_token(headers)?;
    AuthService::new(ParentAuthRepository::new(state.database_url.clone()))
        .parent_for_token(token)
        .await
}
