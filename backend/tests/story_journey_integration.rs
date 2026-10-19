use std::time::{SystemTime, UNIX_EPOCH};

use backend::{
    errors::ApiError,
    migrations,
    repositories::{
        auth::ParentAuthRepository, children::ChildRepository, privacy::PrivacyRepository,
        stories::StoryRepository,
    },
    services::{
        auth::{AuthService, RegisterRequest},
        children::{ChildService, CreateChildRequest},
        privacy::{CreateConsentRequest, PrivacyService},
        stories::{StartStorySessionRequest, StoryService, UpdateStoryProgressRequest},
    },
};
use serde_json::json;
use tokio_postgres::NoTls;

const DATABASE_URL: &str = "postgres://futurelight:futurelight@localhost:37432/futurelight";

#[tokio::test]
async fn story_recommendation_progress_completion_and_family_task_persist() {
    let database_url = std::env::var("DATABASE_URL").unwrap_or_else(|_| DATABASE_URL.to_string());
    migrations::run_migrations(&database_url)
        .await
        .expect("migrations run");

    let email = format!("story-{}@futurelight.test", unique_suffix());
    let auth = AuthService::new(ParentAuthRepository::new(database_url.clone()));
    let children = ChildService::new(ChildRepository::new(database_url.clone()));
    let privacy = PrivacyService::new(PrivacyRepository::new(database_url.clone()));
    let stories = StoryService::new(StoryRepository::new(database_url.clone()));

    let parent = auth
        .register(RegisterRequest {
            email: email.clone(),
            password: "correct horse battery staple".to_string(),
            display_name: "Story Test Parent".to_string(),
            locale: Some("zh-TW".to_string()),
        })
        .await
        .expect("register parent")
        .parent;

    let child = children
        .create(
            &parent.id,
            CreateChildRequest {
                display_name: "小光".to_string(),
                age_band: "3-4".to_string(),
                market_region: "US".to_string(),
                english_variant: "american".to_string(),
                avatar_asset_id: None,
            },
        )
        .await
        .expect("create child");

    let recommendations = stories
        .recommendations(&parent.id, &child.id, "standard")
        .await
        .expect("recommend stories");
    assert!(!recommendations.is_empty());
    assert!(
        recommendations
            .iter()
            .all(|story| story.min_age <= 4 && story.max_age >= 3)
    );
    let story = recommendations.first().expect("first story");

    let detail = stories
        .story_detail(&parent.id, &child.id, &story.id)
        .await
        .expect("story detail");
    let page_count = detail.pages.as_array().expect("story pages array").len();
    assert!(page_count >= 2);

    let blocked_session = stories
        .start_session(
            &parent.id,
            StartStorySessionRequest {
                child_id: child.id.clone(),
                story_id: story.id.clone(),
                mode: "standard".to_string(),
            },
        )
        .await;
    match blocked_session {
        Err(ApiError::BadRequest("parental_consent_required")) => {}
        other => panic!("expected parental consent guard, got {other:?}"),
    }

    let consent = privacy
        .create_consent(
            &parent.id,
            CreateConsentRequest {
                child_id: Some(child.id.clone()),
                consent_type: "parental_privacy".to_string(),
                evidence: Some(json!({ "source": "story-integration-test" })),
            },
        )
        .await
        .expect("create parental consent");
    assert_eq!(consent.status, "granted");

    let session = stories
        .start_session(
            &parent.id,
            StartStorySessionRequest {
                child_id: child.id.clone(),
                story_id: story.id.clone(),
                mode: "standard".to_string(),
            },
        )
        .await
        .expect("start story session");

    let premature = stories.complete_session(&parent.id, &session.id).await;
    match premature {
        Err(ApiError::BadRequest("story_not_on_last_page")) => {}
        other => panic!("expected last-page guard, got {other:?}"),
    }

    let final_progress = stories
        .update_progress(
            &parent.id,
            &session.id,
            UpdateStoryProgressRequest {
                current_page: (page_count - 1) as i32,
            },
        )
        .await
        .expect("persist final page");
    assert_eq!(final_progress.current_page, (page_count - 1) as i32);

    let completed = stories
        .complete_session(&parent.id, &session.id)
        .await
        .expect("complete story");
    assert!(completed.completed_at.is_some());

    let task = stories
        .daily_task(&parent.id, &child.id)
        .await
        .expect("daily family task");
    assert!(!task.completed_today);
    let completed_task = stories
        .complete_daily_task(&parent.id, &task.id, &child.id)
        .await
        .expect("complete family task");
    assert!(completed_task.completed_today);

    let stored_task = stories
        .daily_task(&parent.id, &child.id)
        .await
        .expect("reload daily family task");
    assert!(stored_task.completed_today);

    cleanup_parent(&database_url, &email).await;
}

fn unique_suffix() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("system clock after unix epoch")
        .as_nanos()
}

async fn cleanup_parent(database_url: &str, email: &str) {
    let (client, connection) = tokio_postgres::connect(database_url, NoTls)
        .await
        .expect("connect for cleanup");
    tokio::spawn(async move {
        let _ = connection.await;
    });
    client
        .execute("DELETE FROM parent_accounts WHERE email = $1", &[&email])
        .await
        .expect("cleanup parent");
}
