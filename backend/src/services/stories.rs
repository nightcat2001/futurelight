use serde::Deserialize;

use crate::{
    domain::{DailyFamilyTask, StoryDetail, StorySession, StorySummary},
    errors::ApiError,
    repositories::stories::{ChildStoryGate, StoryRepository},
};

#[derive(Debug, Deserialize)]
pub struct StoryQuery {
    pub child_id: String,
    pub mode: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct StartStorySessionRequest {
    pub child_id: String,
    pub story_id: String,
    pub mode: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateStoryProgressRequest {
    pub current_page: i32,
}

#[derive(Debug, Deserialize)]
pub struct CompleteFamilyTaskRequest {
    pub child_id: String,
}

pub struct StoryService {
    repository: StoryRepository,
}

impl StoryService {
    pub fn new(repository: StoryRepository) -> Self {
        Self { repository }
    }

    pub async fn recommendations(
        &self,
        parent_account_id: &str,
        child_id: &str,
        mode: &str,
    ) -> Result<Vec<StorySummary>, ApiError> {
        validate_mode(mode)?;
        let gate = self.child_gate(parent_account_id, child_id, false).await?;
        self.repository
            .recommendations(gate.age_min, gate.age_max, mode)
            .await
            .map_err(map_database_error)
    }

    pub async fn story_detail(
        &self,
        parent_account_id: &str,
        child_id: &str,
        story_id: &str,
    ) -> Result<StoryDetail, ApiError> {
        let gate = self.child_gate(parent_account_id, child_id, false).await?;
        self.repository
            .story_detail(story_id, gate.age_min, gate.age_max)
            .await
            .map_err(map_database_error)?
            .ok_or(ApiError::NotFound)
    }

    pub async fn start_session(
        &self,
        parent_account_id: &str,
        request: StartStorySessionRequest,
    ) -> Result<StorySession, ApiError> {
        validate_mode(&request.mode)?;
        let gate = self
            .child_gate(parent_account_id, &request.child_id, true)
            .await?;
        let story = self
            .repository
            .story_detail(&request.story_id, gate.age_min, gate.age_max)
            .await
            .map_err(map_database_error)?
            .ok_or(ApiError::NotFound)?;
        if story.mode != request.mode {
            return Err(ApiError::BadRequest("story_mode_mismatch"));
        }
        self.repository
            .start_session(&request.child_id, &request.story_id, &request.mode)
            .await
            .map_err(map_database_error)?
            .ok_or(ApiError::NotFound)
    }

    pub async fn update_progress(
        &self,
        parent_account_id: &str,
        session_id: &str,
        request: UpdateStoryProgressRequest,
    ) -> Result<StorySession, ApiError> {
        if request.current_page < 0 {
            return Err(ApiError::BadRequest("invalid_story_page"));
        }
        self.repository
            .update_progress(parent_account_id, session_id, request.current_page)
            .await
            .map_err(map_database_error)?
            .ok_or(ApiError::BadRequest("invalid_story_progress"))
    }

    pub async fn complete_session(
        &self,
        parent_account_id: &str,
        session_id: &str,
    ) -> Result<StorySession, ApiError> {
        self.repository
            .complete_session(parent_account_id, session_id)
            .await
            .map_err(map_database_error)?
            .ok_or(ApiError::BadRequest("story_not_on_last_page"))
    }

    pub async fn daily_task(
        &self,
        parent_account_id: &str,
        child_id: &str,
    ) -> Result<DailyFamilyTask, ApiError> {
        let gate = self.child_gate(parent_account_id, child_id, false).await?;
        self.repository
            .daily_task(child_id, gate.age_min, gate.age_max)
            .await
            .map_err(map_database_error)?
            .ok_or(ApiError::NotFound)
    }

    pub async fn complete_daily_task(
        &self,
        parent_account_id: &str,
        task_id: &str,
        child_id: &str,
    ) -> Result<DailyFamilyTask, ApiError> {
        self.child_gate(parent_account_id, child_id, true).await?;
        self.repository
            .complete_daily_task(parent_account_id, child_id, task_id)
            .await
            .map_err(map_database_error)?
            .ok_or(ApiError::NotFound)
    }

    async fn child_gate(
        &self,
        parent_account_id: &str,
        child_id: &str,
        require_consent: bool,
    ) -> Result<ChildStoryGate, ApiError> {
        let gate = self
            .repository
            .child_gate(parent_account_id, child_id)
            .await
            .map_err(map_database_error)?
            .ok_or(ApiError::NotFound)?;
        if require_consent
            && gate.requires_parental_privacy_consent
            && !gate.has_parental_privacy_consent
        {
            return Err(ApiError::BadRequest("parental_consent_required"));
        }
        Ok(gate)
    }
}

fn validate_mode(mode: &str) -> Result<(), ApiError> {
    if matches!(mode, "standard" | "bedtime") {
        Ok(())
    } else {
        Err(ApiError::BadRequest("invalid_story_mode"))
    }
}

fn map_database_error(error: tokio_postgres::Error) -> ApiError {
    tracing::error!(%error, "story repository error");
    ApiError::DatabaseUnavailable
}
