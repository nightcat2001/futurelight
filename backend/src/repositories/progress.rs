use serde_json::Value;
use tokio_postgres::{Client, NoTls};

use crate::domain::{AttemptRecord, LearningSession, ProgressRecord, RewardRecord};

pub struct ProgressRepository {
    database_url: String,
}

struct ActivityScope {
    lesson_id: String,
    course_id: String,
}

pub struct ChildPrivacyGate {
    pub has_parental_privacy_consent: bool,
    pub requires_parental_privacy_consent: bool,
}

pub struct AttemptWrite<'a> {
    pub parent_account_id: &'a str,
    pub child_id: &'a str,
    pub activity_id: &'a str,
    pub session_id: Option<&'a str>,
    pub answer: &'a Value,
    pub is_correct: bool,
    pub score: f64,
    pub duration_ms: Option<i32>,
}

impl ProgressRepository {
    pub fn new(database_url: String) -> Self {
        Self { database_url }
    }

    async fn connect(&self) -> Result<Client, tokio_postgres::Error> {
        let (client, connection) = tokio_postgres::connect(&self.database_url, NoTls).await?;
        tokio::spawn(async move {
            if let Err(error) = connection.await {
                tracing::error!(%error, "postgres progress connection error");
            }
        });
        Ok(client)
    }

    pub async fn create_session(
        &self,
        parent_account_id: &str,
        child_id: &str,
        course_id: &str,
        lesson_id: Option<&str>,
    ) -> Result<Option<LearningSession>, tokio_postgres::Error> {
        let client = self.connect().await?;
        let row = client
            .query_opt(
                r#"
                INSERT INTO learning_sessions (child_id, course_id, lesson_id)
                SELECT $2::text::uuid, $3::text::uuid, $4::text::uuid
                WHERE EXISTS (
                    SELECT 1 FROM children
                    WHERE id = $2::text::uuid
                        AND parent_account_id = $1::text::uuid
                )
                AND EXISTS (
                    SELECT 1 FROM courses
                    WHERE id = $3::text::uuid
                )
                AND (
                    $4::text IS NULL
                    OR EXISTS (
                        SELECT 1 FROM lessons
                        WHERE id = $4::text::uuid
                            AND course_id = $3::text::uuid
                    )
                )
                RETURNING id::text,
                    child_id::text,
                    course_id::text,
                    lesson_id::text,
                    started_at::text,
                    completed_at::text
                "#,
                &[&parent_account_id, &child_id, &course_id, &lesson_id],
            )
            .await?;

        Ok(row.map(|row| session_from_row(&row)))
    }

    pub async fn child_privacy_gate(
        &self,
        parent_account_id: &str,
        child_id: &str,
    ) -> Result<Option<ChildPrivacyGate>, tokio_postgres::Error> {
        let client = self.connect().await?;
        let row = client
            .query_opt(
                r#"
                SELECT market_region,
                    EXISTS (
                        SELECT 1 FROM consents
                        WHERE parent_account_id = $1::text::uuid
                            AND child_id = $2::text::uuid
                            AND consent_type = 'parental_privacy'
                            AND status = 'granted'
                    ) AS has_parental_privacy_consent
                FROM children
                WHERE id = $2::text::uuid
                    AND parent_account_id = $1::text::uuid
                "#,
                &[&parent_account_id, &child_id],
            )
            .await?;

        Ok(row.map(|row| {
            let market_region: String = row.get("market_region");
            ChildPrivacyGate {
                has_parental_privacy_consent: row.get("has_parental_privacy_consent"),
                requires_parental_privacy_consent: matches!(
                    market_region.as_str(),
                    "DE" | "UK" | "US"
                ),
            }
        }))
    }

    pub async fn complete_session(
        &self,
        parent_account_id: &str,
        session_id: &str,
    ) -> Result<Option<LearningSession>, tokio_postgres::Error> {
        let client = self.connect().await?;
        let row = client
            .query_opt(
                r#"
                UPDATE learning_sessions
                SET completed_at = now()
                FROM children
                WHERE learning_sessions.child_id = children.id
                    AND children.parent_account_id = $1::text::uuid
                    AND learning_sessions.id = $2::text::uuid
                RETURNING learning_sessions.id::text,
                    learning_sessions.child_id::text,
                    learning_sessions.course_id::text,
                    learning_sessions.lesson_id::text,
                    learning_sessions.started_at::text,
                    learning_sessions.completed_at::text
                "#,
                &[&parent_account_id, &session_id],
            )
            .await?;

        Ok(row.map(|row| session_from_row(&row)))
    }

    pub async fn record_attempt(
        &self,
        attempt: AttemptWrite<'_>,
    ) -> Result<Option<AttemptRecord>, tokio_postgres::Error> {
        let client = self.connect().await?;
        let Some(scope) = self
            .activity_scope(
                &client,
                attempt.parent_account_id,
                attempt.child_id,
                attempt.activity_id,
            )
            .await?
        else {
            return Ok(None);
        };

        let row = client
            .query_one(
                r#"
                INSERT INTO attempts (
                    child_id,
                    activity_id,
                    session_id,
                    answer,
                    is_correct,
                    score,
                    duration_ms
                )
                VALUES (
                    $1::text::uuid,
                    $2::text::uuid,
                    $3::text::uuid,
                    $4,
                    $5,
                    ($6::double precision)::numeric,
                    $7
                )
                RETURNING id::text,
                    child_id::text,
                    activity_id::text,
                    session_id::text,
                    answer,
                    is_correct,
                    score::double precision,
                    duration_ms,
                    created_at::text
                "#,
                &[
                    &attempt.child_id,
                    &attempt.activity_id,
                    &attempt.session_id,
                    &attempt.answer,
                    &attempt.is_correct,
                    &attempt.score,
                    &attempt.duration_ms,
                ],
            )
            .await?;

        self.upsert_progress(
            &client,
            attempt.child_id,
            attempt.activity_id,
            &scope,
            attempt.score,
        )
        .await?;
        if attempt.is_correct {
            self.award_activity_reward(&client, attempt.child_id, attempt.activity_id, &scope)
                .await?;
        }

        Ok(Some(attempt_from_row(&row)))
    }

    pub async fn list_child_progress(
        &self,
        parent_account_id: &str,
        child_id: &str,
    ) -> Result<Option<Vec<ProgressRecord>>, tokio_postgres::Error> {
        let client = self.connect().await?;
        let child_exists = client
            .query_one(
                r#"
                SELECT EXISTS (
                    SELECT 1 FROM children
                    WHERE id = $2::text::uuid
                        AND parent_account_id = $1::text::uuid
                )
                "#,
                &[&parent_account_id, &child_id],
            )
            .await?
            .get::<_, bool>(0);

        if !child_exists {
            return Ok(None);
        }

        let rows = client
            .query(
                r#"
                SELECT id::text,
                    child_id::text,
                    course_id::text,
                    lesson_id::text,
                    activity_id::text,
                    mastery_score::double precision,
                    attempts_count,
                    last_attempt_at::text,
                    updated_at::text
                FROM progress_records
                WHERE child_id = $1::text::uuid
                ORDER BY updated_at DESC
                "#,
                &[&child_id],
            )
            .await?;

        Ok(Some(rows.iter().map(progress_from_row).collect()))
    }

    pub async fn list_child_rewards(
        &self,
        parent_account_id: &str,
        child_id: &str,
    ) -> Result<Option<Vec<RewardRecord>>, tokio_postgres::Error> {
        let client = self.connect().await?;
        let child_exists = client
            .query_one(
                r#"
                SELECT EXISTS (
                    SELECT 1 FROM children
                    WHERE id = $2::text::uuid
                        AND parent_account_id = $1::text::uuid
                )
                "#,
                &[&parent_account_id, &child_id],
            )
            .await?
            .get::<_, bool>(0);

        if !child_exists {
            return Ok(None);
        }

        let rows = client
            .query(
                r#"
                SELECT id::text,
                    child_id::text,
                    reward_type,
                    reward_key,
                    source_activity_id::text,
                    awarded_at::text,
                    metadata
                FROM rewards
                WHERE child_id = $1::text::uuid
                ORDER BY awarded_at DESC
                "#,
                &[&child_id],
            )
            .await?;

        Ok(Some(rows.iter().map(reward_from_row).collect()))
    }

    async fn activity_scope(
        &self,
        client: &Client,
        parent_account_id: &str,
        child_id: &str,
        activity_id: &str,
    ) -> Result<Option<ActivityScope>, tokio_postgres::Error> {
        let row = client
            .query_opt(
                r#"
                SELECT lessons.id::text AS lesson_id,
                    lessons.course_id::text AS course_id
                FROM activities
                INNER JOIN lessons ON lessons.id = activities.lesson_id
                WHERE activities.id = $3::text::uuid
                    AND EXISTS (
                        SELECT 1 FROM children
                        WHERE id = $2::text::uuid
                            AND parent_account_id = $1::text::uuid
                    )
                "#,
                &[&parent_account_id, &child_id, &activity_id],
            )
            .await?;

        Ok(row.map(|row| ActivityScope {
            lesson_id: row.get("lesson_id"),
            course_id: row.get("course_id"),
        }))
    }

    async fn upsert_progress(
        &self,
        client: &Client,
        child_id: &str,
        activity_id: &str,
        scope: &ActivityScope,
        score: f64,
    ) -> Result<(), tokio_postgres::Error> {
        let changed = client
            .execute(
                r#"
                UPDATE progress_records
                SET mastery_score = (
                        ((mastery_score::double precision * attempts_count)
                        + $3::double precision)
                        / (attempts_count + 1)
                    )::numeric,
                    attempts_count = attempts_count + 1,
                    last_attempt_at = now(),
                    updated_at = now()
                WHERE child_id = $1::text::uuid
                    AND activity_id = $2::text::uuid
                "#,
                &[&child_id, &activity_id, &score],
            )
            .await?;

        if changed == 0 {
            client
                .execute(
                    r#"
                    INSERT INTO progress_records (
                        child_id,
                        course_id,
                        lesson_id,
                        activity_id,
                        mastery_score,
                        attempts_count,
                        last_attempt_at
                    )
                    VALUES (
                        $1::text::uuid,
                        $2::text::uuid,
                        $3::text::uuid,
                        $4::text::uuid,
                        ($5::double precision)::numeric,
                        1,
                        now()
                    )
                    "#,
                    &[
                        &child_id,
                        &scope.course_id,
                        &scope.lesson_id,
                        &activity_id,
                        &score,
                    ],
                )
                .await?;
        }

        Ok(())
    }

    async fn award_activity_reward(
        &self,
        client: &Client,
        child_id: &str,
        activity_id: &str,
        scope: &ActivityScope,
    ) -> Result<(), tokio_postgres::Error> {
        let metadata = serde_json::json!({
            "course_id": scope.course_id,
            "lesson_id": scope.lesson_id,
        });
        client
            .execute(
                r#"
                INSERT INTO rewards (
                    child_id,
                    reward_type,
                    reward_key,
                    source_activity_id,
                    metadata
                )
                VALUES (
                    $1::text::uuid,
                    'activity_mastery',
                    $2,
                    $3::text::uuid,
                    $4
                )
                ON CONFLICT (child_id, reward_type, reward_key) DO NOTHING
                "#,
                &[&child_id, &activity_id, &activity_id, &metadata],
            )
            .await?;

        Ok(())
    }
}

fn session_from_row(row: &tokio_postgres::Row) -> LearningSession {
    LearningSession {
        id: row.get("id"),
        child_id: row.get("child_id"),
        course_id: row.get("course_id"),
        lesson_id: row.get("lesson_id"),
        started_at: row.get("started_at"),
        completed_at: row.get("completed_at"),
    }
}

fn attempt_from_row(row: &tokio_postgres::Row) -> AttemptRecord {
    AttemptRecord {
        id: row.get("id"),
        child_id: row.get("child_id"),
        activity_id: row.get("activity_id"),
        session_id: row.get("session_id"),
        answer: row.get("answer"),
        is_correct: row.get("is_correct"),
        score: row.get("score"),
        duration_ms: row.get("duration_ms"),
        created_at: row.get("created_at"),
    }
}

fn progress_from_row(row: &tokio_postgres::Row) -> ProgressRecord {
    ProgressRecord {
        id: row.get("id"),
        child_id: row.get("child_id"),
        course_id: row.get("course_id"),
        lesson_id: row.get("lesson_id"),
        activity_id: row.get("activity_id"),
        mastery_score: row.get("mastery_score"),
        attempts_count: row.get("attempts_count"),
        last_attempt_at: row.get("last_attempt_at"),
        updated_at: row.get("updated_at"),
    }
}

fn reward_from_row(row: &tokio_postgres::Row) -> RewardRecord {
    RewardRecord {
        id: row.get("id"),
        child_id: row.get("child_id"),
        reward_type: row.get("reward_type"),
        reward_key: row.get("reward_key"),
        source_activity_id: row.get("source_activity_id"),
        awarded_at: row.get("awarded_at"),
        metadata: row.get("metadata"),
    }
}
