use axum::{
    Json,
    extract::{Path, State},
    http::HeaderMap,
};

use crate::{
    domain::ChildProfile,
    errors::ApiError,
    repositories::{auth::ParentAuthRepository, children::ChildRepository},
    services::{
        auth::AuthService,
        children::{ChildService, CreateChildRequest, UpdateChildRequest},
    },
    state::AppState,
};

use super::auth::bearer_token;

pub async fn create_child(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(request): Json<CreateChildRequest>,
) -> Result<Json<ChildProfile>, ApiError> {
    let parent = authenticated_parent(&state, &headers).await?;
    let service = ChildService::new(ChildRepository::new(state.database_url));
    Ok(Json(service.create(&parent.id, request).await?))
}

pub async fn list_children(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<Vec<ChildProfile>>, ApiError> {
    let parent = authenticated_parent(&state, &headers).await?;
    let service = ChildService::new(ChildRepository::new(state.database_url));
    Ok(Json(service.list(&parent.id).await?))
}

pub async fn get_child(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(child_id): Path<String>,
) -> Result<Json<ChildProfile>, ApiError> {
    let parent = authenticated_parent(&state, &headers).await?;
    let service = ChildService::new(ChildRepository::new(state.database_url));
    Ok(Json(service.get(&parent.id, &child_id).await?))
}

pub async fn update_child(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(child_id): Path<String>,
    Json(request): Json<UpdateChildRequest>,
) -> Result<Json<ChildProfile>, ApiError> {
    let parent = authenticated_parent(&state, &headers).await?;
    let service = ChildService::new(ChildRepository::new(state.database_url));
    Ok(Json(service.update(&parent.id, &child_id, request).await?))
}

pub async fn delete_child(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(child_id): Path<String>,
) -> Result<Json<()>, ApiError> {
    let parent = authenticated_parent(&state, &headers).await?;
    let service = ChildService::new(ChildRepository::new(state.database_url));
    service.delete(&parent.id, &child_id).await?;
    Ok(Json(()))
}

async fn authenticated_parent(
    state: &AppState,
    headers: &HeaderMap,
) -> Result<crate::domain::ParentAccount, ApiError> {
    let token = bearer_token(headers)?;
    let service = AuthService::new(ParentAuthRepository::new(state.database_url.clone()));
    service.parent_for_token(token).await
}
