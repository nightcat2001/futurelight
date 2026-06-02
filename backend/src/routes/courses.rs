use axum::{
    Json,
    extract::{Path, Query, State},
};
use serde::Deserialize;

use crate::{
    domain::{ActivitySummary, CourseDetail, CourseSummary, LessonSummary},
    errors::ApiError,
    repositories::courses::{CourseRepository, CourseSelection},
    services::courses::CourseService,
    state::AppState,
};

#[derive(Debug, Deserialize)]
pub struct CourseQuery {
    market_region: Option<String>,
    english_variant: Option<String>,
}

impl CourseQuery {
    fn selection(&self) -> CourseSelection<'_> {
        CourseSelection {
            market_region: self.market_region.as_deref(),
            english_variant: self.english_variant.as_deref(),
        }
    }
}

pub async fn list_courses(
    State(state): State<AppState>,
    Query(query): Query<CourseQuery>,
) -> Result<Json<Vec<CourseSummary>>, ApiError> {
    let service = CourseService::new(CourseRepository::new(state.database_url));
    Ok(Json(service.list_courses(query.selection()).await?))
}

pub async fn get_course(
    State(state): State<AppState>,
    Path(course_slug): Path<String>,
    Query(query): Query<CourseQuery>,
) -> Result<Json<CourseDetail>, ApiError> {
    let service = CourseService::new(CourseRepository::new(state.database_url));
    Ok(Json(
        service.get_course(&course_slug, query.selection()).await?,
    ))
}

pub async fn list_lessons(
    State(state): State<AppState>,
    Path(course_slug): Path<String>,
    Query(query): Query<CourseQuery>,
) -> Result<Json<Vec<LessonSummary>>, ApiError> {
    let service = CourseService::new(CourseRepository::new(state.database_url));
    Ok(Json(
        service
            .list_lessons(&course_slug, query.selection())
            .await?,
    ))
}

pub async fn list_activities(
    State(state): State<AppState>,
    Path(lesson_id): Path<String>,
    Query(query): Query<CourseQuery>,
) -> Result<Json<Vec<ActivitySummary>>, ApiError> {
    let service = CourseService::new(CourseRepository::new(state.database_url));
    Ok(Json(
        service
            .list_activities(&lesson_id, query.selection())
            .await?,
    ))
}
