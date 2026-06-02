use tokio_postgres::{Client, NoTls};

use crate::domain::ChildProfile;

pub struct ChildRepository {
    database_url: String,
}

pub struct ChildUpdate<'a> {
    pub parent_account_id: &'a str,
    pub child_id: &'a str,
    pub display_name: Option<&'a str>,
    pub age_band: Option<&'a str>,
    pub market_region: Option<&'a str>,
    pub english_variant: Option<&'a str>,
    pub avatar_asset_id: Option<&'a str>,
}

impl ChildRepository {
    pub fn new(database_url: String) -> Self {
        Self { database_url }
    }

    async fn connect(&self) -> Result<Client, tokio_postgres::Error> {
        let (client, connection) = tokio_postgres::connect(&self.database_url, NoTls).await?;
        tokio::spawn(async move {
            if let Err(error) = connection.await {
                tracing::error!(%error, "postgres child connection error");
            }
        });
        Ok(client)
    }

    pub async fn create(
        &self,
        parent_account_id: &str,
        display_name: &str,
        age_band: &str,
        market_region: &str,
        english_variant: &str,
        avatar_asset_id: Option<&str>,
    ) -> Result<ChildProfile, tokio_postgres::Error> {
        let client = self.connect().await?;
        let row = client
            .query_one(
                r#"
                INSERT INTO children (
                    parent_account_id,
                    display_name,
                    age_band,
                    market_region,
                    english_variant,
                    avatar_asset_id
                )
                VALUES ($1::text::uuid, $2, $3, $4, $5, $6::text::uuid)
                RETURNING id::text,
                    parent_account_id::text,
                    display_name,
                    age_band,
                    market_region,
                    english_variant,
                    avatar_asset_id::text,
                    created_at::text,
                    updated_at::text
                "#,
                &[
                    &parent_account_id,
                    &display_name,
                    &age_band,
                    &market_region,
                    &english_variant,
                    &avatar_asset_id,
                ],
            )
            .await?;

        Ok(child_from_row(&row))
    }

    pub async fn list_by_parent(
        &self,
        parent_account_id: &str,
    ) -> Result<Vec<ChildProfile>, tokio_postgres::Error> {
        let client = self.connect().await?;
        let rows = client
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
                ORDER BY created_at ASC
                "#,
                &[&parent_account_id],
            )
            .await?;

        Ok(rows.iter().map(child_from_row).collect())
    }

    pub async fn find_for_parent(
        &self,
        parent_account_id: &str,
        child_id: &str,
    ) -> Result<Option<ChildProfile>, tokio_postgres::Error> {
        let client = self.connect().await?;
        let row = client
            .query_opt(
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
                    AND id = $2::text::uuid
                "#,
                &[&parent_account_id, &child_id],
            )
            .await?;

        Ok(row.map(|row| child_from_row(&row)))
    }

    pub async fn update_for_parent(
        &self,
        update: ChildUpdate<'_>,
    ) -> Result<Option<ChildProfile>, tokio_postgres::Error> {
        let client = self.connect().await?;
        let row = client
            .query_opt(
                r#"
                UPDATE children
                SET display_name = COALESCE($3::text, display_name),
                    age_band = COALESCE($4::text, age_band),
                    market_region = COALESCE($5::text, market_region),
                    english_variant = COALESCE($6::text, english_variant),
                    avatar_asset_id = COALESCE($7::text::uuid, avatar_asset_id)
                WHERE parent_account_id = $1::text::uuid
                    AND id = $2::text::uuid
                RETURNING id::text,
                    parent_account_id::text,
                    display_name,
                    age_band,
                    market_region,
                    english_variant,
                    avatar_asset_id::text,
                    created_at::text,
                    updated_at::text
                "#,
                &[
                    &update.parent_account_id,
                    &update.child_id,
                    &update.display_name,
                    &update.age_band,
                    &update.market_region,
                    &update.english_variant,
                    &update.avatar_asset_id,
                ],
            )
            .await?;

        Ok(row.map(|row| child_from_row(&row)))
    }

    pub async fn delete_for_parent(
        &self,
        parent_account_id: &str,
        child_id: &str,
    ) -> Result<bool, tokio_postgres::Error> {
        let client = self.connect().await?;
        let deleted = client
            .execute(
                r#"
                DELETE FROM children
                WHERE parent_account_id = $1::text::uuid
                    AND id = $2::text::uuid
                "#,
                &[&parent_account_id, &child_id],
            )
            .await?;

        Ok(deleted > 0)
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
