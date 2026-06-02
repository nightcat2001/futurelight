use crate::security::{SecurityConfig, SecurityState};

#[derive(Clone)]
pub struct AppState {
    pub database_url: String,
    pub security: SecurityState,
}

impl AppState {
    pub fn new(database_url: String, security: SecurityConfig) -> Self {
        Self {
            database_url,
            security: SecurityState::new(security),
        }
    }
}
