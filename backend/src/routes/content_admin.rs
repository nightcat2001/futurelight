use axum::{
    Json,
    extract::{Path, State},
    http::HeaderMap,
};

use crate::{
    domain::{
        ActivitySummary, AdminCourseRecord, AssetSummary, ContentVersionRecord, LessonSummary,
        PublishCheckResponse,
    },
    errors::ApiError,
    repositories::content_admin::ContentAdminRepository,
    routes::auth::bearer_token,
    services::content_admin::{
        ContentAdminService, CreateActivityRequest, CreateCourseRequest, CreateLessonRequest,
        UpdateActivityRequest, UpdateCourseRequest, UpdateLessonRequest,
    },
    state::AppState,
};

pub async fn list_courses(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<Vec<AdminCourseRecord>>, ApiError> {
    let service = service(state);
    Ok(Json(service.list_courses(bearer_token(&headers)?).await?))
}

pub async fn create_course(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(request): Json<CreateCourseRequest>,
) -> Result<Json<AdminCourseRecord>, ApiError> {
    let service = service(state);
    Ok(Json(
        service
            .create_course(bearer_token(&headers)?, request)
            .await?,
    ))
}

pub async fn update_course(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(course_id): Path<String>,
    Json(request): Json<UpdateCourseRequest>,
) -> Result<Json<AdminCourseRecord>, ApiError> {
    let service = service(state);
    Ok(Json(
        service
            .update_course(bearer_token(&headers)?, &course_id, request)
            .await?,
    ))
}

pub async fn archive_course(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(course_id): Path<String>,
) -> Result<Json<AdminCourseRecord>, ApiError> {
    let service = service(state);
    Ok(Json(
        service
            .archive_course(bearer_token(&headers)?, &course_id)
            .await?,
    ))
}

pub async fn list_lessons(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(course_id): Path<String>,
) -> Result<Json<Vec<LessonSummary>>, ApiError> {
    let service = service(state);
    Ok(Json(
        service
            .list_lessons(bearer_token(&headers)?, &course_id)
            .await?,
    ))
}

pub async fn create_lesson(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(course_id): Path<String>,
    Json(request): Json<CreateLessonRequest>,
) -> Result<Json<LessonSummary>, ApiError> {
    let service = service(state);
    Ok(Json(
        service
            .create_lesson(bearer_token(&headers)?, &course_id, request)
            .await?,
    ))
}

pub async fn update_lesson(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(lesson_id): Path<String>,
    Json(request): Json<UpdateLessonRequest>,
) -> Result<Json<LessonSummary>, ApiError> {
    let service = service(state);
    Ok(Json(
        service
            .update_lesson(bearer_token(&headers)?, &lesson_id, request)
            .await?,
    ))
}

pub async fn delete_lesson(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(lesson_id): Path<String>,
) -> Result<Json<()>, ApiError> {
    let service = service(state);
    service
        .delete_lesson(bearer_token(&headers)?, &lesson_id)
        .await?;
    Ok(Json(()))
}

pub async fn list_activities(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(lesson_id): Path<String>,
) -> Result<Json<Vec<ActivitySummary>>, ApiError> {
    let service = service(state);
    Ok(Json(
        service
            .list_activities(bearer_token(&headers)?, &lesson_id)
            .await?,
    ))
}

pub async fn create_activity(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(lesson_id): Path<String>,
    Json(request): Json<CreateActivityRequest>,
) -> Result<Json<ActivitySummary>, ApiError> {
    let service = service(state);
    Ok(Json(
        service
            .create_activity(bearer_token(&headers)?, &lesson_id, request)
            .await?,
    ))
}

pub async fn update_activity(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(activity_id): Path<String>,
    Json(request): Json<UpdateActivityRequest>,
) -> Result<Json<ActivitySummary>, ApiError> {
    let service = service(state);
    Ok(Json(
        service
            .update_activity(bearer_token(&headers)?, &activity_id, request)
            .await?,
    ))
}

pub async fn delete_activity(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(activity_id): Path<String>,
) -> Result<Json<()>, ApiError> {
    let service = service(state);
    service
        .delete_activity(bearer_token(&headers)?, &activity_id)
        .await?;
    Ok(Json(()))
}

pub async fn list_assets(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<Vec<AssetSummary>>, ApiError> {
    let service = service(state);
    Ok(Json(service.list_assets(bearer_token(&headers)?).await?))
}

pub async fn check_course_publish(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(course_id): Path<String>,
) -> Result<Json<PublishCheckResponse>, ApiError> {
    let service = service(state);
    Ok(Json(
        service
            .check_course_publish(bearer_token(&headers)?, &course_id)
            .await?,
    ))
}

pub async fn list_versions(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<Vec<ContentVersionRecord>>, ApiError> {
    let service = service(state);
    Ok(Json(service.list_versions(bearer_token(&headers)?).await?))
}

fn service(state: AppState) -> ContentAdminService {
    ContentAdminService::new(ContentAdminRepository::new(state.database_url))
}
