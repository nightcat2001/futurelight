use serde_json::{Value, json};
use tokio_postgres::{Client, NoTls, error::SqlState};

use crate::domain::{
    ActivitySummary, AdminCourseRecord, AssetSummary, ContentVersionRecord, LessonSummary,
};

#[derive(Debug)]
pub enum ContentAdminRepositoryError {
    BadRequest(&'static str),
    Conflict(&'static str),
    Database(tokio_postgres::Error),
}

impl From<tokio_postgres::Error> for ContentAdminRepositoryError {
    fn from(error: tokio_postgres::Error) -> Self {
        match error.code() {
            Some(code) if *code == SqlState::UNIQUE_VIOLATION => {
                Self::Conflict("content_slug_exists")
            }
            Some(code) if *code == SqlState::FOREIGN_KEY_VIOLATION => {
                Self::BadRequest("invalid_reference")
            }
            Some(code) if *code == SqlState::INVALID_TEXT_REPRESENTATION => {
                Self::BadRequest("invalid_id")
            }
            Some(code) if *code == SqlState::CHECK_VIOLATION => {
                Self::BadRequest("invalid_content_state")
            }
            _ => Self::Database(error),
        }
    }
}

pub struct ContentAdminRepository {
    database_url: String,
}

pub struct AdminPrincipal {
    pub parent_account_id: String,
    pub is_content_admin: bool,
}

pub struct CourseWrite<'a> {
    pub slug: Option<&'a str>,
    pub status: Option<&'a str>,
    pub title: Option<&'a str>,
    pub target_language: Option<&'a str>,
    pub level: Option<&'a str>,
    pub cover_asset_id: Option<&'a str>,
    pub sort_order: Option<i32>,
}

pub struct LessonWrite<'a> {
    pub course_id: Option<&'a str>,
    pub slug: Option<&'a str>,
    pub title: Option<&'a str>,
    pub learning_objectives: Option<Value>,
    pub sort_order: Option<i32>,
}

pub struct ActivityWrite<'a> {
    pub lesson_id: Option<&'a str>,
    pub slug: Option<&'a str>,
    pub activity_type: Option<&'a str>,
    pub prompt: Option<Value>,
    pub content: Option<Value>,
    pub answer_key: Option<Value>,
    pub sort_order: Option<i32>,
}

impl ContentAdminRepository {
    pub fn new(database_url: String) -> Self {
        Self { database_url }
    }

    async fn connect(&self) -> Result<Client, tokio_postgres::Error> {
        let (client, connection) = tokio_postgres::connect(&self.database_url, NoTls).await?;
        tokio::spawn(async move {
            if let Err(error) = connection.await {
                tracing::error!(%error, "postgres content-admin connection error");
            }
        });
        Ok(client)
    }

    pub async fn admin_principal_for_token_hash(
        &self,
        token_hash: &str,
    ) -> Result<Option<AdminPrincipal>, ContentAdminRepositoryError> {
        let client = self.connect().await?;
        let row = client
            .query_opt(
                r#"
                UPDATE parent_sessions
                SET last_used_at = now()
                FROM parent_accounts
                WHERE parent_sessions.parent_account_id = parent_accounts.id
                    AND parent_sessions.token_hash = $1
                    AND parent_sessions.revoked_at IS NULL
                    AND parent_sessions.expires_at > now()
                RETURNING parent_accounts.id::text,
                    parent_accounts.is_content_admin
                "#,
                &[&token_hash],
            )
            .await?;

        Ok(row.map(|row| AdminPrincipal {
            parent_account_id: row.get("id"),
            is_content_admin: row.get("is_content_admin"),
        }))
    }

    pub async fn list_courses(
        &self,
    ) -> Result<Vec<AdminCourseRecord>, ContentAdminRepositoryError> {
        let client = self.connect().await?;
        let query = course_select_sql("");
        let rows = client.query(&query, &[]).await?;
        Ok(rows.iter().map(admin_course_from_row).collect())
    }

    pub async fn get_course(
        &self,
        course_id: &str,
    ) -> Result<Option<AdminCourseRecord>, ContentAdminRepositoryError> {
        let client = self.connect().await?;
        let query = course_select_sql("WHERE courses.id = $1::text::uuid");
        let row = client.query_opt(&query, &[&course_id]).await?;
        Ok(row.map(|row| admin_course_from_row(&row)))
    }

    pub async fn create_course(
        &self,
        write: CourseWrite<'_>,
    ) -> Result<AdminCourseRecord, ContentAdminRepositoryError> {
        let client = self.connect().await?;
        let row = client
            .query_one(
                r#"
                INSERT INTO courses (
                    slug,
                    status,
                    title,
                    target_language,
                    level,
                    cover_asset_id,
                    sort_order,
                    published_at
                )
                VALUES (
                    $1,
                    COALESCE($2, 'draft'),
                    $3,
                    $4,
                    $5,
                    $6::text::uuid,
                    COALESCE($7, 0),
                    CASE WHEN COALESCE($2, 'draft') = 'published' THEN now() ELSE NULL END
                )
                RETURNING id::text
                "#,
                &[
                    &write.slug,
                    &write.status,
                    &write.title,
                    &write.target_language,
                    &write.level,
                    &write.cover_asset_id,
                    &write.sort_order,
                ],
            )
            .await?;
        let course_id: String = row.get("id");
        self.get_course(&course_id)
            .await?
            .ok_or(ContentAdminRepositoryError::BadRequest("invalid_id"))
    }

    pub async fn update_course(
        &self,
        course_id: &str,
        write: CourseWrite<'_>,
    ) -> Result<Option<AdminCourseRecord>, ContentAdminRepositoryError> {
        let client = self.connect().await?;
        let row = client
            .query_opt(
                r#"
                UPDATE courses
                SET slug = COALESCE($2, slug),
                    status = COALESCE($3, status),
                    title = COALESCE($4, title),
                    target_language = COALESCE($5, target_language),
                    level = COALESCE($6, level),
                    cover_asset_id = COALESCE($7::text::uuid, cover_asset_id),
                    sort_order = COALESCE($8, sort_order),
                    published_at = CASE
                        WHEN COALESCE($3, status) = 'published' AND published_at IS NULL THEN now()
                        WHEN COALESCE($3, status) <> 'published' THEN NULL
                        ELSE published_at
                    END
                WHERE id = $1::text::uuid
                RETURNING id::text
                "#,
                &[
                    &course_id,
                    &write.slug,
                    &write.status,
                    &write.title,
                    &write.target_language,
                    &write.level,
                    &write.cover_asset_id,
                    &write.sort_order,
                ],
            )
            .await?;

        let Some(row) = row else {
            return Ok(None);
        };
        let course_id: String = row.get("id");
        self.get_course(&course_id).await
    }

    pub async fn archive_course(
        &self,
        course_id: &str,
    ) -> Result<Option<AdminCourseRecord>, ContentAdminRepositoryError> {
        self.update_course(
            course_id,
            CourseWrite {
                slug: None,
                status: Some("archived"),
                title: None,
                target_language: None,
                level: None,
                cover_asset_id: None,
                sort_order: None,
            },
        )
        .await
    }

    pub async fn list_lessons(
        &self,
        course_id: &str,
    ) -> Result<Vec<LessonSummary>, ContentAdminRepositoryError> {
        let client = self.connect().await?;
        let rows = client
            .query(
                r#"
                SELECT id::text,
                    course_id::text,
                    slug,
                    title,
                    learning_objectives,
                    sort_order
                FROM lessons
                WHERE course_id = $1::text::uuid
                ORDER BY sort_order ASC, title ASC
                "#,
                &[&course_id],
            )
            .await?;
        Ok(rows.iter().map(lesson_from_row).collect())
    }

    pub async fn create_lesson(
        &self,
        write: LessonWrite<'_>,
    ) -> Result<LessonSummary, ContentAdminRepositoryError> {
        let client = self.connect().await?;
        let row = client
            .query_one(
                r#"
                INSERT INTO lessons (
                    course_id,
                    slug,
                    title,
                    learning_objectives,
                    sort_order
                )
                VALUES (
                    $1::text::uuid,
                    $2,
                    $3,
                    COALESCE($4::jsonb, '[]'::jsonb),
                    COALESCE($5, 0)
                )
                RETURNING id::text,
                    course_id::text,
                    slug,
                    title,
                    learning_objectives,
                    sort_order
                "#,
                &[
                    &write.course_id,
                    &write.slug,
                    &write.title,
                    &write.learning_objectives,
                    &write.sort_order,
                ],
            )
            .await?;
        Ok(lesson_from_row(&row))
    }

    pub async fn update_lesson(
        &self,
        lesson_id: &str,
        write: LessonWrite<'_>,
    ) -> Result<Option<LessonSummary>, ContentAdminRepositoryError> {
        let client = self.connect().await?;
        let row = client
            .query_opt(
                r#"
                UPDATE lessons
                SET course_id = COALESCE($2::text::uuid, course_id),
                    slug = COALESCE($3, slug),
                    title = COALESCE($4, title),
                    learning_objectives = COALESCE($5::jsonb, learning_objectives),
                    sort_order = COALESCE($6, sort_order)
                WHERE id = $1::text::uuid
                RETURNING id::text,
                    course_id::text,
                    slug,
                    title,
                    learning_objectives,
                    sort_order
                "#,
                &[
                    &lesson_id,
                    &write.course_id,
                    &write.slug,
                    &write.title,
                    &write.learning_objectives,
                    &write.sort_order,
                ],
            )
            .await?;
        Ok(row.map(|row| lesson_from_row(&row)))
    }

    pub async fn delete_lesson(
        &self,
        lesson_id: &str,
    ) -> Result<Option<Value>, ContentAdminRepositoryError> {
        let client = self.connect().await?;
        let row = client
            .query_opt(
                r#"
                DELETE FROM lessons
                WHERE id = $1::text::uuid
                RETURNING jsonb_build_object(
                    'id', id::text,
                    'course_id', course_id::text,
                    'slug', slug,
                    'title', title,
                    'learning_objectives', learning_objectives,
                    'sort_order', sort_order
                ) AS snapshot
                "#,
                &[&lesson_id],
            )
            .await?;
        Ok(row.map(|row| row.get("snapshot")))
    }

    pub async fn list_activities(
        &self,
        lesson_id: &str,
    ) -> Result<Vec<ActivitySummary>, ContentAdminRepositoryError> {
        let client = self.connect().await?;
        let rows = client
            .query(
                r#"
                SELECT id::text,
                    lesson_id::text,
                    slug,
                    activity_type,
                    prompt,
                    content,
                    answer_key,
                    sort_order
                FROM activities
                WHERE lesson_id = $1::text::uuid
                ORDER BY sort_order ASC, slug ASC
                "#,
                &[&lesson_id],
            )
            .await?;
        Ok(rows.iter().map(activity_from_row).collect())
    }

    pub async fn create_activity(
        &self,
        write: ActivityWrite<'_>,
    ) -> Result<ActivitySummary, ContentAdminRepositoryError> {
        let client = self.connect().await?;
        let row = client
            .query_one(
                r#"
                INSERT INTO activities (
                    lesson_id,
                    slug,
                    activity_type,
                    prompt,
                    content,
                    answer_key,
                    sort_order
                )
                VALUES (
                    $1::text::uuid,
                    $2,
                    $3,
                    COALESCE($4::jsonb, '{}'::jsonb),
                    COALESCE($5::jsonb, '{}'::jsonb),
                    COALESCE($6::jsonb, '{}'::jsonb),
                    COALESCE($7, 0)
                )
                RETURNING id::text,
                    lesson_id::text,
                    slug,
                    activity_type,
                    prompt,
                    content,
                    answer_key,
                    sort_order
                "#,
                &[
                    &write.lesson_id,
                    &write.slug,
                    &write.activity_type,
                    &write.prompt,
                    &write.content,
                    &write.answer_key,
                    &write.sort_order,
                ],
            )
            .await?;
        Ok(activity_from_row(&row))
    }

    pub async fn update_activity(
        &self,
        activity_id: &str,
        write: ActivityWrite<'_>,
    ) -> Result<Option<ActivitySummary>, ContentAdminRepositoryError> {
        let client = self.connect().await?;
        let row = client
            .query_opt(
                r#"
                UPDATE activities
                SET lesson_id = COALESCE($2::text::uuid, lesson_id),
                    slug = COALESCE($3, slug),
                    activity_type = COALESCE($4, activity_type),
                    prompt = COALESCE($5::jsonb, prompt),
                    content = COALESCE($6::jsonb, content),
                    answer_key = COALESCE($7::jsonb, answer_key),
                    sort_order = COALESCE($8, sort_order)
                WHERE id = $1::text::uuid
                RETURNING id::text,
                    lesson_id::text,
                    slug,
                    activity_type,
                    prompt,
                    content,
                    answer_key,
                    sort_order
                "#,
                &[
                    &activity_id,
                    &write.lesson_id,
                    &write.slug,
                    &write.activity_type,
                    &write.prompt,
                    &write.content,
                    &write.answer_key,
                    &write.sort_order,
                ],
            )
            .await?;
        Ok(row.map(|row| activity_from_row(&row)))
    }

    pub async fn delete_activity(
        &self,
        activity_id: &str,
    ) -> Result<Option<Value>, ContentAdminRepositoryError> {
        let client = self.connect().await?;
        let row = client
            .query_opt(
                r#"
                DELETE FROM activities
                WHERE id = $1::text::uuid
                RETURNING jsonb_build_object(
                    'id', id::text,
                    'lesson_id', lesson_id::text,
                    'slug', slug,
                    'activity_type', activity_type,
                    'prompt', prompt,
                    'content', content,
                    'answer_key', answer_key,
                    'sort_order', sort_order
                ) AS snapshot
                "#,
                &[&activity_id],
            )
            .await?;
        Ok(row.map(|row| row.get("snapshot")))
    }

    pub async fn list_assets(&self) -> Result<Vec<AssetSummary>, ContentAdminRepositoryError> {
        let client = self.connect().await?;
        let rows = client
            .query(
                r#"
                SELECT id::text,
                    asset_key,
                    asset_type,
                    path,
                    status,
                    source,
                    prompt_summary,
                    metadata
                FROM assets
                ORDER BY asset_type ASC, asset_key ASC
                "#,
                &[],
            )
            .await?;
        Ok(rows.iter().map(asset_from_row).collect())
    }

    pub async fn course_publish_issues(
        &self,
        course_id: &str,
    ) -> Result<Option<Vec<String>>, ContentAdminRepositoryError> {
        let client = self.connect().await?;
        let course = client
            .query_opt(
                r#"
                SELECT slug,
                    cover_asset_id IS NOT NULL AS has_cover
                FROM courses
                WHERE id = $1::text::uuid
                "#,
                &[&course_id],
            )
            .await?;

        let Some(course) = course else {
            return Ok(None);
        };

        let course_slug: String = course.get("slug");
        let has_cover: bool = course.get("has_cover");
        let mut issues = Vec::new();
        if !has_cover {
            issues.push(format!("course {course_slug} has no cover asset"));
        }

        collect_string_rows(
            &client,
            &mut issues,
            r#"
            SELECT format('course %s has no lesson', courses.slug) AS issue
            FROM courses
            WHERE courses.id = $1::text::uuid
                AND NOT EXISTS (
                    SELECT 1 FROM lessons WHERE lessons.course_id = courses.id
                )
            "#,
            course_id,
        )
        .await?;

        collect_string_rows(
            &client,
            &mut issues,
            r#"
            SELECT format('lesson %s/%s has no activity', courses.slug, lessons.slug) AS issue
            FROM lessons
            INNER JOIN courses ON courses.id = lessons.course_id
            WHERE courses.id = $1::text::uuid
                AND NOT EXISTS (
                    SELECT 1 FROM activities WHERE activities.lesson_id = lessons.id
                )
            ORDER BY lessons.sort_order
            "#,
            course_id,
        )
        .await?;

        collect_string_rows(
            &client,
            &mut issues,
            r#"
            SELECT format('activity %s/%s/%s has no answer key', courses.slug, lessons.slug, activities.slug) AS issue
            FROM activities
            INNER JOIN lessons ON lessons.id = activities.lesson_id
            INNER JOIN courses ON courses.id = lessons.course_id
            WHERE courses.id = $1::text::uuid
                AND (
                    activities.answer_key = '{}'::jsonb
                    OR (
                        NULLIF(activities.answer_key->>'correct_answer', '') IS NULL
                        AND NULLIF(activities.answer_key->>'expected', '') IS NULL
                    )
                )
            ORDER BY lessons.sort_order, activities.sort_order
            "#,
            course_id,
        )
        .await?;

        collect_string_rows(
            &client,
            &mut issues,
            r#"
            SELECT format('word card %s/%s/%s is missing audio or visual/counting material', courses.slug, lessons.slug, activities.slug) AS issue
            FROM activities
            INNER JOIN lessons ON lessons.id = activities.lesson_id
            INNER JOIN courses ON courses.id = lessons.course_id
            WHERE courses.id = $1::text::uuid
                AND activities.activity_type = 'word_card'
                AND (
                    NULLIF(activities.content->>'audio_asset_key', '') IS NULL
                    OR (
                        NULLIF(activities.content->>'image_asset_key', '') IS NULL
                        AND NULLIF(activities.content->>'color_hex', '') IS NULL
                        AND NOT (activities.content ? 'number')
                    )
                )
            ORDER BY lessons.sort_order, activities.sort_order
            "#,
            course_id,
        )
        .await?;

        collect_string_rows(
            &client,
            &mut issues,
            r#"
            SELECT format('course %s uses cover asset %s with status %s', courses.slug, assets.asset_key, assets.status) AS issue
            FROM courses
            INNER JOIN assets ON assets.id = courses.cover_asset_id
            WHERE courses.id = $1::text::uuid
                AND assets.status NOT IN ('approved', 'published')
            "#,
            course_id,
        )
        .await?;

        collect_string_rows(
            &client,
            &mut issues,
            r#"
            WITH linked_assets AS (
                SELECT courses.slug AS course_slug,
                    lessons.slug AS lesson_slug,
                    activities.slug AS activity_slug,
                    asset_refs.asset_kind,
                    asset_refs.asset_key
                FROM activities
                INNER JOIN lessons ON lessons.id = activities.lesson_id
                INNER JOIN courses ON courses.id = lessons.course_id
                CROSS JOIN LATERAL (
                    VALUES
                        ('image', NULLIF(activities.content->>'image_asset_key', '')),
                        ('audio', NULLIF(activities.content->>'audio_asset_key', ''))
                ) AS asset_refs(asset_kind, asset_key)
                WHERE courses.id = $1::text::uuid
                    AND asset_refs.asset_key IS NOT NULL
            )
            SELECT format('activity %s/%s/%s uses %s asset %s with status %s',
                linked_assets.course_slug,
                linked_assets.lesson_slug,
                linked_assets.activity_slug,
                linked_assets.asset_kind,
                linked_assets.asset_key,
                COALESCE(assets.status, 'missing')
            ) AS issue
            FROM linked_assets
            LEFT JOIN assets ON assets.asset_key = linked_assets.asset_key
            WHERE assets.id IS NULL
                OR assets.status NOT IN ('approved', 'published')
            ORDER BY linked_assets.course_slug,
                linked_assets.lesson_slug,
                linked_assets.activity_slug,
                linked_assets.asset_kind
            "#,
            course_id,
        )
        .await?;

        Ok(Some(issues))
    }

    pub async fn record_version(
        &self,
        entity_type: &str,
        entity_id: &str,
        action: &str,
        actor_parent_account_id: &str,
        snapshot: Value,
    ) -> Result<ContentVersionRecord, ContentAdminRepositoryError> {
        let client = self.connect().await?;
        let row = client
            .query_one(
                r#"
                INSERT INTO content_versions (
                    entity_type,
                    entity_id,
                    action,
                    actor_parent_account_id,
                    snapshot
                )
                VALUES ($1, $2::text::uuid, $3, $4::text::uuid, $5)
                RETURNING id::text,
                    entity_type,
                    entity_id::text,
                    action,
                    actor_parent_account_id::text,
                    snapshot,
                    created_at::text
                "#,
                &[
                    &entity_type,
                    &entity_id,
                    &action,
                    &actor_parent_account_id,
                    &snapshot,
                ],
            )
            .await?;
        Ok(version_from_row(&row))
    }

    pub async fn list_versions(
        &self,
        limit: i64,
    ) -> Result<Vec<ContentVersionRecord>, ContentAdminRepositoryError> {
        let client = self.connect().await?;
        let rows = client
            .query(
                r#"
                SELECT id::text,
                    entity_type,
                    entity_id::text,
                    action,
                    actor_parent_account_id::text,
                    snapshot,
                    created_at::text
                FROM content_versions
                ORDER BY created_at DESC
                LIMIT LEAST($1::bigint, 100::bigint)
                "#,
                &[&limit],
            )
            .await?;
        Ok(rows.iter().map(version_from_row).collect())
    }
}

async fn collect_string_rows(
    client: &Client,
    output: &mut Vec<String>,
    query: &str,
    course_id: &str,
) -> Result<(), tokio_postgres::Error> {
    let rows = client.query(query, &[&course_id]).await?;
    for row in rows {
        output.push(row.get("issue"));
    }
    Ok(())
}

fn course_select_sql(filter: &str) -> String {
    format!(
        r#"
        SELECT courses.id::text,
            courses.slug,
            courses.status,
            courses.title,
            courses.target_language,
            courses.level,
            courses.market_regions,
            courses.english_variants,
            courses.cover_asset_id::text,
            assets.path AS cover_asset_path,
            courses.sort_order,
            courses.published_at::text,
            courses.created_at::text,
            courses.updated_at::text,
            count(lessons.id)::bigint AS lesson_count
        FROM courses
        LEFT JOIN assets ON courses.cover_asset_id = assets.id
        LEFT JOIN lessons ON lessons.course_id = courses.id
        {filter}
        GROUP BY courses.id, assets.path
        ORDER BY courses.sort_order ASC, courses.title ASC
        "#
    )
}

fn admin_course_from_row(row: &tokio_postgres::Row) -> AdminCourseRecord {
    AdminCourseRecord {
        id: row.get("id"),
        slug: row.get("slug"),
        status: row.get("status"),
        title: row.get("title"),
        target_language: row.get("target_language"),
        level: row.get("level"),
        market_regions: row.get("market_regions"),
        english_variants: row.get("english_variants"),
        cover_asset_id: row.get("cover_asset_id"),
        cover_asset_path: row.get("cover_asset_path"),
        sort_order: row.get("sort_order"),
        published_at: row.get("published_at"),
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
        lesson_count: row.get("lesson_count"),
    }
}

fn lesson_from_row(row: &tokio_postgres::Row) -> LessonSummary {
    LessonSummary {
        id: row.get("id"),
        course_id: row.get("course_id"),
        slug: row.get("slug"),
        title: row.get("title"),
        learning_objectives: row.get("learning_objectives"),
        sort_order: row.get("sort_order"),
    }
}

fn activity_from_row(row: &tokio_postgres::Row) -> ActivitySummary {
    ActivitySummary {
        id: row.get("id"),
        lesson_id: row.get("lesson_id"),
        slug: row.get("slug"),
        activity_type: row.get("activity_type"),
        prompt: row.get("prompt"),
        content: row.get("content"),
        answer_key: row.get("answer_key"),
        sort_order: row.get("sort_order"),
    }
}

fn asset_from_row(row: &tokio_postgres::Row) -> AssetSummary {
    AssetSummary {
        id: row.get("id"),
        asset_key: row.get("asset_key"),
        asset_type: row.get("asset_type"),
        path: row.get("path"),
        status: row.get("status"),
        source: row.get("source"),
        prompt_summary: row.get("prompt_summary"),
        metadata: row.get("metadata"),
    }
}

fn version_from_row(row: &tokio_postgres::Row) -> ContentVersionRecord {
    ContentVersionRecord {
        id: row.get("id"),
        entity_type: row.get("entity_type"),
        entity_id: row.get("entity_id"),
        action: row.get("action"),
        actor_parent_account_id: row.get("actor_parent_account_id"),
        snapshot: row.get("snapshot"),
        created_at: row.get("created_at"),
    }
}

pub fn deleted_snapshot(entity_id: &str) -> Value {
    json!({ "id": entity_id, "deleted": true })
}
