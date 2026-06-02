use serde::Serialize;
use serde_json::Value;

#[derive(Serialize)]
pub struct HealthResponse {
    pub status: &'static str,
    pub service: &'static str,
}

#[derive(Serialize)]
pub struct DbHealthResponse {
    pub status: &'static str,
    pub database: &'static str,
}

#[derive(Serialize)]
pub struct PageSummary {
    pub id: &'static str,
    pub title: &'static str,
    pub primary_action: &'static str,
    pub route: &'static str,
}

#[derive(Serialize)]
pub struct HomeSummary {
    pub current_child: &'static str,
    pub recommendation: &'static str,
    pub next_action: &'static str,
    pub completed_units: u8,
    pub streak_days: u8,
    pub stars: u16,
}

#[derive(Debug, Clone, Serialize)]
pub struct ParentAccount {
    pub id: String,
    pub email: String,
    pub display_name: String,
    pub locale: String,
    pub is_content_admin: bool,
    pub sound_enabled: bool,
    pub voice_volume: i32,
    pub effect_volume: i32,
    pub auto_play_voice: bool,
}

#[derive(Debug, Clone, Serialize)]
pub struct SessionResponse {
    pub token: String,
    pub expires_at: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct AuthResponse {
    pub parent: ParentAccount,
    pub session: SessionResponse,
}

#[derive(Debug, Clone, Serialize)]
pub struct MeResponse {
    pub parent: ParentAccount,
}

#[derive(Debug, Clone, Serialize)]
pub struct ChildProfile {
    pub id: String,
    pub parent_account_id: String,
    pub display_name: String,
    pub age_band: String,
    pub market_region: String,
    pub english_variant: String,
    pub avatar_asset_id: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct CourseSummary {
    pub id: String,
    pub slug: String,
    pub status: String,
    pub title: String,
    pub target_language: String,
    pub level: String,
    pub market_regions: Vec<String>,
    pub english_variants: Vec<String>,
    pub cover_asset_path: Option<String>,
    pub lesson_count: i64,
}

#[derive(Debug, Clone, Serialize)]
pub struct CourseDetail {
    pub id: String,
    pub slug: String,
    pub status: String,
    pub title: String,
    pub target_language: String,
    pub level: String,
    pub market_regions: Vec<String>,
    pub english_variants: Vec<String>,
    pub cover_asset_path: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct LessonSummary {
    pub id: String,
    pub course_id: String,
    pub slug: String,
    pub title: String,
    pub learning_objectives: Value,
    pub sort_order: i32,
}

#[derive(Debug, Clone, Serialize)]
pub struct ActivitySummary {
    pub id: String,
    pub lesson_id: String,
    pub slug: String,
    pub activity_type: String,
    pub prompt: Value,
    pub content: Value,
    pub answer_key: Value,
    pub sort_order: i32,
}

#[derive(Debug, Clone, Serialize)]
pub struct AssetSummary {
    pub id: String,
    pub asset_key: String,
    pub asset_type: String,
    pub path: Option<String>,
    pub status: String,
    pub source: Option<String>,
    pub prompt_summary: Option<String>,
    pub metadata: Value,
}

#[derive(Debug, Clone, Serialize)]
pub struct AdminCourseRecord {
    pub id: String,
    pub slug: String,
    pub status: String,
    pub title: String,
    pub target_language: String,
    pub level: String,
    pub market_regions: Vec<String>,
    pub english_variants: Vec<String>,
    pub cover_asset_id: Option<String>,
    pub cover_asset_path: Option<String>,
    pub sort_order: i32,
    pub published_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub lesson_count: i64,
}

#[derive(Debug, Clone, Serialize)]
pub struct ContentVersionRecord {
    pub id: String,
    pub entity_type: String,
    pub entity_id: String,
    pub action: String,
    pub actor_parent_account_id: Option<String>,
    pub snapshot: Value,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct PublishCheckResponse {
    pub course_id: String,
    pub can_publish: bool,
    pub issues: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct LearningSession {
    pub id: String,
    pub child_id: String,
    pub course_id: String,
    pub lesson_id: Option<String>,
    pub started_at: String,
    pub completed_at: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct AttemptRecord {
    pub id: String,
    pub child_id: String,
    pub activity_id: String,
    pub session_id: Option<String>,
    pub answer: Value,
    pub is_correct: bool,
    pub score: f64,
    pub duration_ms: Option<i32>,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct ProgressRecord {
    pub id: String,
    pub child_id: String,
    pub course_id: String,
    pub lesson_id: Option<String>,
    pub activity_id: Option<String>,
    pub mastery_score: f64,
    pub attempts_count: i32,
    pub last_attempt_at: Option<String>,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct RewardRecord {
    pub id: String,
    pub child_id: String,
    pub reward_type: String,
    pub reward_key: String,
    pub source_activity_id: Option<String>,
    pub awarded_at: String,
    pub metadata: Value,
}

#[derive(Debug, Clone, Serialize)]
pub struct ConsentRecord {
    pub id: String,
    pub parent_account_id: String,
    pub child_id: Option<String>,
    pub consent_type: String,
    pub status: String,
    pub granted_at: Option<String>,
    pub revoked_at: Option<String>,
    pub evidence: Value,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct AuditLogRecord {
    pub id: String,
    pub actor_parent_account_id: Option<String>,
    pub child_id: Option<String>,
    pub action: String,
    pub entity_type: String,
    pub entity_id: Option<String>,
    pub metadata: Value,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct DataExportScope {
    pub parent_account_id: String,
    pub child_id: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct DataExportPackage {
    pub export_format_version: u8,
    pub generated_at: String,
    pub scope: DataExportScope,
    pub parent: ParentAccount,
    pub children: Vec<ChildProfile>,
    pub consents: Vec<ConsentRecord>,
    pub learning_sessions: Vec<LearningSession>,
    pub attempts: Vec<AttemptRecord>,
    pub progress_records: Vec<ProgressRecord>,
    pub rewards: Vec<RewardRecord>,
    pub audit_logs: Vec<AuditLogRecord>,
}

#[derive(Debug, Clone, Serialize)]
pub struct DataExportRequestRecord {
    pub id: String,
    pub parent_account_id: String,
    pub child_id: Option<String>,
    pub status: String,
    pub scope: String,
    pub requested_at: String,
    pub completed_at: Option<String>,
    pub expires_at: Option<String>,
    pub package_format_version: Option<i32>,
    pub download_available: bool,
    pub audit_log_id: Option<String>,
    pub error_code: Option<String>,
    pub metadata: Value,
}

#[derive(Debug, Clone, Serialize)]
pub struct DataExportResponse {
    pub audit_log: AuditLogRecord,
    pub request: DataExportRequestRecord,
    pub package: DataExportPackage,
}

#[derive(Debug, Clone, Serialize)]
pub struct SupportRequestRecord {
    pub id: String,
    pub parent_account_id: String,
    pub child_id: Option<String>,
    pub request_type: String,
    pub subject: String,
    pub message: String,
    pub status: String,
    pub region: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub resolved_at: Option<String>,
}
