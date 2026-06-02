use tokio_postgres::NoTls;

#[derive(Clone)]
pub struct HealthRepository {
    database_url: String,
}

impl HealthRepository {
    pub fn new(database_url: String) -> Self {
        Self { database_url }
    }

    pub async fn check_database(&self) -> Result<(), tokio_postgres::Error> {
        let (client, connection) = tokio_postgres::connect(&self.database_url, NoTls).await?;
        tokio::spawn(async move {
            if let Err(error) = connection.await {
                tracing::error!(%error, "postgres health connection error");
            }
        });

        client.query_one("select 1", &[]).await?;
        Ok(())
    }
}
