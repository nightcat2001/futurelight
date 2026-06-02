use argon2::{
    Argon2, PasswordHash, PasswordHasher, PasswordVerifier,
    password_hash::{SaltString, rand_core::OsRng},
};
use rand_core::RngCore;
use serde::Deserialize;
use sha2::{Digest, Sha256};

use crate::{
    domain::{AuthResponse, MeResponse, ParentAccount, SessionResponse},
    errors::ApiError,
    repositories::auth::{AuthRepositoryError, ParentAuthRepository, ParentUpdate},
};

#[derive(Debug, Deserialize)]
pub struct RegisterRequest {
    pub email: String,
    pub password: String,
    pub display_name: String,
    pub locale: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateParentRequest {
    pub display_name: Option<String>,
    pub locale: Option<String>,
    pub sound_enabled: Option<bool>,
    pub voice_volume: Option<i32>,
    pub effect_volume: Option<i32>,
    pub auto_play_voice: Option<bool>,
}

pub struct AuthService {
    repository: ParentAuthRepository,
}

impl AuthService {
    pub fn new(repository: ParentAuthRepository) -> Self {
        Self { repository }
    }

    pub async fn register(&self, request: RegisterRequest) -> Result<AuthResponse, ApiError> {
        let email = normalize_email(&request.email)?;
        validate_password(&request.password)?;
        let display_name = validate_display_name(&request.display_name)?;
        let locale = request.locale.unwrap_or_else(|| "en".to_string());
        let password_hash = hash_password(&request.password)?;

        let parent = self
            .repository
            .create_parent(&email, &password_hash, display_name, &locale)
            .await
            .map_err(map_repository_error)?;

        self.issue_session(parent).await
    }

    pub async fn login(&self, request: LoginRequest) -> Result<AuthResponse, ApiError> {
        let email = normalize_email(&request.email)?;
        let Some(stored) = self
            .repository
            .find_parent_by_email(&email)
            .await
            .map_err(map_repository_error)?
        else {
            return Err(ApiError::Unauthorized);
        };

        verify_password(&request.password, &stored.password_hash)?;
        self.issue_session(stored.parent).await
    }

    pub async fn me(&self, token: &str) -> Result<MeResponse, ApiError> {
        Ok(MeResponse {
            parent: self.parent_for_token(token).await?,
        })
    }

    pub async fn update_parent(
        &self,
        token: &str,
        request: UpdateParentRequest,
    ) -> Result<MeResponse, ApiError> {
        let current_parent = self.parent_for_token(token).await?;
        let display_name = request
            .display_name
            .as_deref()
            .map(validate_display_name)
            .transpose()?;
        let locale = request.locale.as_deref().map(validate_locale).transpose()?;
        let voice_volume = request.voice_volume.map(validate_volume).transpose()?;
        let effect_volume = request.effect_volume.map(validate_volume).transpose()?;

        if display_name.is_none()
            && locale.is_none()
            && request.sound_enabled.is_none()
            && voice_volume.is_none()
            && effect_volume.is_none()
            && request.auto_play_voice.is_none()
        {
            return Err(ApiError::BadRequest("settings_required"));
        }

        let parent = self
            .repository
            .update_parent(ParentUpdate {
                parent_account_id: &current_parent.id,
                display_name,
                locale,
                sound_enabled: request.sound_enabled,
                voice_volume,
                effect_volume,
                auto_play_voice: request.auto_play_voice,
            })
            .await
            .map_err(map_repository_error)?
            .ok_or(ApiError::NotFound)?;

        Ok(MeResponse { parent })
    }

    pub async fn parent_for_token(&self, token: &str) -> Result<ParentAccount, ApiError> {
        let token_hash = hash_token(token);
        let Some(parent) = self
            .repository
            .find_parent_by_token_hash(&token_hash)
            .await
            .map_err(map_repository_error)?
        else {
            return Err(ApiError::Unauthorized);
        };

        Ok(parent)
    }

    pub async fn logout(&self, token: &str) -> Result<(), ApiError> {
        let token_hash = hash_token(token);
        self.repository
            .revoke_session(&token_hash)
            .await
            .map_err(map_repository_error)?;
        Ok(())
    }

    async fn issue_session(&self, parent: ParentAccount) -> Result<AuthResponse, ApiError> {
        let token = generate_token();
        let token_hash = hash_token(&token);
        let session = self
            .repository
            .create_session(&parent.id, &token_hash)
            .await
            .map_err(map_repository_error)?;

        Ok(AuthResponse {
            parent,
            session: SessionResponse {
                token,
                expires_at: session.expires_at,
            },
        })
    }
}

fn normalize_email(email: &str) -> Result<String, ApiError> {
    let normalized = email.trim().to_lowercase();
    if normalized.len() < 5 || !normalized.contains('@') {
        return Err(ApiError::BadRequest("invalid_email"));
    }
    Ok(normalized)
}

fn validate_password(password: &str) -> Result<(), ApiError> {
    if password.len() < 8 {
        return Err(ApiError::BadRequest("password_too_short"));
    }
    Ok(())
}

fn validate_display_name(display_name: &str) -> Result<&str, ApiError> {
    let trimmed = display_name.trim();
    if trimmed.is_empty() {
        return Err(ApiError::BadRequest("display_name_required"));
    }
    Ok(trimmed)
}

fn validate_locale(locale: &str) -> Result<&str, ApiError> {
    let trimmed = locale.trim();
    if trimmed.len() < 2 || trimmed.len() > 16 {
        return Err(ApiError::BadRequest("invalid_locale"));
    }
    Ok(trimmed)
}

fn validate_volume(volume: i32) -> Result<i32, ApiError> {
    if !(0..=100).contains(&volume) {
        return Err(ApiError::BadRequest("invalid_volume"));
    }
    Ok(volume)
}

fn hash_password(password: &str) -> Result<String, ApiError> {
    let salt = SaltString::generate(&mut OsRng);
    Argon2::default()
        .hash_password(password.as_bytes(), &salt)
        .map(|hash| hash.to_string())
        .map_err(|error| {
            tracing::error!(%error, "password hash failed");
            ApiError::Internal
        })
}

fn verify_password(password: &str, password_hash: &str) -> Result<(), ApiError> {
    let parsed_hash = PasswordHash::new(password_hash).map_err(|error| {
        tracing::error!(%error, "stored password hash parse failed");
        ApiError::Internal
    })?;

    Argon2::default()
        .verify_password(password.as_bytes(), &parsed_hash)
        .map_err(|_| ApiError::Unauthorized)
}

fn generate_token() -> String {
    let mut bytes = [0_u8; 32];
    OsRng.fill_bytes(&mut bytes);
    encode_hex(&bytes)
}

pub fn hash_token(token: &str) -> String {
    let digest = Sha256::digest(token.as_bytes());
    encode_hex(&digest)
}

fn encode_hex(bytes: &[u8]) -> String {
    const HEX: &[u8; 16] = b"0123456789abcdef";
    let mut output = String::with_capacity(bytes.len() * 2);
    for byte in bytes {
        output.push(HEX[(byte >> 4) as usize] as char);
        output.push(HEX[(byte & 0x0f) as usize] as char);
    }
    output
}

fn map_repository_error(error: AuthRepositoryError) -> ApiError {
    match error {
        AuthRepositoryError::Conflict => ApiError::Conflict("parent_account_exists"),
        AuthRepositoryError::Database(error) => {
            tracing::error!(%error, "auth repository error");
            ApiError::DatabaseUnavailable
        }
    }
}
