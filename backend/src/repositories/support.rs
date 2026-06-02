use tokio_postgres::{Client, NoTls};

use crate::domain::SupportRequestRecord;

pub struct SupportRepository {
    database_url: String,
}

impl SupportRepository {
    pub fn new(database_url: String) -> Self {
        Self { database_url }
    }

    async fn connect(&self) -> Result<Client, tokio_postgres::Error> {
        let (client, connection) = tokio_postgres::connect(&self.database_url, NoTls).await?;
        tokio::spawn(async move {
            if let Err(error) = connection.await {
                tracing::error!(%error, "postgres support connection error");
            }
        });
        Ok(client)
    }

    pub async fn create_request(
        &self,
        parent_account_id: &str,
        child_id: Option<&str>,
        request_type: &str,
        subject: &str,
        message: &str,
        region: Option<&str>,
    ) -> Result<Option<SupportRequestRecord>, tokio_postgres::Error> {
        let client = self.connect().await?;
        let row = client
            .query_opt(
                r#"
                INSERT INTO support_requests (
                    parent_account_id,
                    child_id,
                    request_type,
                    subject,
                    message,
                    region
                )
                SELECT $1::text::uuid,
                    $2::text::uuid,
                    $3,
                    $4,
                    $5,
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
                    parent_account_id::text,
                    child_id::text,
                    request_type,
                    subject,
                    message,
                    status,
                    region,
                    created_at::text,
                    updated_at::text,
                    resolved_at::text
                "#,
                &[
                    &parent_account_id,
                    &child_id,
                    &request_type,
                    &subject,
                    &message,
                    &region,
                ],
            )
            .await?;

        Ok(row.map(|row| support_request_from_row(&row)))
    }

    pub async fn list_requests(
        &self,
        parent_account_id: &str,
    ) -> Result<Vec<SupportRequestRecord>, tokio_postgres::Error> {
        let client = self.connect().await?;
        let rows = client
            .query(
                r#"
                SELECT id::text,
                    parent_account_id::text,
                    child_id::text,
                    request_type,
                    subject,
                    message,
                    status,
                    region,
                    created_at::text,
                    updated_at::text,
                    resolved_at::text
                FROM support_requests
                WHERE parent_account_id = $1::text::uuid
                ORDER BY created_at DESC
                LIMIT 50
                "#,
                &[&parent_account_id],
            )
            .await?;

        Ok(rows.iter().map(support_request_from_row).collect())
    }
}

fn support_request_from_row(row: &tokio_postgres::Row) -> SupportRequestRecord {
    SupportRequestRecord {
        id: row.get("id"),
        parent_account_id: row.get("parent_account_id"),
        child_id: row.get("child_id"),
        request_type: row.get("request_type"),
        subject: row.get("subject"),
        message: row.get("message"),
        status: row.get("status"),
        region: row.get("region"),
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
        resolved_at: row.get("resolved_at"),
    }
}
