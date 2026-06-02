use std::time::Duration;

use axum::{
    body::Body,
    http::{
        Request, StatusCode,
        header::{CONTENT_TYPE, ORIGIN},
    },
};
use backend::{routes, security::SecurityConfig, state::AppState};
use tower::ServiceExt;

const DEFAULT_DATABASE_URL: &str = "postgres://futurelight:futurelight@localhost:37432/futurelight";

#[tokio::test]
async fn rejects_state_changing_requests_from_untrusted_origins() {
    let app = test_app(30);

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/auth/login")
                .header(ORIGIN, "https://evil.example")
                .header(CONTENT_TYPE, "application/json")
                .body(login_body())
                .expect("request"),
        )
        .await
        .expect("response");

    assert_eq!(response.status(), StatusCode::FORBIDDEN);
}

#[tokio::test]
async fn allows_configured_origins_and_applies_auth_rate_limit() {
    let app = test_app(2);

    for _ in 0..2 {
        let response = app
            .clone()
            .oneshot(allowed_login_request())
            .await
            .expect("response");
        assert_ne!(response.status(), StatusCode::FORBIDDEN);
        assert_ne!(response.status(), StatusCode::TOO_MANY_REQUESTS);
    }

    let limited = app
        .oneshot(allowed_login_request())
        .await
        .expect("limited response");
    assert_eq!(limited.status(), StatusCode::TOO_MANY_REQUESTS);
}

fn test_app(auth_rate_limit_max_requests: usize) -> axum::Router {
    let security = SecurityConfig::new(
        vec!["http://127.0.0.1:37173".to_string()],
        Duration::from_secs(60),
        100,
        auth_rate_limit_max_requests,
    );
    routes::app_router(AppState::new(DEFAULT_DATABASE_URL.to_string(), security))
}

fn allowed_login_request() -> Request<Body> {
    Request::builder()
        .method("POST")
        .uri("/api/auth/login")
        .header(ORIGIN, "http://127.0.0.1:37173")
        .header(CONTENT_TYPE, "application/json")
        .body(login_body())
        .expect("request")
}

fn login_body() -> Body {
    Body::from(r#"{"email":"bad","password":"correct horse battery staple"}"#)
}
