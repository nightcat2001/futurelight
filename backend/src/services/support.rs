use serde::Deserialize;

use crate::{
    domain::SupportRequestRecord, errors::ApiError, repositories::support::SupportRepository,
};

#[derive(Debug, Deserialize)]
pub struct CreateSupportRequest {
    pub child_id: Option<String>,
    pub request_type: String,
    pub subject: String,
    pub message: String,
    pub region: Option<String>,
}

pub struct SupportService {
    repository: SupportRepository,
}

impl SupportService {
    pub fn new(repository: SupportRepository) -> Self {
        Self { repository }
    }

    pub async fn create_request(
        &self,
        parent_account_id: &str,
        request: CreateSupportRequest,
    ) -> Result<SupportRequestRecord, ApiError> {
        let request_type = validate_type(&request.request_type)?;
        let subject = validate_text(&request.subject, 3, 120, "invalid_support_subject")?;
        let message = validate_text(&request.message, 10, 2000, "invalid_support_message")?;
        let region = request
            .region
            .as_deref()
            .map(str::trim)
            .filter(|value| !value.is_empty());

        self.repository
            .create_request(
                parent_account_id,
                request.child_id.as_deref(),
                request_type,
                subject,
                message,
                region,
            )
            .await
            .map_err(map_database_error)?
            .ok_or(ApiError::NotFound)
    }

    pub async fn list_requests(
        &self,
        parent_account_id: &str,
    ) -> Result<Vec<SupportRequestRecord>, ApiError> {
        self.repository
            .list_requests(parent_account_id)
            .await
            .map_err(map_database_error)
    }
}

fn validate_type(value: &str) -> Result<&str, ApiError> {
    let trimmed = value.trim();
    match trimmed {
        "data_export"
        | "child_data_deletion"
        | "consent"
        | "content_error"
        | "parent_question"
        | "store_review"
        | "account_access" => Ok(trimmed),
        _ => Err(ApiError::BadRequest("invalid_support_request_type")),
    }
}

fn validate_text<'a>(
    value: &'a str,
    min: usize,
    max: usize,
    error: &'static str,
) -> Result<&'a str, ApiError> {
    let trimmed = value.trim();
    if trimmed.len() < min || trimmed.len() > max {
        return Err(ApiError::BadRequest(error));
    }
    Ok(trimmed)
}

fn map_database_error(error: tokio_postgres::Error) -> ApiError {
    tracing::error!(%error, "support repository error");
    ApiError::DatabaseUnavailable
}
