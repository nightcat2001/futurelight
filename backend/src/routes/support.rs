use axum::{Json, extract::State, http::HeaderMap};

use crate::{
    domain::SupportRequestRecord,
    errors::ApiError,
    repositories::{auth::ParentAuthRepository, support::SupportRepository},
    services::{
        auth::AuthService,
        support::{CreateSupportRequest, SupportService},
    },
    state::AppState,
};

use super::auth::bearer_token;

pub async fn create_request(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(request): Json<CreateSupportRequest>,
) -> Result<Json<SupportRequestRecord>, ApiError> {
    let parent = authenticated_parent(&state, &headers).await?;
    let service = SupportService::new(SupportRepository::new(state.database_url));
    Ok(Json(service.create_request(&parent.id, request).await?))
}

pub async fn list_requests(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<Vec<SupportRequestRecord>>, ApiError> {
    let parent = authenticated_parent(&state, &headers).await?;
    let service = SupportService::new(SupportRepository::new(state.database_url));
    Ok(Json(service.list_requests(&parent.id).await?))
}

async fn authenticated_parent(
    state: &AppState,
    headers: &HeaderMap,
) -> Result<crate::domain::ParentAccount, ApiError> {
    let token = bearer_token(headers)?;
    let service = AuthService::new(ParentAuthRepository::new(state.database_url.clone()));
    service.parent_for_token(token).await
}
