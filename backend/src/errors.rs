use axum::{Json, http::StatusCode, response::IntoResponse};
use serde::Serialize;

#[derive(Debug)]
pub enum ApiError {
    BadRequest(&'static str),
    Conflict(&'static str),
    DatabaseUnavailable,
    Forbidden(&'static str),
    Internal,
    NotFound,
    TooManyRequests(&'static str),
    Unauthorized,
}

#[derive(Serialize)]
struct ErrorResponse {
    error: &'static str,
}

impl IntoResponse for ApiError {
    fn into_response(self) -> axum::response::Response {
        let (status, error) = match self {
            Self::BadRequest(error) => (StatusCode::BAD_REQUEST, error),
            Self::Conflict(error) => (StatusCode::CONFLICT, error),
            Self::DatabaseUnavailable => (StatusCode::SERVICE_UNAVAILABLE, "database_unavailable"),
            Self::Forbidden(error) => (StatusCode::FORBIDDEN, error),
            Self::Internal => (StatusCode::INTERNAL_SERVER_ERROR, "internal_error"),
            Self::NotFound => (StatusCode::NOT_FOUND, "not_found"),
            Self::TooManyRequests(error) => (StatusCode::TOO_MANY_REQUESTS, error),
            Self::Unauthorized => (StatusCode::UNAUTHORIZED, "unauthorized"),
        };

        (status, Json(ErrorResponse { error })).into_response()
    }
}
