use serde::Deserialize;
use serde_json::{Value, json};

use crate::{
    domain::{
        ActivitySummary, AdminCourseRecord, AssetSummary, ContentVersionRecord, LessonSummary,
        PublishCheckResponse,
    },
    errors::ApiError,
    repositories::content_admin::{
        ActivityWrite, ContentAdminRepository, ContentAdminRepositoryError, CourseWrite,
        LessonWrite,
    },
    services::auth::hash_token,
};

#[derive(Debug, Deserialize)]
pub struct CreateCourseRequest {
    pub slug: String,
    pub title: String,
    pub target_language: String,
    pub level: String,
    pub status: Option<String>,
    pub cover_asset_id: Option<String>,
    pub sort_order: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateCourseRequest {
    pub slug: Option<String>,
    pub title: Option<String>,
    pub target_language: Option<String>,
    pub level: Option<String>,
    pub status: Option<String>,
    pub cover_asset_id: Option<String>,
    pub sort_order: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct CreateLessonRequest {
    pub slug: String,
    pub title: String,
    pub learning_objectives: Option<Value>,
    pub sort_order: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateLessonRequest {
    pub slug: Option<String>,
    pub title: Option<String>,
    pub learning_objectives: Option<Value>,
    pub sort_order: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct CreateActivityRequest {
    pub slug: String,
    pub activity_type: String,
    pub prompt: Option<Value>,
    pub content: Option<Value>,
    pub answer_key: Option<Value>,
    pub sort_order: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateActivityRequest {
    pub slug: Option<String>,
    pub activity_type: Option<String>,
    pub prompt: Option<Value>,
    pub content: Option<Value>,
    pub answer_key: Option<Value>,
    pub sort_order: Option<i32>,
}

pub struct ContentAdminService {
    repository: ContentAdminRepository,
}

impl ContentAdminService {
    pub fn new(repository: ContentAdminRepository) -> Self {
        Self { repository }
    }

    pub async fn list_courses(&self, token: &str) -> Result<Vec<AdminCourseRecord>, ApiError> {
        self.require_admin(token).await?;
        self.repository
            .list_courses()
            .await
            .map_err(map_repository_error)
    }

    pub async fn create_course(
        &self,
        token: &str,
        request: CreateCourseRequest,
    ) -> Result<AdminCourseRecord, ApiError> {
        let actor_id = self.require_admin(token).await?;
        let status = request
            .status
            .as_deref()
            .map(validate_course_status)
            .transpose()?;
        if status == Some("published") {
            return Err(ApiError::BadRequest("publish_check_required"));
        }

        let course = self
            .repository
            .create_course(CourseWrite {
                slug: Some(validate_slug(&request.slug)?),
                status,
                title: Some(validate_required(&request.title, "title_required")?),
                target_language: Some(validate_required(
                    &request.target_language,
                    "target_language_required",
                )?),
                level: Some(validate_required(&request.level, "level_required")?),
                cover_asset_id: request
                    .cover_asset_id
                    .as_deref()
                    .map(validate_id)
                    .transpose()?,
                sort_order: request.sort_order,
            })
            .await
            .map_err(map_repository_error)?;
        self.record("course", &course.id, "create", &actor_id, &course)
            .await?;
        Ok(course)
    }

    pub async fn update_course(
        &self,
        token: &str,
        course_id: &str,
        request: UpdateCourseRequest,
    ) -> Result<AdminCourseRecord, ApiError> {
        let actor_id = self.require_admin(token).await?;
        let course_id = validate_id(course_id)?;
        let status = request
            .status
            .as_deref()
            .map(validate_course_status)
            .transpose()?;
        if status == Some("published") {
            let issues = self
                .repository
                .course_publish_issues(course_id)
                .await
                .map_err(map_repository_error)?
                .ok_or(ApiError::NotFound)?;
            if !issues.is_empty() {
                return Err(ApiError::BadRequest("publish_check_failed"));
            }
        }

        if request.slug.is_none()
            && request.title.is_none()
            && request.target_language.is_none()
            && request.level.is_none()
            && status.is_none()
            && request.cover_asset_id.is_none()
            && request.sort_order.is_none()
        {
            return Err(ApiError::BadRequest("course_update_required"));
        }

        let slug = request.slug.as_deref().map(validate_slug).transpose()?;
        let title = request
            .title
            .as_deref()
            .map(|value| validate_required(value, "title_required"))
            .transpose()?;
        let target_language = request
            .target_language
            .as_deref()
            .map(|value| validate_required(value, "target_language_required"))
            .transpose()?;
        let level = request
            .level
            .as_deref()
            .map(|value| validate_required(value, "level_required"))
            .transpose()?;
        let cover_asset_id = request
            .cover_asset_id
            .as_deref()
            .map(validate_id)
            .transpose()?;

        let course = self
            .repository
            .update_course(
                course_id,
                CourseWrite {
                    slug,
                    status,
                    title,
                    target_language,
                    level,
                    cover_asset_id,
                    sort_order: request.sort_order,
                },
            )
            .await
            .map_err(map_repository_error)?
            .ok_or(ApiError::NotFound)?;
        self.record("course", &course.id, "update", &actor_id, &course)
            .await?;
        Ok(course)
    }

    pub async fn archive_course(
        &self,
        token: &str,
        course_id: &str,
    ) -> Result<AdminCourseRecord, ApiError> {
        let actor_id = self.require_admin(token).await?;
        let course = self
            .repository
            .archive_course(validate_id(course_id)?)
            .await
            .map_err(map_repository_error)?
            .ok_or(ApiError::NotFound)?;
        self.record("course", &course.id, "archive", &actor_id, &course)
            .await?;
        Ok(course)
    }

    pub async fn list_lessons(
        &self,
        token: &str,
        course_id: &str,
    ) -> Result<Vec<LessonSummary>, ApiError> {
        self.require_admin(token).await?;
        self.repository
            .list_lessons(validate_id(course_id)?)
            .await
            .map_err(map_repository_error)
    }

    pub async fn create_lesson(
        &self,
        token: &str,
        course_id: &str,
        request: CreateLessonRequest,
    ) -> Result<LessonSummary, ApiError> {
        let actor_id = self.require_admin(token).await?;
        let lesson = self
            .repository
            .create_lesson(LessonWrite {
                course_id: Some(validate_id(course_id)?),
                slug: Some(validate_slug(&request.slug)?),
                title: Some(validate_required(&request.title, "title_required")?),
                learning_objectives: request.learning_objectives.or_else(|| Some(json!([]))),
                sort_order: request.sort_order,
            })
            .await
            .map_err(map_repository_error)?;
        self.record("lesson", &lesson.id, "create", &actor_id, &lesson)
            .await?;
        Ok(lesson)
    }

    pub async fn update_lesson(
        &self,
        token: &str,
        lesson_id: &str,
        request: UpdateLessonRequest,
    ) -> Result<LessonSummary, ApiError> {
        let actor_id = self.require_admin(token).await?;
        if request.slug.is_none()
            && request.title.is_none()
            && request.learning_objectives.is_none()
            && request.sort_order.is_none()
        {
            return Err(ApiError::BadRequest("lesson_update_required"));
        }

        let lesson = self
            .repository
            .update_lesson(
                validate_id(lesson_id)?,
                LessonWrite {
                    course_id: None,
                    slug: request.slug.as_deref().map(validate_slug).transpose()?,
                    title: request
                        .title
                        .as_deref()
                        .map(|value| validate_required(value, "title_required"))
                        .transpose()?,
                    learning_objectives: request.learning_objectives,
                    sort_order: request.sort_order,
                },
            )
            .await
            .map_err(map_repository_error)?
            .ok_or(ApiError::NotFound)?;
        self.record("lesson", &lesson.id, "update", &actor_id, &lesson)
            .await?;
        Ok(lesson)
    }

    pub async fn delete_lesson(&self, token: &str, lesson_id: &str) -> Result<(), ApiError> {
        let actor_id = self.require_admin(token).await?;
        let lesson_id = validate_id(lesson_id)?;
        let snapshot = self
            .repository
            .delete_lesson(lesson_id)
            .await
            .map_err(map_repository_error)?
            .ok_or(ApiError::NotFound)?;
        self.repository
            .record_version("lesson", lesson_id, "delete", &actor_id, snapshot)
            .await
            .map_err(map_repository_error)?;
        Ok(())
    }

    pub async fn list_activities(
        &self,
        token: &str,
        lesson_id: &str,
    ) -> Result<Vec<ActivitySummary>, ApiError> {
        self.require_admin(token).await?;
        self.repository
            .list_activities(validate_id(lesson_id)?)
            .await
            .map_err(map_repository_error)
    }

    pub async fn create_activity(
        &self,
        token: &str,
        lesson_id: &str,
        request: CreateActivityRequest,
    ) -> Result<ActivitySummary, ApiError> {
        let actor_id = self.require_admin(token).await?;
        let activity = self
            .repository
            .create_activity(ActivityWrite {
                lesson_id: Some(validate_id(lesson_id)?),
                slug: Some(validate_slug(&request.slug)?),
                activity_type: Some(validate_required(
                    &request.activity_type,
                    "activity_type_required",
                )?),
                prompt: request.prompt.or_else(|| Some(json!({}))),
                content: request.content.or_else(|| Some(json!({}))),
                answer_key: request.answer_key.or_else(|| Some(json!({}))),
                sort_order: request.sort_order,
            })
            .await
            .map_err(map_repository_error)?;
        self.record("activity", &activity.id, "create", &actor_id, &activity)
            .await?;
        Ok(activity)
    }

    pub async fn update_activity(
        &self,
        token: &str,
        activity_id: &str,
        request: UpdateActivityRequest,
    ) -> Result<ActivitySummary, ApiError> {
        let actor_id = self.require_admin(token).await?;
        if request.slug.is_none()
            && request.activity_type.is_none()
            && request.prompt.is_none()
            && request.content.is_none()
            && request.answer_key.is_none()
            && request.sort_order.is_none()
        {
            return Err(ApiError::BadRequest("activity_update_required"));
        }

        let activity = self
            .repository
            .update_activity(
                validate_id(activity_id)?,
                ActivityWrite {
                    lesson_id: None,
                    slug: request.slug.as_deref().map(validate_slug).transpose()?,
                    activity_type: request
                        .activity_type
                        .as_deref()
                        .map(|value| validate_required(value, "activity_type_required"))
                        .transpose()?,
                    prompt: request.prompt,
                    content: request.content,
                    answer_key: request.answer_key,
                    sort_order: request.sort_order,
                },
            )
            .await
            .map_err(map_repository_error)?
            .ok_or(ApiError::NotFound)?;
        self.record("activity", &activity.id, "update", &actor_id, &activity)
            .await?;
        Ok(activity)
    }

    pub async fn delete_activity(&self, token: &str, activity_id: &str) -> Result<(), ApiError> {
        let actor_id = self.require_admin(token).await?;
        let activity_id = validate_id(activity_id)?;
        let snapshot = self
            .repository
            .delete_activity(activity_id)
            .await
            .map_err(map_repository_error)?
            .ok_or(ApiError::NotFound)?;
        self.repository
            .record_version("activity", activity_id, "delete", &actor_id, snapshot)
            .await
            .map_err(map_repository_error)?;
        Ok(())
    }

    pub async fn list_assets(&self, token: &str) -> Result<Vec<AssetSummary>, ApiError> {
        self.require_admin(token).await?;
        self.repository
            .list_assets()
            .await
            .map_err(map_repository_error)
    }

    pub async fn check_course_publish(
        &self,
        token: &str,
        course_id: &str,
    ) -> Result<PublishCheckResponse, ApiError> {
        let actor_id = self.require_admin(token).await?;
        let course_id = validate_id(course_id)?;
        let issues = self
            .repository
            .course_publish_issues(course_id)
            .await
            .map_err(map_repository_error)?
            .ok_or(ApiError::NotFound)?;
        let response = PublishCheckResponse {
            course_id: course_id.to_string(),
            can_publish: issues.is_empty(),
            issues,
        };
        self.repository
            .record_version(
                "course",
                course_id,
                "publish_check",
                &actor_id,
                serde_json::to_value(&response).unwrap_or_else(|_| json!({})),
            )
            .await
            .map_err(map_repository_error)?;
        Ok(response)
    }

    pub async fn list_versions(&self, token: &str) -> Result<Vec<ContentVersionRecord>, ApiError> {
        self.require_admin(token).await?;
        self.repository
            .list_versions(50)
            .await
            .map_err(map_repository_error)
    }

    async fn require_admin(&self, token: &str) -> Result<String, ApiError> {
        let token_hash = hash_token(token);
        let Some(principal) = self
            .repository
            .admin_principal_for_token_hash(&token_hash)
            .await
            .map_err(map_repository_error)?
        else {
            return Err(ApiError::Unauthorized);
        };
        if !principal.is_content_admin {
            return Err(ApiError::Forbidden("content_admin_required"));
        }
        Ok(principal.parent_account_id)
    }

    async fn record<T: serde::Serialize>(
        &self,
        entity_type: &str,
        entity_id: &str,
        action: &str,
        actor_id: &str,
        record: &T,
    ) -> Result<(), ApiError> {
        let snapshot = serde_json::to_value(record).map_err(|error| {
            tracing::error!(%error, "content version serialization failed");
            ApiError::Internal
        })?;
        self.repository
            .record_version(entity_type, entity_id, action, actor_id, snapshot)
            .await
            .map_err(map_repository_error)?;
        Ok(())
    }
}

fn validate_required<'a>(value: &'a str, error: &'static str) -> Result<&'a str, ApiError> {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        return Err(ApiError::BadRequest(error));
    }
    Ok(trimmed)
}

fn validate_slug(value: &str) -> Result<&str, ApiError> {
    let trimmed = validate_required(value, "slug_required")?;
    let valid = trimmed
        .bytes()
        .all(|byte| byte.is_ascii_lowercase() || byte.is_ascii_digit() || byte == b'-');
    if !valid || trimmed.starts_with('-') || trimmed.ends_with('-') {
        return Err(ApiError::BadRequest("invalid_slug"));
    }
    Ok(trimmed)
}

fn validate_course_status(value: &str) -> Result<&str, ApiError> {
    match value.trim() {
        "draft" | "review" | "published" | "archived" => Ok(value.trim()),
        _ => Err(ApiError::BadRequest("invalid_course_status")),
    }
}

fn validate_id(value: &str) -> Result<&str, ApiError> {
    let trimmed = value.trim();
    if trimmed.len() != 36 {
        return Err(ApiError::BadRequest("invalid_id"));
    }
    Ok(trimmed)
}

fn map_repository_error(error: ContentAdminRepositoryError) -> ApiError {
    match error {
        ContentAdminRepositoryError::BadRequest(error) => ApiError::BadRequest(error),
        ContentAdminRepositoryError::Conflict(error) => ApiError::Conflict(error),
        ContentAdminRepositoryError::Database(error) => {
            tracing::error!(%error, "content-admin repository error");
            ApiError::DatabaseUnavailable
        }
    }
}
