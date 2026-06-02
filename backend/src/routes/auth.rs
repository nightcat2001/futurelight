use axum::{Json, extract::State, http::HeaderMap};

use crate::{
    domain::{AuthResponse, MeResponse},
    errors::ApiError,
    repositories::auth::ParentAuthRepository,
    services::auth::{AuthService, LoginRequest, RegisterRequest, UpdateParentRequest},
    state::AppState,
};

pub async fn register(
    State(state): State<AppState>,
    Json(request): Json<RegisterRequest>,
) -> Result<Json<AuthResponse>, ApiError> {
    let service = AuthService::new(ParentAuthRepository::new(state.database_url));
    Ok(Json(service.register(request).await?))
}

pub async fn login(
    State(state): State<AppState>,
    Json(request): Json<LoginRequest>,
) -> Result<Json<AuthResponse>, ApiError> {
    let service = AuthService::new(ParentAuthRepository::new(state.database_url));
    Ok(Json(service.login(request).await?))
}

pub async fn me(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<MeResponse>, ApiError> {
    let token = bearer_token(&headers)?;
    let service = AuthService::new(ParentAuthRepository::new(state.database_url));
    Ok(Json(service.me(token).await?))
}

pub async fn update_me(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(request): Json<UpdateParentRequest>,
) -> Result<Json<MeResponse>, ApiError> {
    let token = bearer_token(&headers)?;
    let service = AuthService::new(ParentAuthRepository::new(state.database_url));
    Ok(Json(service.update_parent(token, request).await?))
}

pub async fn logout(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<()>, ApiError> {
    let token = bearer_token(&headers)?;
    let service = AuthService::new(ParentAuthRepository::new(state.database_url));
    service.logout(token).await?;
    Ok(Json(()))
}

pub(crate) fn bearer_token(headers: &HeaderMap) -> Result<&str, ApiError> {
    let Some(value) = headers.get(axum::http::header::AUTHORIZATION) else {
        return Err(ApiError::Unauthorized);
    };
    let Ok(value) = value.to_str() else {
        return Err(ApiError::Unauthorized);
    };
    value
        .strip_prefix("Bearer ")
        .filter(|token| !token.trim().is_empty())
        .ok_or(ApiError::Unauthorized)
}
