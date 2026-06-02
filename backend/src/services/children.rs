use serde::Deserialize;

use crate::{
    domain::ChildProfile,
    errors::ApiError,
    repositories::children::{ChildRepository, ChildUpdate},
};

#[derive(Debug, Deserialize)]
pub struct CreateChildRequest {
    pub display_name: String,
    pub age_band: String,
    pub market_region: String,
    pub english_variant: String,
    pub avatar_asset_id: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateChildRequest {
    pub display_name: Option<String>,
    pub age_band: Option<String>,
    pub market_region: Option<String>,
    pub english_variant: Option<String>,
    pub avatar_asset_id: Option<String>,
}

pub struct ChildService {
    repository: ChildRepository,
}

impl ChildService {
    pub fn new(repository: ChildRepository) -> Self {
        Self { repository }
    }

    pub async fn create(
        &self,
        parent_account_id: &str,
        request: CreateChildRequest,
    ) -> Result<ChildProfile, ApiError> {
        let display_name = validate_display_name(&request.display_name)?;
        let age_band = validate_age_band(&request.age_band)?;
        let market_region = validate_market_region(&request.market_region)?;
        let english_variant = validate_english_variant(&request.english_variant)?;

        self.repository
            .create(
                parent_account_id,
                display_name,
                age_band,
                market_region,
                english_variant,
                request.avatar_asset_id.as_deref(),
            )
            .await
            .map_err(map_database_error)
    }

    pub async fn list(&self, parent_account_id: &str) -> Result<Vec<ChildProfile>, ApiError> {
        self.repository
            .list_by_parent(parent_account_id)
            .await
            .map_err(map_database_error)
    }

    pub async fn get(
        &self,
        parent_account_id: &str,
        child_id: &str,
    ) -> Result<ChildProfile, ApiError> {
        self.repository
            .find_for_parent(parent_account_id, child_id)
            .await
            .map_err(map_database_error)?
            .ok_or(ApiError::NotFound)
    }

    pub async fn update(
        &self,
        parent_account_id: &str,
        child_id: &str,
        request: UpdateChildRequest,
    ) -> Result<ChildProfile, ApiError> {
        let display_name = request
            .display_name
            .as_deref()
            .map(validate_display_name)
            .transpose()?;
        let age_band = request
            .age_band
            .as_deref()
            .map(validate_age_band)
            .transpose()?;
        let market_region = request
            .market_region
            .as_deref()
            .map(validate_market_region)
            .transpose()?;
        let english_variant = request
            .english_variant
            .as_deref()
            .map(validate_english_variant)
            .transpose()?;

        self.repository
            .update_for_parent(ChildUpdate {
                parent_account_id,
                child_id,
                display_name,
                age_band,
                market_region,
                english_variant,
                avatar_asset_id: request.avatar_asset_id.as_deref(),
            })
            .await
            .map_err(map_database_error)?
            .ok_or(ApiError::NotFound)
    }

    pub async fn delete(&self, parent_account_id: &str, child_id: &str) -> Result<(), ApiError> {
        let deleted = self
            .repository
            .delete_for_parent(parent_account_id, child_id)
            .await
            .map_err(map_database_error)?;

        if deleted {
            Ok(())
        } else {
            Err(ApiError::NotFound)
        }
    }
}

fn validate_display_name(display_name: &str) -> Result<&str, ApiError> {
    let trimmed = display_name.trim();
    if trimmed.is_empty() {
        return Err(ApiError::BadRequest("display_name_required"));
    }
    Ok(trimmed)
}

fn validate_age_band(age_band: &str) -> Result<&str, ApiError> {
    match age_band {
        "3-5" | "6-8" | "9-11" => Ok(age_band),
        _ => Err(ApiError::BadRequest("invalid_age_band")),
    }
}

fn validate_market_region(market_region: &str) -> Result<&str, ApiError> {
    match market_region {
        "DE" | "UK" | "US" | "TW" | "OTHER" => Ok(market_region),
        _ => Err(ApiError::BadRequest("invalid_market_region")),
    }
}

fn validate_english_variant(english_variant: &str) -> Result<&str, ApiError> {
    match english_variant {
        "american" | "british" => Ok(english_variant),
        _ => Err(ApiError::BadRequest("invalid_english_variant")),
    }
}

fn map_database_error(error: tokio_postgres::Error) -> ApiError {
    tracing::error!(%error, "child repository error");
    ApiError::DatabaseUnavailable
}
