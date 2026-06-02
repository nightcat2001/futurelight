use crate::{
    domain::{ActivitySummary, CourseDetail, CourseSummary, LessonSummary},
    errors::ApiError,
    repositories::courses::{CourseRepository, CourseSelection},
};

pub struct CourseService {
    repository: CourseRepository,
}

impl CourseService {
    pub fn new(repository: CourseRepository) -> Self {
        Self { repository }
    }

    pub async fn list_courses(
        &self,
        selection: CourseSelection<'_>,
    ) -> Result<Vec<CourseSummary>, ApiError> {
        let selection = validate_selection(selection)?;
        self.repository
            .list_courses(selection)
            .await
            .map_err(map_database_error)
    }

    pub async fn get_course(
        &self,
        course_slug: &str,
        selection: CourseSelection<'_>,
    ) -> Result<CourseDetail, ApiError> {
        let selection = validate_selection(selection)?;
        self.repository
            .get_course(course_slug, selection)
            .await
            .map_err(map_database_error)?
            .ok_or(ApiError::NotFound)
    }

    pub async fn list_lessons(
        &self,
        course_slug: &str,
        selection: CourseSelection<'_>,
    ) -> Result<Vec<LessonSummary>, ApiError> {
        let selection = validate_selection(selection)?;
        self.repository
            .list_lessons(course_slug, selection)
            .await
            .map_err(map_database_error)
    }

    pub async fn list_activities(
        &self,
        lesson_id: &str,
        selection: CourseSelection<'_>,
    ) -> Result<Vec<ActivitySummary>, ApiError> {
        let selection = validate_selection(selection)?;
        self.repository
            .list_activities(lesson_id, selection)
            .await
            .map_err(map_database_error)
    }
}

fn validate_selection<'a>(selection: CourseSelection<'a>) -> Result<CourseSelection<'a>, ApiError> {
    if let Some(market_region) = selection.market_region {
        match market_region {
            "DE" | "UK" | "US" | "TW" | "OTHER" => {}
            _ => return Err(ApiError::BadRequest("invalid_market_region")),
        }
    }

    if let Some(english_variant) = selection.english_variant {
        match english_variant {
            "american" | "british" => {}
            _ => return Err(ApiError::BadRequest("invalid_english_variant")),
        }
    }

    Ok(selection)
}

fn map_database_error(error: tokio_postgres::Error) -> ApiError {
    tracing::error!(%error, "course repository error");
    ApiError::DatabaseUnavailable
}
