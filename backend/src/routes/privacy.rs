use axum::{
    Json,
    extract::{Path, State},
    http::HeaderMap,
};

use crate::{
    domain::{AuditLogRecord, ConsentRecord, DataExportRequestRecord, DataExportResponse},
    errors::ApiError,
    repositories::{auth::ParentAuthRepository, privacy::PrivacyRepository},
    services::{
        auth::AuthService,
        privacy::{CreateConsentRequest, DataExportRequest, PrivacyService},
    },
    state::AppState,
};

use super::auth::bearer_token;

pub async fn create_consent(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(request): Json<CreateConsentRequest>,
) -> Result<Json<ConsentRecord>, ApiError> {
    let parent = authenticated_parent(&state, &headers).await?;
    let service = PrivacyService::new(PrivacyRepository::new(state.database_url));
    Ok(Json(service.create_consent(&parent.id, request).await?))
}

pub async fn list_consents(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<Vec<ConsentRecord>>, ApiError> {
    let parent = authenticated_parent(&state, &headers).await?;
    let service = PrivacyService::new(PrivacyRepository::new(state.database_url));
    Ok(Json(service.list_consents(&parent.id).await?))
}

pub async fn revoke_consent(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(consent_id): Path<String>,
) -> Result<Json<ConsentRecord>, ApiError> {
    let parent = authenticated_parent(&state, &headers).await?;
    let service = PrivacyService::new(PrivacyRepository::new(state.database_url));
    Ok(Json(service.revoke_consent(&parent.id, &consent_id).await?))
}

pub async fn request_data_export(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(request): Json<DataExportRequest>,
) -> Result<Json<DataExportResponse>, ApiError> {
    let parent = authenticated_parent(&state, &headers).await?;
    let service = PrivacyService::new(PrivacyRepository::new(state.database_url));
    Ok(Json(
        service.request_data_export(&parent.id, request).await?,
    ))
}

pub async fn list_data_export_requests(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<Vec<DataExportRequestRecord>>, ApiError> {
    let parent = authenticated_parent(&state, &headers).await?;
    let service = PrivacyService::new(PrivacyRepository::new(state.database_url));
    Ok(Json(service.list_data_export_requests(&parent.id).await?))
}

pub async fn delete_parent_account(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<AuditLogRecord>, ApiError> {
    let parent = authenticated_parent(&state, &headers).await?;
    let service = PrivacyService::new(PrivacyRepository::new(state.database_url));
    Ok(Json(service.delete_parent_account(&parent.id).await?))
}

pub async fn delete_child_data(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(child_id): Path<String>,
) -> Result<Json<AuditLogRecord>, ApiError> {
    let parent = authenticated_parent(&state, &headers).await?;
    let service = PrivacyService::new(PrivacyRepository::new(state.database_url));
    Ok(Json(
        service.delete_child_data(&parent.id, &child_id).await?,
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
