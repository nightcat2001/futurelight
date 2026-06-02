use std::time::{SystemTime, UNIX_EPOCH};

use backend::{
    errors::ApiError,
    migrations,
    repositories::{
        auth::ParentAuthRepository,
        children::ChildRepository,
        content_admin::ContentAdminRepository,
        courses::{CourseRepository, CourseSelection},
        privacy::PrivacyRepository,
        progress::ProgressRepository,
    },
    services::{
        auth::{AuthService, LoginRequest, RegisterRequest, UpdateParentRequest},
        children::{ChildService, CreateChildRequest},
        content_admin::{
            ContentAdminService, CreateActivityRequest, CreateCourseRequest, CreateLessonRequest,
            UpdateActivityRequest, UpdateCourseRequest, UpdateLessonRequest,
        },
        courses::CourseService,
        privacy::{CreateConsentRequest, DataExportRequest, PrivacyService},
        progress::{ProgressService, RecordAttemptRequest, StartSessionRequest},
    },
};
use serde_json::json;
use tokio_postgres::{Client, NoTls};

const DEFAULT_DATABASE_URL: &str = "postgres://futurelight:futurelight@localhost:37432/futurelight";
const MISSING_UUID: &str = "00000000-0000-0000-0000-000000000000";

#[tokio::test]
async fn parent_child_learning_and_privacy_flow_persists_and_rejects_invalid_access() {
    let database_url =
        std::env::var("DATABASE_URL").unwrap_or_else(|_| DEFAULT_DATABASE_URL.to_string());
    migrations::run_migrations(&database_url)
        .await
        .expect("migrations run");

    let suffix = unique_suffix();
    let primary_email = format!("integration-{suffix}@futurelight.test");
    let secondary_email = format!("integration-other-{suffix}@futurelight.test");
    cleanup_parent(&database_url, &primary_email).await;
    cleanup_parent(&database_url, &secondary_email).await;
    let cms_slug = format!("cms-course-{suffix}");
    cleanup_course_by_slug(&database_url, &cms_slug).await;

    let auth = AuthService::new(ParentAuthRepository::new(database_url.clone()));
    let children = ChildService::new(ChildRepository::new(database_url.clone()));
    let content_admin = ContentAdminService::new(ContentAdminRepository::new(database_url.clone()));
    let courses = CourseService::new(CourseRepository::new(database_url.clone()));
    let progress = ProgressService::new(ProgressRepository::new(database_url.clone()));
    let privacy = PrivacyService::new(PrivacyRepository::new(database_url.clone()));

    let registered = auth
        .register(RegisterRequest {
            email: primary_email.clone(),
            password: "correct horse battery staple".to_string(),
            display_name: "Integration Parent".to_string(),
            locale: Some("en-US".to_string()),
        })
        .await
        .expect("register parent");

    let duplicate = auth
        .register(RegisterRequest {
            email: primary_email.clone(),
            password: "correct horse battery staple".to_string(),
            display_name: "Integration Parent".to_string(),
            locale: Some("en-US".to_string()),
        })
        .await;
    expect_conflict(duplicate, "parent_account_exists");

    let bad_login = auth
        .login(LoginRequest {
            email: primary_email.clone(),
            password: "wrong password".to_string(),
        })
        .await;
    expect_unauthorized(bad_login);

    let logged_in = auth
        .login(LoginRequest {
            email: primary_email.clone(),
            password: "correct horse battery staple".to_string(),
        })
        .await
        .expect("login parent");
    let me = auth.me(&logged_in.session.token).await.expect("me");
    assert_eq!(me.parent.id, registered.parent.id);

    let updated_parent = auth
        .update_parent(
            &logged_in.session.token,
            UpdateParentRequest {
                display_name: Some("Updated Integration Parent".to_string()),
                locale: Some("en-GB".to_string()),
                sound_enabled: Some(false),
                voice_volume: Some(72),
                effect_volume: Some(44),
                auto_play_voice: Some(false),
            },
        )
        .await
        .expect("update parent settings");
    assert_eq!(
        updated_parent.parent.display_name,
        "Updated Integration Parent"
    );
    assert_eq!(updated_parent.parent.locale, "en-GB");
    assert!(!updated_parent.parent.sound_enabled);
    assert_eq!(updated_parent.parent.voice_volume, 72);
    assert_eq!(updated_parent.parent.effect_volume, 44);
    assert!(!updated_parent.parent.auto_play_voice);

    let denied_admin_courses = content_admin.list_courses(&logged_in.session.token).await;
    expect_forbidden(denied_admin_courses, "content_admin_required");
    promote_content_admin(&database_url, &registered.parent.id).await;

    let assets = content_admin
        .list_assets(&logged_in.session.token)
        .await
        .expect("list cms assets");
    let cover_asset = assets
        .iter()
        .find(|asset| asset.asset_key == "course_cover_color_english_words")
        .expect("generated color cover asset");

    let cms_course = content_admin
        .create_course(
            &logged_in.session.token,
            CreateCourseRequest {
                slug: cms_slug.clone(),
                title: "CMS Integration Course".to_string(),
                target_language: "en".to_string(),
                level: "starter".to_string(),
                status: Some("draft".to_string()),
                cover_asset_id: Some(cover_asset.id.clone()),
                sort_order: Some(9000),
            },
        )
        .await
        .expect("create cms course");
    assert_eq!(cms_course.slug, cms_slug);
    assert_eq!(
        cms_course.cover_asset_id.as_deref(),
        Some(cover_asset.id.as_str())
    );

    let updated_cms_course = content_admin
        .update_course(
            &logged_in.session.token,
            &cms_course.id,
            UpdateCourseRequest {
                slug: None,
                title: Some("CMS Integration Course Updated".to_string()),
                target_language: None,
                level: None,
                status: Some("review".to_string()),
                cover_asset_id: None,
                sort_order: Some(9001),
            },
        )
        .await
        .expect("update cms course");
    assert_eq!(updated_cms_course.title, "CMS Integration Course Updated");
    assert_eq!(updated_cms_course.status, "review");

    let cms_lesson = content_admin
        .create_lesson(
            &logged_in.session.token,
            &cms_course.id,
            CreateLessonRequest {
                slug: "first-cms-lesson".to_string(),
                title: "First CMS Lesson".to_string(),
                learning_objectives: Some(json!(["Review one generated card"])),
                sort_order: Some(1),
            },
        )
        .await
        .expect("create cms lesson");
    let updated_cms_lesson = content_admin
        .update_lesson(
            &logged_in.session.token,
            &cms_lesson.id,
            UpdateLessonRequest {
                slug: None,
                title: Some("First CMS Lesson Updated".to_string()),
                learning_objectives: Some(json!([
                    "Review one generated card",
                    "Record answer key"
                ])),
                sort_order: Some(2),
            },
        )
        .await
        .expect("update cms lesson");
    assert_eq!(updated_cms_lesson.sort_order, 2);

    let cms_activity = content_admin
        .create_activity(
            &logged_in.session.token,
            &cms_lesson.id,
            CreateActivityRequest {
                slug: "apple-cms-card".to_string(),
                activity_type: "word_card".to_string(),
                prompt: Some(json!({ "text": "Choose apple" })),
                content: Some(json!({ "image_asset_key": "word_card_apple" })),
                answer_key: Some(json!({ "correct_answer": "apple" })),
                sort_order: Some(1),
            },
        )
        .await
        .expect("create cms activity");
    let updated_cms_activity = content_admin
        .update_activity(
            &logged_in.session.token,
            &cms_activity.id,
            UpdateActivityRequest {
                slug: None,
                activity_type: None,
                prompt: Some(json!({ "text": "Tap the apple card" })),
                content: Some(json!({ "image_asset_key": "word_card_apple" })),
                answer_key: Some(json!({ "correct_answer": "apple" })),
                sort_order: Some(2),
            },
        )
        .await
        .expect("update cms activity");
    assert_eq!(updated_cms_activity.sort_order, 2);

    let publish_check = content_admin
        .check_course_publish(&logged_in.session.token, &cms_course.id)
        .await
        .expect("cms publish check");
    assert!(!publish_check.can_publish);
    assert!(
        publish_check
            .issues
            .iter()
            .any(|issue| issue.contains("missing audio"))
    );

    let versions = content_admin
        .list_versions(&logged_in.session.token)
        .await
        .expect("list content versions");
    assert!(
        versions
            .iter()
            .any(|version| version.entity_id == cms_course.id)
    );
    assert!(
        versions
            .iter()
            .any(|version| version.action == "publish_check")
    );

    content_admin
        .delete_activity(&logged_in.session.token, &cms_activity.id)
        .await
        .expect("delete cms activity");
    content_admin
        .delete_lesson(&logged_in.session.token, &cms_lesson.id)
        .await
        .expect("delete cms lesson");
    let archived_cms_course = content_admin
        .archive_course(&logged_in.session.token, &cms_course.id)
        .await
        .expect("archive cms course");
    assert_eq!(archived_cms_course.status, "archived");

    let other_parent = auth
        .register(RegisterRequest {
            email: secondary_email.clone(),
            password: "correct horse battery staple".to_string(),
            display_name: "Other Parent".to_string(),
            locale: Some("en-US".to_string()),
        })
        .await
        .expect("register secondary parent")
        .parent;

    let invalid_child = children
        .create(
            &registered.parent.id,
            CreateChildRequest {
                display_name: "Ari".to_string(),
                age_band: "12-14".to_string(),
                market_region: "US".to_string(),
                english_variant: "american".to_string(),
                avatar_asset_id: None,
            },
        )
        .await;
    expect_bad_request(invalid_child, "invalid_age_band");

    let child = children
        .create(
            &registered.parent.id,
            CreateChildRequest {
                display_name: "Ari".to_string(),
                age_band: "6-8".to_string(),
                market_region: "US".to_string(),
                english_variant: "american".to_string(),
                avatar_asset_id: None,
            },
        )
        .await
        .expect("create child");
    assert_eq!(child.parent_account_id, registered.parent.id);

    let child_list = children
        .list(&registered.parent.id)
        .await
        .expect("list children");
    assert!(child_list.iter().any(|item| item.id == child.id));

    let cross_parent_child_read = children.get(&other_parent.id, &child.id).await;
    expect_not_found(cross_parent_child_read);

    let course_list = courses
        .list_courses(CourseSelection::default())
        .await
        .expect("list courses");
    for required_slug in [
        "animal-english-words",
        "color-english-words",
        "number-english-words",
        "family-english-words",
        "food-english-words",
        "daily-greetings-english",
    ] {
        assert!(
            course_list
                .iter()
                .any(|course| course.slug == required_slug),
            "missing required seed course: {required_slug}"
        );
    }

    let course = courses
        .get_course("animal-english-words", CourseSelection::default())
        .await
        .expect("get course");
    let color_course = courses
        .get_course("color-english-words", CourseSelection::default())
        .await
        .expect("get color course");
    assert_eq!(
        color_course.cover_asset_path.as_deref(),
        Some("assets/images/course-covers/color-english-words-cover.png")
    );
    let missing_course = courses
        .get_course("missing-course", CourseSelection::default())
        .await;
    expect_not_found(missing_course);

    let lessons = courses
        .list_lessons("animal-english-words", CourseSelection::default())
        .await
        .expect("list lessons");
    assert!(!lessons.is_empty());
    let lesson = lessons.first().expect("seed lesson");

    let activities = courses
        .list_activities(&lesson.id, CourseSelection::default())
        .await
        .expect("list activities");
    assert!(!activities.is_empty());
    let activity = activities.first().expect("seed activity");
    let food_lesson = courses
        .list_lessons("food-english-words", CourseSelection::default())
        .await
        .expect("list food lessons")
        .into_iter()
        .find(|lesson| lesson.slug == "favorite-foods")
        .expect("favorite foods lesson");
    let apple_activity = courses
        .list_activities(&food_lesson.id, CourseSelection::default())
        .await
        .expect("list food activities")
        .into_iter()
        .find(|activity| activity.slug == "apple-word")
        .expect("apple word activity");
    assert_eq!(
        apple_activity.content["image_asset_key"].as_str(),
        Some("word_card_apple")
    );

    let invalid_market_selection = courses
        .list_courses(CourseSelection {
            market_region: Some("JP"),
            english_variant: Some("american"),
        })
        .await;
    expect_bad_request(invalid_market_selection, "invalid_market_region");

    let invalid_variant_selection = courses
        .list_courses(CourseSelection {
            market_region: Some("US"),
            english_variant: Some("canadian"),
        })
        .await;
    expect_bad_request(invalid_variant_selection, "invalid_english_variant");

    let us_courses = courses
        .list_courses(CourseSelection {
            market_region: Some("US"),
            english_variant: Some("american"),
        })
        .await
        .expect("list US American courses");
    assert!(
        us_courses
            .iter()
            .any(|course| course.slug == "color-english-words")
    );
    assert!(us_courses.iter().all(|course| {
        course.market_regions.iter().any(|region| region == "US")
            && course
                .english_variants
                .iter()
                .any(|variant| variant == "american")
    }));

    let color_lesson = courses
        .list_lessons(
            "color-english-words",
            CourseSelection {
                market_region: Some("UK"),
                english_variant: Some("british"),
            },
        )
        .await
        .expect("list UK colour lessons")
        .into_iter()
        .find(|lesson| lesson.slug == "bright-colors")
        .expect("bright colors lesson");
    let british_blue = courses
        .list_activities(
            &color_lesson.id,
            CourseSelection {
                market_region: Some("UK"),
                english_variant: Some("british"),
            },
        )
        .await
        .expect("list UK colour activities")
        .into_iter()
        .find(|activity| activity.slug == "blue-word")
        .expect("blue word activity");
    assert_eq!(
        british_blue.content["spelling_word"].as_str(),
        Some("colour")
    );
    assert_eq!(
        british_blue.prompt["instruction"].as_str(),
        Some("Look and say the colour")
    );

    let american_blue = courses
        .list_activities(
            &color_lesson.id,
            CourseSelection {
                market_region: Some("US"),
                english_variant: Some("american"),
            },
        )
        .await
        .expect("list US color activities")
        .into_iter()
        .find(|activity| activity.slug == "blue-word")
        .expect("blue word activity");
    assert_eq!(
        american_blue.content["spelling_word"].as_str(),
        Some("color")
    );

    let greeting_lesson = courses
        .list_lessons(
            "daily-greetings-english",
            CourseSelection {
                market_region: Some("US"),
                english_variant: Some("american"),
            },
        )
        .await
        .expect("list greeting lessons")
        .into_iter()
        .find(|lesson| lesson.slug == "hello-goodbye")
        .expect("hello goodbye lesson");
    let us_greeting_activities = courses
        .list_activities(
            &greeting_lesson.id,
            CourseSelection {
                market_region: Some("US"),
                english_variant: Some("american"),
            },
        )
        .await
        .expect("list US greeting activities");
    let de_greeting_activities = courses
        .list_activities(
            &greeting_lesson.id,
            CourseSelection {
                market_region: Some("DE"),
                english_variant: Some("american"),
            },
        )
        .await
        .expect("list DE greeting activities");
    assert!(
        us_greeting_activities
            .iter()
            .any(|activity| activity.slug == "please-word")
    );
    assert!(
        !de_greeting_activities
            .iter()
            .any(|activity| activity.slug == "please-word")
    );

    let no_consent_session = progress
        .start_session(
            &registered.parent.id,
            StartSessionRequest {
                child_id: child.id.clone(),
                course_id: course.id.clone(),
                lesson_id: Some(lesson.id.clone()),
            },
        )
        .await;
    expect_bad_request(no_consent_session, "parental_consent_required");

    let missing_consent = privacy
        .create_consent(
            &registered.parent.id,
            CreateConsentRequest {
                child_id: Some(MISSING_UUID.to_string()),
                consent_type: "parental_privacy".to_string(),
                evidence: Some(json!({ "source": "integration-test" })),
            },
        )
        .await;
    expect_not_found(missing_consent);

    let consent = privacy
        .create_consent(
            &registered.parent.id,
            CreateConsentRequest {
                child_id: Some(child.id.clone()),
                consent_type: "parental_privacy".to_string(),
                evidence: Some(json!({ "source": "integration-test" })),
            },
        )
        .await
        .expect("create consent");
    assert_eq!(consent.status, "granted");

    let consents = privacy
        .list_consents(&registered.parent.id)
        .await
        .expect("list consents");
    assert!(consents.iter().any(|item| item.id == consent.id));

    let wrong_parent_session = progress
        .start_session(
            &other_parent.id,
            StartSessionRequest {
                child_id: child.id.clone(),
                course_id: course.id.clone(),
                lesson_id: Some(lesson.id.clone()),
            },
        )
        .await;
    expect_not_found(wrong_parent_session);

    let session = progress
        .start_session(
            &registered.parent.id,
            StartSessionRequest {
                child_id: child.id.clone(),
                course_id: course.id.clone(),
                lesson_id: Some(lesson.id.clone()),
            },
        )
        .await
        .expect("start learning session");

    let invalid_score = progress
        .record_attempt(
            &registered.parent.id,
            RecordAttemptRequest {
                child_id: child.id.clone(),
                activity_id: activity.id.clone(),
                session_id: Some(session.id.clone()),
                answer: json!({ "choice": "lion" }),
                is_correct: true,
                score: Some(101.0),
                duration_ms: Some(1200),
            },
        )
        .await;
    expect_bad_request(invalid_score, "invalid_score");

    let attempt = progress
        .record_attempt(
            &registered.parent.id,
            RecordAttemptRequest {
                child_id: child.id.clone(),
                activity_id: activity.id.clone(),
                session_id: Some(session.id.clone()),
                answer: json!({ "choice": "lion" }),
                is_correct: true,
                score: Some(100.0),
                duration_ms: Some(1200),
            },
        )
        .await
        .expect("record attempt");
    assert_eq!(attempt.child_id, child.id);
    assert_eq!(attempt.activity_id, activity.id);
    assert!(attempt.is_correct);

    let progress_rows = progress
        .list_child_progress(&registered.parent.id, &child.id)
        .await
        .expect("list progress");
    assert_eq!(progress_rows.len(), 1);
    assert_eq!(progress_rows[0].attempts_count, 1);
    assert_eq!(progress_rows[0].mastery_score, 100.0);

    let rewards = progress
        .list_child_rewards(&registered.parent.id, &child.id)
        .await
        .expect("list rewards");
    assert_eq!(rewards.len(), 1);
    assert_eq!(rewards[0].reward_type, "activity_mastery");

    let completed_session = progress
        .complete_session(&registered.parent.id, &session.id)
        .await
        .expect("complete learning session");
    assert!(completed_session.completed_at.is_some());

    let revoked = privacy
        .revoke_consent(&registered.parent.id, &consent.id)
        .await
        .expect("revoke consent");
    assert_eq!(revoked.status, "revoked");
    assert!(revoked.revoked_at.is_some());

    let export = privacy
        .request_data_export(
            &registered.parent.id,
            DataExportRequest {
                child_id: Some(child.id.clone()),
            },
        )
        .await
        .expect("generate data export");
    assert_eq!(export.audit_log.action, "data_export_generated");
    assert_eq!(export.package.export_format_version, 1);
    assert_eq!(
        export.package.scope.child_id.as_deref(),
        Some(child.id.as_str())
    );
    assert_eq!(export.package.parent.email, primary_email);
    assert_eq!(export.package.children.len(), 1);
    assert_eq!(export.package.consents.len(), 1);
    assert_eq!(export.package.learning_sessions.len(), 1);
    assert_eq!(export.package.attempts.len(), 1);
    assert_eq!(export.package.progress_records.len(), 1);
    assert_eq!(export.package.rewards.len(), 1);

    let wrong_parent_export = privacy
        .request_data_export(
            &other_parent.id,
            DataExportRequest {
                child_id: Some(child.id.clone()),
            },
        )
        .await;
    expect_not_found(wrong_parent_export);

    let wrong_parent_delete = privacy.delete_child_data(&other_parent.id, &child.id).await;
    expect_not_found(wrong_parent_delete);

    let delete_audit = privacy
        .delete_child_data(&registered.parent.id, &child.id)
        .await
        .expect("delete child data");
    assert_eq!(delete_audit.action, "child_data_deleted");

    let deleted_child_lookup = children.get(&registered.parent.id, &child.id).await;
    expect_not_found(deleted_child_lookup);

    let account_delete_audit = privacy
        .delete_parent_account(&registered.parent.id)
        .await
        .expect("delete parent account");
    assert_eq!(account_delete_audit.action, "parent_account_deleted");

    let deleted_parent_me = auth.me(&logged_in.session.token).await;
    expect_unauthorized(deleted_parent_me);

    cleanup_parent(&database_url, &primary_email).await;
    cleanup_audit_entities(
        &database_url,
        &[&registered.parent.id, &child.id, &consent.id],
    )
    .await;
    cleanup_parent(&database_url, &secondary_email).await;
    cleanup_course_by_slug(&database_url, &cms_slug).await;
}

fn unique_suffix() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("system clock after unix epoch")
        .as_nanos()
}

async fn cleanup_parent(database_url: &str, email: &str) {
    let client = connect(database_url).await;
    client
        .execute(
            r#"
            DELETE FROM audit_logs
            WHERE actor_parent_account_id IN (
                SELECT id FROM parent_accounts WHERE email = $1
            )
            "#,
            &[&email],
        )
        .await
        .expect("cleanup audit logs");
    client
        .execute("DELETE FROM parent_accounts WHERE email = $1", &[&email])
        .await
        .expect("cleanup parent");
}

async fn cleanup_audit_entities(database_url: &str, entity_ids: &[&str]) {
    let client = connect(database_url).await;
    for entity_id in entity_ids {
        client
            .execute(
                "DELETE FROM audit_logs WHERE entity_id = $1::text::uuid",
                &[entity_id],
            )
            .await
            .expect("cleanup detached audit logs");
    }
}

async fn promote_content_admin(database_url: &str, parent_account_id: &str) {
    let client = connect(database_url).await;
    client
        .execute(
            "UPDATE parent_accounts SET is_content_admin = true WHERE id = $1::text::uuid",
            &[&parent_account_id],
        )
        .await
        .expect("promote content admin");
}

async fn cleanup_course_by_slug(database_url: &str, slug: &str) {
    let client = connect(database_url).await;
    client
        .execute(
            r#"
            DELETE FROM content_versions
            WHERE entity_id IN (
                SELECT id FROM courses WHERE slug = $1
                UNION
                SELECT lessons.id FROM lessons
                INNER JOIN courses ON courses.id = lessons.course_id
                WHERE courses.slug = $1
                UNION
                SELECT activities.id FROM activities
                INNER JOIN lessons ON lessons.id = activities.lesson_id
                INNER JOIN courses ON courses.id = lessons.course_id
                WHERE courses.slug = $1
            )
            OR snapshot->>'slug' = $1
            "#,
            &[&slug],
        )
        .await
        .expect("cleanup content versions");
    client
        .execute("DELETE FROM courses WHERE slug = $1", &[&slug])
        .await
        .expect("cleanup cms course");
}

async fn connect(database_url: &str) -> Client {
    let (client, connection) = tokio_postgres::connect(database_url, NoTls)
        .await
        .expect("connect to postgres");
    tokio::spawn(async move {
        if let Err(error) = connection.await {
            eprintln!("postgres integration-test connection error: {error}");
        }
    });
    client
}

fn expect_bad_request<T: std::fmt::Debug>(result: Result<T, ApiError>, expected: &'static str) {
    match result {
        Err(ApiError::BadRequest(error)) => assert_eq!(error, expected),
        other => panic!("expected BadRequest({expected}), got {other:?}"),
    }
}

fn expect_conflict<T: std::fmt::Debug>(result: Result<T, ApiError>, expected: &'static str) {
    match result {
        Err(ApiError::Conflict(error)) => assert_eq!(error, expected),
        other => panic!("expected Conflict({expected}), got {other:?}"),
    }
}

fn expect_not_found<T: std::fmt::Debug>(result: Result<T, ApiError>) {
    match result {
        Err(ApiError::NotFound) => {}
        other => panic!("expected NotFound, got {other:?}"),
    }
}

fn expect_unauthorized<T: std::fmt::Debug>(result: Result<T, ApiError>) {
    match result {
        Err(ApiError::Unauthorized) => {}
        other => panic!("expected Unauthorized, got {other:?}"),
    }
}

fn expect_forbidden<T: std::fmt::Debug>(result: Result<T, ApiError>, expected: &'static str) {
    match result {
        Err(ApiError::Forbidden(error)) => assert_eq!(error, expected),
        other => panic!("expected Forbidden({expected}), got {other:?}"),
    }
}
