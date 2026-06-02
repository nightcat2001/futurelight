use serde::Deserialize;
use serde_json::Value;

use crate::{
    domain::{AuditLogRecord, ConsentRecord, DataExportRequestRecord, DataExportResponse},
    errors::ApiError,
    repositories::privacy::PrivacyRepository,
};

#[derive(Debug, Deserialize)]
pub struct CreateConsentRequest {
    pub child_id: Option<String>,
    pub consent_type: String,
    pub evidence: Option<Value>,
}

#[derive(Debug, Deserialize)]
pub struct DataExportRequest {
    pub child_id: Option<String>,
}

pub struct PrivacyService {
    repository: PrivacyRepository,
}

impl PrivacyService {
    pub fn new(repository: PrivacyRepository) -> Self {
        Self { repository }
    }

    pub async fn create_consent(
        &self,
        parent_account_id: &str,
        request: CreateConsentRequest,
    ) -> Result<ConsentRecord, ApiError> {
        let consent_type = validate_consent_type(&request.consent_type)?;
        let evidence = request
            .evidence
            .unwrap_or_else(|| serde_json::json!({ "source": "api" }));

        let consent = self
            .repository
            .create_consent(
                parent_account_id,
                request.child_id.as_deref(),
                consent_type,
                &evidence,
            )
            .await
            .map_err(map_database_error)?
            .ok_or(ApiError::NotFound)?;

        self.repository
            .create_audit(
                parent_account_id,
                consent.child_id.as_deref(),
                "consent_granted",
                "consent",
                Some(&consent.id),
                &serde_json::json!({ "consent_type": consent.consent_type }),
            )
            .await
            .map_err(map_database_error)?;

        Ok(consent)
    }

    pub async fn list_consents(
        &self,
        parent_account_id: &str,
    ) -> Result<Vec<ConsentRecord>, ApiError> {
        self.repository
            .list_consents(parent_account_id)
            .await
            .map_err(map_database_error)
    }

    pub async fn revoke_consent(
        &self,
        parent_account_id: &str,
        consent_id: &str,
    ) -> Result<ConsentRecord, ApiError> {
        let consent = self
            .repository
            .revoke_consent(parent_account_id, consent_id)
            .await
            .map_err(map_database_error)?
            .ok_or(ApiError::NotFound)?;

        self.repository
            .create_audit(
                parent_account_id,
                consent.child_id.as_deref(),
                "consent_revoked",
                "consent",
                Some(&consent.id),
                &serde_json::json!({ "consent_type": consent.consent_type }),
            )
            .await
            .map_err(map_database_error)?;

        Ok(consent)
    }

    pub async fn request_data_export(
        &self,
        parent_account_id: &str,
        request: DataExportRequest,
    ) -> Result<DataExportResponse, ApiError> {
        self.repository
            .request_data_export(parent_account_id, request.child_id.as_deref())
            .await
            .map_err(map_database_error)?
            .ok_or(ApiError::NotFound)
    }

    pub async fn list_data_export_requests(
        &self,
        parent_account_id: &str,
    ) -> Result<Vec<DataExportRequestRecord>, ApiError> {
        self.repository
            .list_data_export_requests(parent_account_id)
            .await
            .map_err(map_database_error)
    }

    pub async fn delete_child_data(
        &self,
        parent_account_id: &str,
        child_id: &str,
    ) -> Result<AuditLogRecord, ApiError> {
        self.repository
            .delete_child_data(parent_account_id, child_id)
            .await
            .map_err(map_database_error)?
            .ok_or(ApiError::NotFound)
    }

    pub async fn delete_parent_account(
        &self,
        parent_account_id: &str,
    ) -> Result<AuditLogRecord, ApiError> {
        self.repository
            .delete_parent_account(parent_account_id)
            .await
            .map_err(map_database_error)?
            .ok_or(ApiError::NotFound)
    }
}

fn validate_consent_type(consent_type: &str) -> Result<&str, ApiError> {
    let trimmed = consent_type.trim();
    if trimmed.is_empty() {
        return Err(ApiError::BadRequest("consent_type_required"));
    }
    Ok(trimmed)
}

fn map_database_error(error: tokio_postgres::Error) -> ApiError {
    tracing::error!(%error, "privacy repository error");
    ApiError::DatabaseUnavailable
}
