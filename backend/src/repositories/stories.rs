use tokio_postgres::{Client, NoTls};

use crate::domain::{DailyFamilyTask, StoryDetail, StorySession, StorySummary};

pub struct StoryRepository {
    database_url: String,
}

#[derive(Debug)]
pub struct ChildStoryGate {
    pub age_min: i32,
    pub age_max: i32,
    pub has_parental_privacy_consent: bool,
    pub requires_parental_privacy_consent: bool,
}

impl StoryRepository {
    pub fn new(database_url: String) -> Self {
        Self { database_url }
    }

    async fn connect(&self) -> Result<Client, tokio_postgres::Error> {
        let (client, connection) = tokio_postgres::connect(&self.database_url, NoTls).await?;
        tokio::spawn(async move {
            if let Err(error) = connection.await {
                tracing::error!(%error, "postgres story connection error");
            }
        });
        Ok(client)
    }

    pub async fn child_gate(
        &self,
        parent_account_id: &str,
        child_id: &str,
    ) -> Result<Option<ChildStoryGate>, tokio_postgres::Error> {
        let client = self.connect().await?;
        let row = client
            .query_opt(
                r#"
                SELECT age_band, market_region,
                    EXISTS(
                        SELECT 1 FROM consents
                        WHERE consents.parent_account_id = children.parent_account_id
                          AND consents.child_id = children.id
                          AND consent_type = 'parental_privacy'
                          AND status = 'granted'
                    ) AS has_consent
                FROM children
                WHERE parent_account_id = $1::text::uuid
                  AND id = $2::text::uuid
                "#,
                &[&parent_account_id, &child_id],
            )
            .await?;

        Ok(row.map(|row| {
            let age_band: String = row.get("age_band");
            let (age_min, age_max) = age_range(&age_band);
            let region: String = row.get("market_region");
            ChildStoryGate {
                age_min,
                age_max,
                has_parental_privacy_consent: row.get("has_consent"),
                requires_parental_privacy_consent: matches!(region.as_str(), "US" | "DE" | "UK"),
            }
        }))
    }

    pub async fn recommendations(
        &self,
        age_min: i32,
        age_max: i32,
        mode: &str,
    ) -> Result<Vec<StorySummary>, tokio_postgres::Error> {
        let client = self.connect().await?;
        let rows = client
            .query(
                r#"
                SELECT id::text, slug, title, summary, theme, mode, min_age, max_age,
                       duration_minutes, cover_path, parent_prompt
                FROM stories
                WHERE status = 'published'
                  AND mode = $1
                  AND min_age <= $3
                  AND max_age >= $2
                ORDER BY sort_order, title
                "#,
                &[&mode, &age_min, &age_max],
            )
            .await?;
        Ok(rows.iter().map(story_summary_from_row).collect())
    }

    pub async fn story_detail(
        &self,
        story_id: &str,
        age_min: i32,
        age_max: i32,
    ) -> Result<Option<StoryDetail>, tokio_postgres::Error> {
        let client = self.connect().await?;
        let row = client
            .query_opt(
                r#"
                SELECT id::text, slug, title, summary, theme, mode, min_age, max_age,
                       duration_minutes, cover_path, pages, parent_prompt, calming_prompt
                FROM stories
                WHERE id = $1::text::uuid
                  AND status = 'published'
                  AND min_age <= $3
                  AND max_age >= $2
                "#,
                &[&story_id, &age_min, &age_max],
            )
            .await?;
        Ok(row.map(|row| story_detail_from_row(&row)))
    }

    pub async fn start_session(
        &self,
        child_id: &str,
        story_id: &str,
        mode: &str,
    ) -> Result<Option<StorySession>, tokio_postgres::Error> {
        let client = self.connect().await?;
        let row = client
            .query_opt(
                r#"
                INSERT INTO story_sessions (child_id, story_id, mode)
                SELECT $1::text::uuid, stories.id, $3
                FROM stories
                WHERE stories.id = $2::text::uuid
                  AND stories.status = 'published'
                  AND stories.mode = $3
                RETURNING id::text, child_id::text, story_id::text, mode, current_page,
                          started_at::text, last_progress_at::text, completed_at::text
                "#,
                &[&child_id, &story_id, &mode],
            )
            .await?;
        Ok(row.map(|row| story_session_from_row(&row)))
    }

    pub async fn update_progress(
        &self,
        parent_account_id: &str,
        session_id: &str,
        current_page: i32,
    ) -> Result<Option<StorySession>, tokio_postgres::Error> {
        let client = self.connect().await?;
        let row = client
            .query_opt(
                r#"
                UPDATE story_sessions
                SET current_page = $3, last_progress_at = now()
                FROM children, stories
                WHERE story_sessions.id = $2::text::uuid
                  AND children.id = story_sessions.child_id
                  AND children.parent_account_id = $1::text::uuid
                  AND stories.id = story_sessions.story_id
                  AND $3 >= 0
                  AND $3 < jsonb_array_length(stories.pages)
                  AND story_sessions.completed_at IS NULL
                RETURNING story_sessions.id::text, story_sessions.child_id::text,
                          story_sessions.story_id::text, story_sessions.mode,
                          story_sessions.current_page, story_sessions.started_at::text,
                          story_sessions.last_progress_at::text, story_sessions.completed_at::text
                "#,
                &[&parent_account_id, &session_id, &current_page],
            )
            .await?;
        Ok(row.map(|row| story_session_from_row(&row)))
    }

    pub async fn complete_session(
        &self,
        parent_account_id: &str,
        session_id: &str,
    ) -> Result<Option<StorySession>, tokio_postgres::Error> {
        let client = self.connect().await?;
        let row = client
            .query_opt(
                r#"
                UPDATE story_sessions
                SET completed_at = COALESCE(completed_at, now()), last_progress_at = now()
                FROM children, stories
                WHERE story_sessions.id = $2::text::uuid
                  AND children.id = story_sessions.child_id
                  AND children.parent_account_id = $1::text::uuid
                  AND stories.id = story_sessions.story_id
                  AND story_sessions.current_page = jsonb_array_length(stories.pages) - 1
                RETURNING story_sessions.id::text, story_sessions.child_id::text,
                          story_sessions.story_id::text, story_sessions.mode,
                          story_sessions.current_page, story_sessions.started_at::text,
                          story_sessions.last_progress_at::text, story_sessions.completed_at::text
                "#,
                &[&parent_account_id, &session_id],
            )
            .await?;
        Ok(row.map(|row| story_session_from_row(&row)))
    }

    pub async fn daily_task(
        &self,
        child_id: &str,
        age_min: i32,
        age_max: i32,
    ) -> Result<Option<DailyFamilyTask>, tokio_postgres::Error> {
        let client = self.connect().await?;
        let row = client
            .query_opt(
                r#"
                SELECT task.id::text, task.task_key, task.title, task.instruction,
                       task.parent_tip, task.min_age, task.max_age, task.duration_minutes,
                       EXISTS(
                           SELECT 1 FROM family_task_completions done
                           WHERE done.task_id = task.id AND done.child_id = $1::text::uuid
                             AND done.completion_date = CURRENT_DATE
                       ) AS completed_today
                FROM daily_family_tasks task
                WHERE task.status = 'published'
                  AND task.min_age <= $3
                  AND task.max_age >= $2
                ORDER BY ((EXTRACT(DOY FROM CURRENT_DATE)::integer + task.sort_order) % 31), task.sort_order
                LIMIT 1
                "#,
                &[&child_id, &age_min, &age_max],
            )
            .await?;
        Ok(row.map(|row| family_task_from_row(&row)))
    }

    pub async fn complete_daily_task(
        &self,
        parent_account_id: &str,
        child_id: &str,
        task_id: &str,
    ) -> Result<Option<DailyFamilyTask>, tokio_postgres::Error> {
        let client = self.connect().await?;
        let inserted = client
            .execute(
                r#"
                INSERT INTO family_task_completions (child_id, task_id)
                SELECT children.id, tasks.id
                FROM children
                CROSS JOIN daily_family_tasks tasks
                WHERE children.id = $2::text::uuid
                  AND children.parent_account_id = $1::text::uuid
                  AND tasks.id = $3::text::uuid
                  AND tasks.status = 'published'
                ON CONFLICT (child_id, task_id, completion_date) DO NOTHING
                "#,
                &[&parent_account_id, &child_id, &task_id],
            )
            .await?;

        if inserted == 0 {
            let owns = client.query_opt(
                "SELECT 1 FROM children WHERE id = $2::text::uuid AND parent_account_id = $1::text::uuid",
                &[&parent_account_id, &child_id],
            ).await?;
            if owns.is_none() {
                return Ok(None);
            }
        }

        let row = client.query_opt(
            r#"
            SELECT task.id::text, task.task_key, task.title, task.instruction,
                   task.parent_tip, task.min_age, task.max_age, task.duration_minutes, true AS completed_today
            FROM daily_family_tasks task WHERE task.id = $1::text::uuid
            "#,
            &[&task_id],
        ).await?;
        Ok(row.map(|row| family_task_from_row(&row)))
    }
}

fn age_range(age_band: &str) -> (i32, i32) {
    match age_band {
        "0-2" => (0, 2),
        "3-4" => (3, 4),
        "5-6" => (5, 6),
        "3-5" => (3, 5),
        "6-8" => (6, 8),
        "9-11" => (9, 11),
        _ => (3, 5),
    }
}

fn story_summary_from_row(row: &tokio_postgres::Row) -> StorySummary {
    StorySummary {
        id: row.get("id"),
        slug: row.get("slug"),
        title: row.get("title"),
        summary: row.get("summary"),
        theme: row.get("theme"),
        mode: row.get("mode"),
        min_age: row.get("min_age"),
        max_age: row.get("max_age"),
        duration_minutes: row.get("duration_minutes"),
        cover_path: row.get("cover_path"),
        parent_prompt: row.get("parent_prompt"),
    }
}

fn story_detail_from_row(row: &tokio_postgres::Row) -> StoryDetail {
    StoryDetail {
        id: row.get("id"),
        slug: row.get("slug"),
        title: row.get("title"),
        summary: row.get("summary"),
        theme: row.get("theme"),
        mode: row.get("mode"),
        min_age: row.get("min_age"),
        max_age: row.get("max_age"),
        duration_minutes: row.get("duration_minutes"),
        cover_path: row.get("cover_path"),
        pages: row.get("pages"),
        parent_prompt: row.get("parent_prompt"),
        calming_prompt: row.get("calming_prompt"),
    }
}

fn story_session_from_row(row: &tokio_postgres::Row) -> StorySession {
    StorySession {
        id: row.get("id"),
        child_id: row.get("child_id"),
        story_id: row.get("story_id"),
        mode: row.get("mode"),
        current_page: row.get("current_page"),
        started_at: row.get("started_at"),
        last_progress_at: row.get("last_progress_at"),
        completed_at: row.get("completed_at"),
    }
}

fn family_task_from_row(row: &tokio_postgres::Row) -> DailyFamilyTask {
    DailyFamilyTask {
        id: row.get("id"),
        task_key: row.get("task_key"),
        title: row.get("title"),
        instruction: row.get("instruction"),
        parent_tip: row.get("parent_tip"),
        min_age: row.get("min_age"),
        max_age: row.get("max_age"),
        duration_minutes: row.get("duration_minutes"),
        completed_today: row.get("completed_today"),
    }
}
