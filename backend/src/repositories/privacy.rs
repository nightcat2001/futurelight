use serde_json::Value;
use tokio_postgres::{Client, NoTls};

use crate::domain::{
    AttemptRecord, AuditLogRecord, ChildProfile, ConsentRecord, DataExportPackage,
    DataExportResponse, DataExportScope, LearningSession, ParentAccount, ProgressRecord,
    RewardRecord,
};

pub struct PrivacyRepository {
    database_url: String,
}

impl PrivacyRepository {
    pub fn new(database_url: String) -> Self {
        Self { database_url }
    }

    async fn connect(&self) -> Result<Client, tokio_postgres::Error> {
        let (client, connection) = tokio_postgres::connect(&self.database_url, NoTls).await?;
        tokio::spawn(async move {
            if let Err(error) = connection.await {
                tracing::error!(%error, "postgres privacy connection error");
            }
        });
        Ok(client)
    }

    pub async fn create_consent(
        &self,
        parent_account_id: &str,
        child_id: Option<&str>,
        consent_type: &str,
        evidence: &Value,
    ) -> Result<Option<ConsentRecord>, tokio_postgres::Error> {
        let client = self.connect().await?;
        let row = client
            .query_opt(
                r#"
                INSERT INTO consents (
                    parent_account_id,
                    child_id,
                    consent_type,
                    status,
                    granted_at,
                    evidence
                )
                SELECT $1::text::uuid,
                    $2::text::uuid,
                    $3,
                    'granted',
                    now(),
                    $4
                WHERE (
                    $2::text IS NULL
                    OR EXISTS (
                        SELECT 1 FROM children
                        WHERE id = $2::text::uuid
                            AND parent_account_id = $1::text::uuid
                    )
                )
                RETURNING id::text,
                    parent_account_id::text,
                    child_id::text,
                    consent_type,
                    status,
                    granted_at::text,
                    revoked_at::text,
                    evidence,
                    created_at::text,
                    updated_at::text
                "#,
                &[&parent_account_id, &child_id, &consent_type, &evidence],
            )
            .await?;

        Ok(row.map(|row| consent_from_row(&row)))
    }

    pub async fn list_consents(
        &self,
        parent_account_id: &str,
    ) -> Result<Vec<ConsentRecord>, tokio_postgres::Error> {
        let client = self.connect().await?;
        let rows = client
            .query(
                r#"
                SELECT id::text,
                    parent_account_id::text,
                    child_id::text,
                    consent_type,
                    status,
                    granted_at::text,
                    revoked_at::text,
                    evidence,
                    created_at::text,
                    updated_at::text
                FROM consents
                WHERE parent_account_id = $1::text::uuid
                ORDER BY created_at DESC
                "#,
                &[&parent_account_id],
            )
            .await?;

        Ok(rows.iter().map(consent_from_row).collect())
    }

    pub async fn revoke_consent(
        &self,
        parent_account_id: &str,
        consent_id: &str,
    ) -> Result<Option<ConsentRecord>, tokio_postgres::Error> {
        let client = self.connect().await?;
        let row = client
            .query_opt(
                r#"
                UPDATE consents
                SET status = 'revoked',
                    revoked_at = now()
                WHERE id = $2::text::uuid
                    AND parent_account_id = $1::text::uuid
                RETURNING id::text,
                    parent_account_id::text,
                    child_id::text,
                    consent_type,
                    status,
                    granted_at::text,
                    revoked_at::text,
                    evidence,
                    created_at::text,
                    updated_at::text
                "#,
                &[&parent_account_id, &consent_id],
            )
            .await?;

        Ok(row.map(|row| consent_from_row(&row)))
    }

    pub async fn request_data_export(
        &self,
        parent_account_id: &str,
        child_id: Option<&str>,
    ) -> Result<Option<DataExportResponse>, tokio_postgres::Error> {
        let Some(package) = self.build_data_export(parent_account_id, child_id).await? else {
            return Ok(None);
        };

        let audit_log = self
            .create_audit(
                parent_account_id,
                child_id,
                "data_export_generated",
                "data_export",
                child_id.or(Some(parent_account_id)),
                &serde_json::json!({
                    "child_id": child_id,
                    "format_version": package.export_format_version,
                    "status": "generated",
                }),
            )
            .await?;

        Ok(audit_log.map(|audit_log| DataExportResponse { audit_log, package }))
    }

    async fn build_data_export(
        &self,
        parent_account_id: &str,
        child_id: Option<&str>,
    ) -> Result<Option<DataExportPackage>, tokio_postgres::Error> {
        let client = self.connect().await?;
        let parent = client
            .query_opt(
                r#"
                SELECT id::text,
                    email,
                    display_name,
                    locale,
                    is_content_admin,
                    sound_enabled,
                    voice_volume,
                    effect_volume,
                    auto_play_voice
                FROM parent_accounts
                WHERE id = $1::text::uuid
                "#,
                &[&parent_account_id],
            )
            .await?
            .map(|row| parent_from_row(&row));

        let Some(parent) = parent else {
            return Ok(None);
        };

        let generated_at = client
            .query_one("SELECT now()::text AS generated_at", &[])
            .await?
            .get("generated_at");

        let child_rows = client
            .query(
                r#"
                SELECT id::text,
                    parent_account_id::text,
                    display_name,
                    age_band,
                    market_region,
                    english_variant,
                    avatar_asset_id::text,
                    created_at::text,
                    updated_at::text
                FROM children
                WHERE parent_account_id = $1::text::uuid
                    AND ($2::text IS NULL OR id = $2::text::uuid)
                ORDER BY created_at ASC
                "#,
                &[&parent_account_id, &child_id],
            )
            .await?;
        let children = child_rows.iter().map(child_from_row).collect::<Vec<_>>();
        if child_id.is_some() && children.is_empty() {
            return Ok(None);
        }

        let consent_rows = client
            .query(
                r#"
                SELECT id::text,
                    parent_account_id::text,
                    child_id::text,
                    consent_type,
                    status,
                    granted_at::text,
                    revoked_at::text,
                    evidence,
                    created_at::text,
                    updated_at::text
                FROM consents
                WHERE parent_account_id = $1::text::uuid
                    AND (
                        $2::text IS NULL
                        OR child_id = $2::text::uuid
                        OR child_id IS NULL
                    )
                ORDER BY created_at ASC
                "#,
                &[&parent_account_id, &child_id],
            )
            .await?;

        let session_rows = client
            .query(
                r#"
                SELECT learning_sessions.id::text,
                    learning_sessions.child_id::text,
                    learning_sessions.course_id::text,
                    learning_sessions.lesson_id::text,
                    learning_sessions.started_at::text,
                    learning_sessions.completed_at::text
                FROM learning_sessions
                INNER JOIN children ON children.id = learning_sessions.child_id
                WHERE children.parent_account_id = $1::text::uuid
                    AND ($2::text IS NULL OR learning_sessions.child_id = $2::text::uuid)
                ORDER BY learning_sessions.started_at ASC
                "#,
                &[&parent_account_id, &child_id],
            )
            .await?;

        let attempt_rows = client
            .query(
                r#"
                SELECT attempts.id::text,
                    attempts.child_id::text,
                    attempts.activity_id::text,
                    attempts.session_id::text,
                    attempts.answer,
                    attempts.is_correct,
                    attempts.score::double precision,
                    attempts.duration_ms,
                    attempts.created_at::text
                FROM attempts
                INNER JOIN children ON children.id = attempts.child_id
                WHERE children.parent_account_id = $1::text::uuid
                    AND ($2::text IS NULL OR attempts.child_id = $2::text::uuid)
                ORDER BY attempts.created_at ASC
                "#,
                &[&parent_account_id, &child_id],
            )
            .await?;

        let progress_rows = client
            .query(
                r#"
                SELECT progress_records.id::text,
                    progress_records.child_id::text,
                    progress_records.course_id::text,
                    progress_records.lesson_id::text,
                    progress_records.activity_id::text,
                    progress_records.mastery_score::double precision,
                    progress_records.attempts_count,
                    progress_records.last_attempt_at::text,
                    progress_records.updated_at::text
                FROM progress_records
                INNER JOIN children ON children.id = progress_records.child_id
                WHERE children.parent_account_id = $1::text::uuid
                    AND ($2::text IS NULL OR progress_records.child_id = $2::text::uuid)
                ORDER BY progress_records.updated_at ASC
                "#,
                &[&parent_account_id, &child_id],
            )
            .await?;

        let reward_rows = client
            .query(
                r#"
                SELECT rewards.id::text,
                    rewards.child_id::text,
                    rewards.reward_type,
                    rewards.reward_key,
                    rewards.source_activity_id::text,
                    rewards.awarded_at::text,
                    rewards.metadata
                FROM rewards
                INNER JOIN children ON children.id = rewards.child_id
                WHERE children.parent_account_id = $1::text::uuid
                    AND ($2::text IS NULL OR rewards.child_id = $2::text::uuid)
                ORDER BY rewards.awarded_at ASC
                "#,
                &[&parent_account_id, &child_id],
            )
            .await?;

        let audit_rows = client
            .query(
                r#"
                SELECT id::text,
                    actor_parent_account_id::text,
                    child_id::text,
                    action,
                    entity_type,
                    entity_id::text,
                    metadata,
                    created_at::text
                FROM audit_logs
                WHERE actor_parent_account_id = $1::text::uuid
                    AND (
                        $2::text IS NULL
                        OR child_id = $2::text::uuid
                        OR child_id IS NULL
                    )
                ORDER BY created_at ASC
                "#,
                &[&parent_account_id, &child_id],
            )
            .await?;

        Ok(Some(DataExportPackage {
            export_format_version: 1,
            generated_at,
            scope: DataExportScope {
                parent_account_id: parent_account_id.to_string(),
                child_id: child_id.map(ToOwned::to_owned),
            },
            parent,
            children,
            consents: consent_rows.iter().map(consent_from_row).collect(),
            learning_sessions: session_rows.iter().map(session_from_row).collect(),
            attempts: attempt_rows.iter().map(attempt_from_row).collect(),
            progress_records: progress_rows.iter().map(progress_from_row).collect(),
            rewards: reward_rows.iter().map(reward_from_row).collect(),
            audit_logs: audit_rows.iter().map(audit_from_row).collect(),
        }))
    }

    pub async fn delete_parent_account(
        &self,
        parent_account_id: &str,
    ) -> Result<Option<AuditLogRecord>, tokio_postgres::Error> {
        let client = self.connect().await?;
        let parent_exists = client
            .query_one(
                r#"
                SELECT EXISTS (
                    SELECT 1 FROM parent_accounts
                    WHERE id = $1::text::uuid
                )
                "#,
                &[&parent_account_id],
            )
            .await?
            .get::<_, bool>(0);

        if !parent_exists {
            return Ok(None);
        }

        let audit = self
            .create_audit(
                parent_account_id,
                None,
                "parent_account_deleted",
                "parent_account",
                Some(parent_account_id),
                &serde_json::json!({ "status": "deleted_by_parent_request" }),
            )
            .await?;

        client
            .execute(
                r#"
                DELETE FROM parent_accounts
                WHERE id = $1::text::uuid
                "#,
                &[&parent_account_id],
            )
            .await?;

        Ok(audit)
    }

    pub async fn delete_child_data(
        &self,
        parent_account_id: &str,
        child_id: &str,
    ) -> Result<Option<AuditLogRecord>, tokio_postgres::Error> {
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

        let audit = self
            .create_audit(
                parent_account_id,
                Some(child_id),
                "child_data_deleted",
                "child",
                Some(child_id),
                &serde_json::json!({ "status": "deleted_by_parent_request" }),
            )
            .await?;

        client
            .execute(
                r#"
                DELETE FROM children
                WHERE id = $2::text::uuid
                    AND parent_account_id = $1::text::uuid
                "#,
                &[&parent_account_id, &child_id],
            )
            .await?;

        Ok(audit)
    }

    pub async fn create_audit(
        &self,
        parent_account_id: &str,
        child_id: Option<&str>,
        action: &str,
        entity_type: &str,
        entity_id: Option<&str>,
        metadata: &Value,
    ) -> Result<Option<AuditLogRecord>, tokio_postgres::Error> {
        let client = self.connect().await?;
        let row = client
            .query_opt(
                r#"
                INSERT INTO audit_logs (
                    actor_parent_account_id,
                    child_id,
                    action,
                    entity_type,
                    entity_id,
                    metadata
                )
                SELECT $1::text::uuid,
                    $2::text::uuid,
                    $3,
                    $4,
                    $5::text::uuid,
                    $6
                WHERE (
                    $2::text IS NULL
                    OR EXISTS (
                        SELECT 1 FROM children
                        WHERE id = $2::text::uuid
                            AND parent_account_id = $1::text::uuid
                    )
                )
                RETURNING id::text,
                    actor_parent_account_id::text,
                    child_id::text,
                    action,
                    entity_type,
                    entity_id::text,
                    metadata,
                    created_at::text
                "#,
                &[
                    &parent_account_id,
                    &child_id,
                    &action,
                    &entity_type,
                    &entity_id,
                    &metadata,
                ],
            )
            .await?;

        Ok(row.map(|row| audit_from_row(&row)))
    }
}

fn parent_from_row(row: &tokio_postgres::Row) -> ParentAccount {
    ParentAccount {
        id: row.get("id"),
        email: row.get("email"),
        display_name: row.get("display_name"),
        locale: row.get("locale"),
        is_content_admin: row.get("is_content_admin"),
        sound_enabled: row.get("sound_enabled"),
        voice_volume: row.get("voice_volume"),
        effect_volume: row.get("effect_volume"),
        auto_play_voice: row.get("auto_play_voice"),
    }
}

fn child_from_row(row: &tokio_postgres::Row) -> ChildProfile {
    ChildProfile {
        id: row.get("id"),
        parent_account_id: row.get("parent_account_id"),
        display_name: row.get("display_name"),
        age_band: row.get("age_band"),
        market_region: row.get("market_region"),
        english_variant: row.get("english_variant"),
        avatar_asset_id: row.get("avatar_asset_id"),
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
    }
}

fn consent_from_row(row: &tokio_postgres::Row) -> ConsentRecord {
    ConsentRecord {
        id: row.get("id"),
        parent_account_id: row.get("parent_account_id"),
        child_id: row.get("child_id"),
        consent_type: row.get("consent_type"),
        status: row.get("status"),
        granted_at: row.get("granted_at"),
        revoked_at: row.get("revoked_at"),
        evidence: row.get("evidence"),
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
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

fn audit_from_row(row: &tokio_postgres::Row) -> AuditLogRecord {
    AuditLogRecord {
        id: row.get("id"),
        actor_parent_account_id: row.get("actor_parent_account_id"),
        child_id: row.get("child_id"),
        action: row.get("action"),
        entity_type: row.get("entity_type"),
        entity_id: row.get("entity_id"),
        metadata: row.get("metadata"),
        created_at: row.get("created_at"),
    }
}
