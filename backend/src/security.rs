use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
    time::{Duration, Instant},
};

use axum::{
    body::Body,
    extract::State,
    http::{
        HeaderMap, HeaderValue, Method, Request,
        header::{AUTHORIZATION, CONTENT_TYPE, ORIGIN},
    },
    middleware::Next,
    response::Response,
};
use sha2::{Digest, Sha256};
use tower_http::cors::{AllowOrigin, CorsLayer};

use crate::{errors::ApiError, state::AppState};

const DEFAULT_ALLOWED_ORIGINS: &[&str] = &["http://127.0.0.1:37173", "http://localhost:37173"];
const DEFAULT_RATE_LIMIT_WINDOW_SECONDS: u64 = 60;
const DEFAULT_RATE_LIMIT_MAX_REQUESTS: usize = 240;
const DEFAULT_AUTH_RATE_LIMIT_MAX_REQUESTS: usize = 30;

#[derive(Clone, Debug)]
pub struct SecurityConfig {
    allowed_origins: Arc<Vec<String>>,
    rate_limit_window: Duration,
    rate_limit_max_requests: usize,
    auth_rate_limit_max_requests: usize,
}

#[derive(Clone)]
pub struct SecurityState {
    config: SecurityConfig,
    buckets: Arc<Mutex<HashMap<String, RateBucket>>>,
}

#[derive(Debug)]
struct RateBucket {
    count: usize,
    window_started: Instant,
}

impl SecurityConfig {
    pub fn new(
        allowed_origins: Vec<String>,
        rate_limit_window: Duration,
        rate_limit_max_requests: usize,
        auth_rate_limit_max_requests: usize,
    ) -> Self {
        let allowed_origins = if allowed_origins.is_empty() {
            DEFAULT_ALLOWED_ORIGINS
                .iter()
                .map(|origin| (*origin).to_string())
                .collect()
        } else {
            allowed_origins
        };

        Self {
            allowed_origins: Arc::new(allowed_origins),
            rate_limit_window,
            rate_limit_max_requests,
            auth_rate_limit_max_requests,
        }
    }

    pub fn local_dev() -> Self {
        Self::new(
            DEFAULT_ALLOWED_ORIGINS
                .iter()
                .map(|origin| (*origin).to_string())
                .collect(),
            Duration::from_secs(DEFAULT_RATE_LIMIT_WINDOW_SECONDS),
            DEFAULT_RATE_LIMIT_MAX_REQUESTS,
            DEFAULT_AUTH_RATE_LIMIT_MAX_REQUESTS,
        )
    }

    pub fn allowed_origins(&self) -> &[String] {
        &self.allowed_origins
    }
}

impl Default for SecurityConfig {
    fn default() -> Self {
        Self::local_dev()
    }
}

impl SecurityState {
    pub fn new(config: SecurityConfig) -> Self {
        Self {
            config,
            buckets: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub fn cors_layer(&self) -> CorsLayer {
        let origins = self
            .config
            .allowed_origins()
            .iter()
            .filter_map(|origin| origin.parse::<HeaderValue>().ok())
            .collect::<Vec<_>>();

        CorsLayer::new()
            .allow_origin(AllowOrigin::list(origins))
            .allow_methods([Method::GET, Method::POST, Method::PATCH, Method::DELETE])
            .allow_headers([AUTHORIZATION, CONTENT_TYPE])
    }

    fn is_allowed_origin(&self, origin: &str) -> bool {
        self.config
            .allowed_origins()
            .iter()
            .any(|allowed| allowed == origin)
    }

    fn check_rate_limit(&self, request: &Request<Body>) -> Result<(), ApiError> {
        let path = request.uri().path();
        let is_auth_write = matches!(path, "/api/auth/login" | "/api/auth/register");
        let max_requests = if is_auth_write {
            self.config.auth_rate_limit_max_requests
        } else {
            self.config.rate_limit_max_requests
        };
        let key = rate_limit_key(request.headers(), path, is_auth_write);
        let now = Instant::now();
        let mut buckets = self.buckets.lock().map_err(|_| ApiError::Internal)?;

        buckets.retain(|_, bucket| {
            now.duration_since(bucket.window_started) <= self.config.rate_limit_window
        });
        let bucket = buckets.entry(key).or_insert_with(|| RateBucket {
            count: 0,
            window_started: now,
        });

        if now.duration_since(bucket.window_started) > self.config.rate_limit_window {
            bucket.count = 0;
            bucket.window_started = now;
        }

        if bucket.count >= max_requests {
            return Err(ApiError::TooManyRequests("rate_limited"));
        }

        bucket.count += 1;
        Ok(())
    }
}

pub async fn enforce_security(
    State(state): State<AppState>,
    request: Request<Body>,
    next: Next,
) -> Result<Response, ApiError> {
    if is_state_changing(request.method())
        && let Some(origin) = request.headers().get(ORIGIN)
    {
        let origin = origin
            .to_str()
            .map_err(|_| ApiError::Forbidden("origin_not_allowed"))?;
        if !state.security.is_allowed_origin(origin) {
            return Err(ApiError::Forbidden("origin_not_allowed"));
        }
    }

    if should_rate_limit(request.method(), request.uri().path()) {
        state.security.check_rate_limit(&request)?;
    }

    Ok(next.run(request).await)
}

fn is_state_changing(method: &Method) -> bool {
    matches!(
        method,
        &Method::POST | &Method::PATCH | &Method::PUT | &Method::DELETE
    )
}

fn should_rate_limit(method: &Method, path: &str) -> bool {
    path.starts_with("/api/") && (*method != Method::GET || path.starts_with("/api/auth/"))
}

fn rate_limit_key(headers: &HeaderMap, path: &str, is_auth_write: bool) -> String {
    let scope = if is_auth_write { "auth" } else { "api" };
    let identity = headers
        .get("x-forwarded-for")
        .and_then(|value| value.to_str().ok())
        .and_then(|value| value.split(',').next())
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .or_else(|| {
            headers
                .get("x-real-ip")
                .and_then(|value| value.to_str().ok())
        })
        .or_else(|| {
            headers
                .get(AUTHORIZATION)
                .and_then(|value| value.to_str().ok())
        })
        .unwrap_or("local");

    format!("{scope}:{path}:{}", short_hash(identity))
}

fn short_hash(value: &str) -> String {
    let digest = Sha256::digest(value.as_bytes());
    digest
        .iter()
        .take(8)
        .map(|byte| format!("{byte:02x}"))
        .collect()
}
