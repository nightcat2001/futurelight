use axum::{Json, Router, extract::State, http::StatusCode, response::IntoResponse, routing::get};
use serde::Serialize;
use std::{env, net::SocketAddr};
use tokio_postgres::NoTls;
use tower_http::{cors::CorsLayer, trace::TraceLayer};

#[derive(Clone)]
struct AppState {
    database_url: String,
}

#[derive(Serialize)]
struct HealthResponse {
    status: &'static str,
    service: &'static str,
}

#[derive(Serialize)]
struct DbHealthResponse {
    status: &'static str,
    database: &'static str,
}

#[derive(Serialize)]
struct PageSummary {
    id: &'static str,
    title: &'static str,
    primary_action: &'static str,
    route: &'static str,
}

#[derive(Serialize)]
struct HomeSummary {
    current_child: &'static str,
    recommendation: &'static str,
    next_action: &'static str,
    completed_units: u8,
    streak_days: u8,
    stars: u16,
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "backend=debug,tower_http=debug".into()),
        )
        .init();

    let port = env::var("PORT")
        .ok()
        .and_then(|value| value.parse::<u16>().ok())
        .unwrap_or(37200);
    let database_url = env::var("DATABASE_URL").unwrap_or_else(|_| {
        "postgres://futurelight:futurelight@localhost:37432/futurelight".to_string()
    });

    let state = AppState { database_url };
    let app = Router::new()
        .route("/health", get(health))
        .route("/api/health/db", get(db_health))
        .route("/api/pages", get(pages))
        .route("/api/home/summary", get(home_summary))
        .with_state(state)
        .layer(CorsLayer::permissive())
        .layer(TraceLayer::new_for_http());

    let addr = SocketAddr::from(([127, 0, 0, 1], port));
    tracing::info!("FutureLight backend listening on http://{addr}");

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("bind backend listener");
    axum::serve(listener, app).await.expect("serve backend");
}

async fn health() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok",
        service: "futurelight-backend",
    })
}

async fn db_health(State(state): State<AppState>) -> impl IntoResponse {
    match tokio_postgres::connect(&state.database_url, NoTls).await {
        Ok((client, connection)) => {
            tokio::spawn(async move {
                if let Err(error) = connection.await {
                    tracing::error!(%error, "postgres connection error");
                }
            });

            match client.query_one("select 1", &[]).await {
                Ok(_) => (
                    StatusCode::OK,
                    Json(DbHealthResponse {
                        status: "ok",
                        database: "postgres",
                    }),
                ),
                Err(error) => {
                    tracing::error!(%error, "postgres query failed");
                    (
                        StatusCode::SERVICE_UNAVAILABLE,
                        Json(DbHealthResponse {
                            status: "error",
                            database: "postgres",
                        }),
                    )
                }
            }
        }
        Err(error) => {
            tracing::error!(%error, "postgres connection failed");
            (
                StatusCode::SERVICE_UNAVAILABLE,
                Json(DbHealthResponse {
                    status: "error",
                    database: "postgres",
                }),
            )
        }
    }
}

async fn pages() -> Json<Vec<PageSummary>> {
    Json(vec![
        PageSummary {
            id: "home",
            title: "首頁",
            primary_action: "快速開始",
            route: "/",
        },
        PageSummary {
            id: "course-explore",
            title: "課程探索",
            primary_action: "查看詳情",
            route: "/courses",
        },
        PageSummary {
            id: "learning-player",
            title: "學習播放",
            primary_action: "我學會了",
            route: "/learn",
        },
        PageSummary {
            id: "practice-game",
            title: "練習遊戲",
            primary_action: "下一題",
            route: "/practice",
        },
        PageSummary {
            id: "rewards",
            title: "獎勵成就",
            primary_action: "查看徽章",
            route: "/rewards",
        },
    ])
}

async fn home_summary() -> Json<HomeSummary> {
    Json(HomeSummary {
        current_child: "小安",
        recommendation: "動物英文單字",
        next_action: "繼續未完成學習",
        completed_units: 8,
        streak_days: 3,
        stars: 120,
    })
}
