use serde::Deserialize;
use serde_json::Value;

use crate::{
    domain::{AttemptRecord, LearningSession, ProgressRecord, RewardRecord},
    errors::ApiError,
    repositories::progress::{AttemptWrite, ProgressRepository},
};

#[derive(Debug, Deserialize)]
pub struct StartSessionRequest {
    pub child_id: String,
    pub course_id: String,
    pub lesson_id: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct RecordAttemptRequest {
    pub child_id: String,
    pub activity_id: String,
    pub session_id: Option<String>,
    pub answer: Value,
    pub is_correct: bool,
    pub score: Option<f64>,
    pub duration_ms: Option<i32>,
}

pub struct ProgressService {
    repository: ProgressRepository,
}

impl ProgressService {
    pub fn new(repository: ProgressRepository) -> Self {
        Self { repository }
    }

    pub async fn start_session(
        &self,
        parent_account_id: &str,
        request: StartSessionRequest,
    ) -> Result<LearningSession, ApiError> {
        self.require_parental_privacy_consent(parent_account_id, &request.child_id)
            .await?;

        self.repository
            .create_session(
                parent_account_id,
                &request.child_id,
                &request.course_id,
                request.lesson_id.as_deref(),
            )
            .await
            .map_err(map_database_error)?
            .ok_or(ApiError::NotFound)
    }

    pub async fn complete_session(
        &self,
        parent_account_id: &str,
        session_id: &str,
    ) -> Result<LearningSession, ApiError> {
        self.repository
            .complete_session(parent_account_id, session_id)
            .await
            .map_err(map_database_error)?
            .ok_or(ApiError::NotFound)
    }

    pub async fn record_attempt(
        &self,
        parent_account_id: &str,
        request: RecordAttemptRequest,
    ) -> Result<AttemptRecord, ApiError> {
        let score = request
            .score
            .unwrap_or(if request.is_correct { 100.0 } else { 0.0 });
        if !(0.0..=100.0).contains(&score) {
            return Err(ApiError::BadRequest("invalid_score"));
        }

        self.require_parental_privacy_consent(parent_account_id, &request.child_id)
            .await?;

        self.repository
            .record_attempt(AttemptWrite {
                parent_account_id,
                child_id: &request.child_id,
                activity_id: &request.activity_id,
                session_id: request.session_id.as_deref(),
                answer: &request.answer,
                is_correct: request.is_correct,
                score,
                duration_ms: request.duration_ms,
            })
            .await
            .map_err(map_database_error)?
            .ok_or(ApiError::NotFound)
    }

    pub async fn list_child_progress(
        &self,
        parent_account_id: &str,
        child_id: &str,
    ) -> Result<Vec<ProgressRecord>, ApiError> {
        self.repository
            .list_child_progress(parent_account_id, child_id)
            .await
            .map_err(map_database_error)?
            .ok_or(ApiError::NotFound)
    }

    pub async fn list_child_rewards(
        &self,
        parent_account_id: &str,
        child_id: &str,
    ) -> Result<Vec<RewardRecord>, ApiError> {
        self.repository
            .list_child_rewards(parent_account_id, child_id)
            .await
            .map_err(map_database_error)?
            .ok_or(ApiError::NotFound)
    }

    async fn require_parental_privacy_consent(
        &self,
        parent_account_id: &str,
        child_id: &str,
    ) -> Result<(), ApiError> {
        let gate = self
            .repository
            .child_privacy_gate(parent_account_id, child_id)
            .await
            .map_err(map_database_error)?
            .ok_or(ApiError::NotFound)?;

        if gate.requires_parental_privacy_consent && !gate.has_parental_privacy_consent {
            return Err(ApiError::BadRequest("parental_consent_required"));
        }

        Ok(())
    }
}

fn map_database_error(error: tokio_postgres::Error) -> ApiError {
    tracing::error!(%error, "progress repository error");
    ApiError::DatabaseUnavailable
}
