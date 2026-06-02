use tokio_postgres::{Client, NoTls, error::SqlState};

use crate::domain::ParentAccount;

#[derive(Debug)]
pub enum AuthRepositoryError {
    Conflict,
    Database(tokio_postgres::Error),
}

impl From<tokio_postgres::Error> for AuthRepositoryError {
    fn from(error: tokio_postgres::Error) -> Self {
        if error
            .code()
            .is_some_and(|code| *code == SqlState::UNIQUE_VIOLATION)
        {
            Self::Conflict
        } else {
            Self::Database(error)
        }
    }
}

pub struct ParentAuthRepository {
    database_url: String,
}

pub struct ParentWithPasswordHash {
    pub parent: ParentAccount,
    pub password_hash: String,
}

pub struct StoredSession {
    pub expires_at: String,
}

pub struct ParentUpdate<'a> {
    pub parent_account_id: &'a str,
    pub display_name: Option<&'a str>,
    pub locale: Option<&'a str>,
    pub sound_enabled: Option<bool>,
    pub voice_volume: Option<i32>,
    pub effect_volume: Option<i32>,
    pub auto_play_voice: Option<bool>,
}

impl ParentAuthRepository {
    pub fn new(database_url: String) -> Self {
        Self { database_url }
    }

    async fn connect(&self) -> Result<Client, tokio_postgres::Error> {
        let (client, connection) = tokio_postgres::connect(&self.database_url, NoTls).await?;
        tokio::spawn(async move {
            if let Err(error) = connection.await {
                tracing::error!(%error, "postgres auth connection error");
            }
        });
        Ok(client)
    }

    pub async fn create_parent(
        &self,
        email: &str,
        password_hash: &str,
        display_name: &str,
        locale: &str,
    ) -> Result<ParentAccount, AuthRepositoryError> {
        let client = self.connect().await?;
        let row = client
            .query_one(
                r#"
                INSERT INTO parent_accounts (email, password_hash, display_name, locale)
                VALUES ($1, $2, $3, $4)
                RETURNING id::text,
                    email,
                    display_name,
                    locale,
                    is_content_admin,
                    sound_enabled,
                    voice_volume,
                    effect_volume,
                    auto_play_voice
                "#,
                &[&email, &password_hash, &display_name, &locale],
            )
            .await?;

        Ok(parent_from_row(&row))
    }

    pub async fn find_parent_by_email(
        &self,
        email: &str,
    ) -> Result<Option<ParentWithPasswordHash>, AuthRepositoryError> {
        let client = self.connect().await?;
        let row = client
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
                    auto_play_voice,
                    password_hash
                FROM parent_accounts
                WHERE lower(email) = lower($1)
                "#,
                &[&email],
            )
            .await?;

        Ok(row.map(|row| ParentWithPasswordHash {
            parent: parent_from_row(&row),
            password_hash: row.get("password_hash"),
        }))
    }

    pub async fn create_session(
        &self,
        parent_account_id: &str,
        token_hash: &str,
    ) -> Result<StoredSession, AuthRepositoryError> {
        let client = self.connect().await?;
        let row = client
            .query_one(
                r#"
                INSERT INTO parent_sessions (parent_account_id, token_hash, expires_at)
                VALUES ($1::text::uuid, $2, now() + interval '30 days')
                RETURNING expires_at::text
                "#,
                &[&parent_account_id, &token_hash],
            )
            .await?;

        Ok(StoredSession {
            expires_at: row.get("expires_at"),
        })
    }

    pub async fn find_parent_by_token_hash(
        &self,
        token_hash: &str,
    ) -> Result<Option<ParentAccount>, AuthRepositoryError> {
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
                    parent_accounts.email,
                    parent_accounts.display_name,
                    parent_accounts.locale,
                    parent_accounts.is_content_admin,
                    parent_accounts.sound_enabled,
                    parent_accounts.voice_volume,
                    parent_accounts.effect_volume,
                    parent_accounts.auto_play_voice
                "#,
                &[&token_hash],
            )
            .await?;

        Ok(row.map(|row| parent_from_row(&row)))
    }

    pub async fn update_parent(
        &self,
        update: ParentUpdate<'_>,
    ) -> Result<Option<ParentAccount>, AuthRepositoryError> {
        let client = self.connect().await?;
        let row = client
            .query_opt(
                r#"
                UPDATE parent_accounts
                SET display_name = COALESCE($2::text, display_name),
                    locale = COALESCE($3::text, locale),
                    sound_enabled = COALESCE($4, sound_enabled),
                    voice_volume = COALESCE($5, voice_volume),
                    effect_volume = COALESCE($6, effect_volume),
                    auto_play_voice = COALESCE($7, auto_play_voice)
                WHERE id = $1::text::uuid
                RETURNING id::text,
                    email,
                    display_name,
                    locale,
                    is_content_admin,
                    sound_enabled,
                    voice_volume,
                    effect_volume,
                    auto_play_voice
                "#,
                &[
                    &update.parent_account_id,
                    &update.display_name,
                    &update.locale,
                    &update.sound_enabled,
                    &update.voice_volume,
                    &update.effect_volume,
                    &update.auto_play_voice,
                ],
            )
            .await?;

        Ok(row.map(|row| parent_from_row(&row)))
    }

    pub async fn revoke_session(&self, token_hash: &str) -> Result<bool, AuthRepositoryError> {
        let client = self.connect().await?;
        let changed = client
            .execute(
                r#"
                UPDATE parent_sessions
                SET revoked_at = now()
                WHERE token_hash = $1
                    AND revoked_at IS NULL
                "#,
                &[&token_hash],
            )
            .await?;

        Ok(changed > 0)
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
