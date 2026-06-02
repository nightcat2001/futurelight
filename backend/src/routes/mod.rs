use axum::{Router, middleware, routing::get};

use crate::{security, state::AppState};

pub mod auth;
pub mod children;
pub mod content_admin;
pub mod courses;
pub mod health;
pub mod pages;
pub mod privacy;
pub mod progress;
pub mod support;

pub fn router(state: AppState) -> Router {
    Router::new()
        .route("/health", get(health::health))
        .route("/api/health/db", get(health::db_health))
        .route("/api/auth/register", axum::routing::post(auth::register))
        .route("/api/auth/login", axum::routing::post(auth::login))
        .route("/api/auth/me", get(auth::me).patch(auth::update_me))
        .route("/api/auth/logout", axum::routing::post(auth::logout))
        .route(
            "/api/children",
            get(children::list_children).post(children::create_child),
        )
        .route(
            "/api/children/{child_id}",
            get(children::get_child)
                .patch(children::update_child)
                .delete(children::delete_child),
        )
        .route("/api/courses", get(courses::list_courses))
        .route("/api/courses/{course_slug}", get(courses::get_course))
        .route(
            "/api/courses/{course_slug}/lessons",
            get(courses::list_lessons),
        )
        .route(
            "/api/lessons/{lesson_id}/activities",
            get(courses::list_activities),
        )
        .route(
            "/api/admin/courses",
            get(content_admin::list_courses).post(content_admin::create_course),
        )
        .route(
            "/api/admin/courses/{course_id}",
            axum::routing::patch(content_admin::update_course)
                .delete(content_admin::archive_course),
        )
        .route(
            "/api/admin/courses/{course_id}/lessons",
            get(content_admin::list_lessons).post(content_admin::create_lesson),
        )
        .route(
            "/api/admin/courses/{course_id}/publish-check",
            axum::routing::post(content_admin::check_course_publish),
        )
        .route(
            "/api/admin/lessons/{lesson_id}",
            axum::routing::patch(content_admin::update_lesson).delete(content_admin::delete_lesson),
        )
        .route(
            "/api/admin/lessons/{lesson_id}/activities",
            get(content_admin::list_activities).post(content_admin::create_activity),
        )
        .route(
            "/api/admin/activities/{activity_id}",
            axum::routing::patch(content_admin::update_activity)
                .delete(content_admin::delete_activity),
        )
        .route("/api/admin/assets", get(content_admin::list_assets))
        .route(
            "/api/admin/content-versions",
            get(content_admin::list_versions),
        )
        .route(
            "/api/learning/sessions",
            axum::routing::post(progress::start_session),
        )
        .route(
            "/api/learning/sessions/{session_id}/complete",
            axum::routing::patch(progress::complete_session),
        )
        .route(
            "/api/learning/attempts",
            axum::routing::post(progress::record_attempt),
        )
        .route(
            "/api/children/{child_id}/progress",
            get(progress::list_child_progress),
        )
        .route(
            "/api/children/{child_id}/rewards",
            get(progress::list_child_rewards),
        )
        .route(
            "/api/privacy/consents",
            get(privacy::list_consents).post(privacy::create_consent),
        )
        .route(
            "/api/privacy/consents/{consent_id}/revoke",
            axum::routing::post(privacy::revoke_consent),
        )
        .route(
            "/api/privacy/data-export-requests",
            get(privacy::list_data_export_requests).post(privacy::request_data_export),
        )
        .route(
            "/api/privacy/parent-account",
            axum::routing::delete(privacy::delete_parent_account),
        )
        .route(
            "/api/privacy/children/{child_id}",
            axum::routing::delete(privacy::delete_child_data),
        )
        .route("/api/pages", get(pages::pages))
        .route("/api/home/summary", get(pages::home_summary))
        .route(
            "/api/support/requests",
            get(support::list_requests).post(support::create_request),
        )
        .with_state(state)
}

pub fn app_router(state: AppState) -> Router {
    router(state.clone())
        .layer(middleware::from_fn_with_state(
            state.clone(),
            security::enforce_security,
        ))
        .layer(state.security.cors_layer())
}
