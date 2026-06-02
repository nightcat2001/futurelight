# FutureLight Child Privacy Data Map

Created: 2026-06-01 12:58:07 +08:00
Status: Implementation data map, not legal advice

This document maps the child-related data FutureLight currently collects, derives, stores, exports, deletes, or plans to collect. It is grounded in the current Rust API, PostgreSQL migrations, and React parent-center flows.

Official references checked on 2026-06-01:

- FTC COPPA six-step compliance plan: https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-six-step-compliance-plan-your-business
- ICO Age Appropriate Design Code: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/
- ICO Children and UK GDPR, ISS and consent: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/children-and-the-uk-gdpr-old/what-are-the-rules-about-an-iss-and-consent/
- Google Play Families Policy: https://support.google.com/googleplay/android-developer/answer/9893335
- SDK inventory: `docs/sdk-inventory.md`

## Current Boundary

- Product: child-directed language learning app with parent-managed accounts.
- Runtime today: local React frontend, Rust Axum API, PostgreSQL.
- Third-party SDKs in child flow today: none.
- Advertising identifiers today: none.
- Microphone, camera, precise location, contacts, phone number, AAID/IDFA, device serials today: not collected.
- Voice recordings today: not implemented.
- Export today: parent-gated export returns a downloadable JSON package with parent account fields, child profiles, consents, learning sessions, attempts, progress, rewards, and audit logs; password hashes and session token hashes are excluded.
- Deletion today: privacy child deletion deletes the child profile and cascades learning sessions, attempts, progress, rewards, and child-scoped consents. Parent account deletion deletes the parent account and cascades child profiles and sessions.

## Data Inventory

| Data / Record | Child Data? | Source | Storage | Purpose | Parent Control | Retention Status | Third Party Sharing | Gaps |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Parent email | No, parent account data | Parent registration | `parent_accounts.email` | Login, account ownership, consent/account notices | Parent can update display name/locale and delete the account through parent-gated privacy controls | Account lifetime; no retention schedule yet | None today | Email verification and retention policy missing |
| Parent display name / locale | No, parent account data | Parent registration/settings | `parent_accounts.display_name`, `locale` | Parent-center display, regional UX defaults | `PATCH /api/auth/me`, parent-gated | Account lifetime | None today | Locale-specific legal copy not complete |
| Parent password hash | No, credential data | Parent registration | `parent_accounts.password_hash` | Authentication and Parent Gate | Parent can indirectly rotate only after future password-reset work | Account lifetime | None today | Password reset, MFA, and rate limiting missing |
| Parent session token hash | No, credential/session data | Login/register/Parent Gate verification | `parent_sessions.token_hash`, `expires_at`, `revoked_at`, `last_used_at` | Authenticated API access | Logout revokes current session; Parent Gate temp sessions are revoked after verification | 30-day session expiry | None today | Session cleanup job missing |
| Child nickname/display name | Yes | Parent child profile form | `children.display_name` | Display child profile and progress summaries | Create/list/edit/delete via `/api/children`; privacy delete via `/api/privacy/children/{child_id}` | Profile lifetime; privacy deletion cascades | None today | Reviewed privacy notice wording missing |
| Child age band | Yes | Parent child profile form | `children.age_band` | Age-appropriate UX/content and privacy logic | Create/edit/delete child profile | Profile lifetime; privacy deletion cascades | None today | Region-specific consent thresholds need final legal rules |
| Child market region | Yes | Parent child profile form | `children.market_region` | Regional privacy/default logic, store/legal segmentation, and content availability filtering | Create/edit/delete child profile | Profile lifetime; privacy deletion cascades | None today | Add age-band content filtering and CMS controls for region availability |
| Child English variant | Yes | Parent child profile form | `children.english_variant` | American/British English content selection | Create/edit/delete child profile | Profile lifetime; privacy deletion cascades | None today | Add CMS controls and broader reviewed American/British content coverage |
| Avatar asset reference | Potentially child data if personalized | Parent profile or future asset flow | `children.avatar_asset_id` | Child profile image/avatar | Field exists; no UI upload today | Profile lifetime; deletion sets/cascades through child | None today | Personalized avatar policy and moderation missing |
| Learning session | Yes, behavioral child data | `/api/learning/sessions` | `learning_sessions` | Start/complete lesson tracking | Visible through summaries and export package; privacy deletion cascades | No explicit retention period yet | None today | Retention schedule missing |
| Learning attempt | Yes, behavioral child data | `/api/learning/attempts` | `attempts.answer`, `is_correct`, `score`, `duration_ms` | Progress, practice feedback, mastery calculation | Parent sees summary and export package; privacy deletion cascades | No explicit retention period yet | None today | Retention schedule missing |
| Progress record | Yes, derived child data | Attempt processing | `progress_records.mastery_score`, `attempts_count`, `last_attempt_at` | Mastery and weak-spot summaries | Parent summary reads `/api/children/{child_id}/progress`; privacy deletion cascades | Derived from attempts; no retention policy yet | None today | Explain derived-data deletion in policy |
| Reward record | Yes, derived child data | Correct attempts | `rewards.reward_type`, `reward_key`, `source_activity_id`, `metadata` | Motivation and parent/child progress display | Parent summary reads `/api/children/{child_id}/rewards`; privacy deletion cascades | Profile lifetime; no retention policy yet | None today | Broader reward taxonomy and retention rules missing |
| Consent record | Mixed parent/child legal record | Parent onboarding or parent center | `consents.parent_account_id`, `child_id`, `consent_type`, `status`, `evidence` | Parental privacy consent proof and revoke state | List/revoke via `/api/privacy/consents` and `/api/privacy/consents/{id}/revoke`; parent-gated | Active/revoked record retained while child exists; legal retention undefined | None today | Consent version, notice text, and region fields need expansion |
| Audit log | Mixed parent/child operational/legal record | Consent grant/revoke, export request, child deletion | `audit_logs` | Accountability and security/legal event trail | Not directly listed in UI except action result; export request writes audit event | Child id set null on child deletion; retention undefined | None today | Audit retention and export inclusion rules missing |
| Course/lesson/activity content | No child personal data | Seed migrations/content pipeline | `courses`, `lessons`, `activities` | Learning content delivery | Not user-specific | Product content lifetime | None today | Admin content approval flow missing |
| Asset metadata | Usually no; may become child data if personalized | Seed/assets pipeline | `assets` | Course cover/assets and future media | Not child-specific today | Asset lifecycle undefined | Image generation source/provenance only in local manifest today | Personalized uploads need separate handling |
| Browser localStorage auth token | Parent/session data | Login/register/session restore | Browser `futurelight.parentToken` | Preserve parent session | Logout clears token | Until logout/browser clear/session expiry | None today | Secure cookie strategy for production missing |
| Future voice recording | Yes, likely sensitive child data | Planned microphone/pronunciation flow | Not implemented | Pronunciation scoring | Must require explicit parent consent before storage | Must be short-lived by default | Possible speech/AI provider if introduced | Must not ship before consent, retention, processor review |
| Future analytics/crash SDK data | Potential child data if in child flow | Planned SDK inventory | Not implemented | Reliability/analytics | Must be excluded from child flow or child-approved | TBD | Potential SDK vendor | SDK inventory and app-store disclosures required before use |

## Implemented Parent Rights Paths

| Right / Control | Current Path | Backing Data | Status |
| --- | --- | --- | --- |
| Review child profile | `GET /api/children` and parent center child cards | `children` | Implemented |
| Review learning summary | Parent center summary, `/api/children/{child_id}/progress`, `/api/children/{child_id}/rewards` | `progress_records`, `rewards` | Implemented summary, full export missing |
| Grant consent | Child onboarding checkbox -> `POST /api/privacy/consents` | `consents`, `audit_logs` | Implemented first consent type |
| Revoke consent | Parent center -> `POST /api/privacy/consents/{consent_id}/revoke` | `consents`, `audit_logs` | Implemented and parent-gated |
| Download export | Parent center -> `POST /api/privacy/data-export-requests` | JSON response plus `audit_logs` | Implemented and parent-gated |
| Delete child data | Parent center -> `DELETE /api/privacy/children/{child_id}` | `children` cascade, `audit_logs` | Implemented and parent-gated |
| Delete parent account | Parent center -> `DELETE /api/privacy/parent-account` | `parent_accounts` cascade, `audit_logs` | Implemented and parent-gated |

## Data Flow Notes

1. Parent registers or logs in. The backend stores parent account data and a hashed session token.
2. Parent creates a child profile with age band, market region, and English variant. Optional onboarding consent writes a consent record and audit event.
3. Child learning creates learning sessions, attempts, derived progress records, and rewards. These records remain scoped to the parent-owned child.
4. Parent center reads child, progress, reward, and consent data through bearer-authenticated APIs.
5. Adult/destructive operations in the parent center require Parent Gate password verification through the real login API.
6. Data export returns a machine-readable JSON package and writes `data_export_generated` to `audit_logs`.
7. Privacy child deletion removes child-owned operational learning data through PostgreSQL cascades and writes an audit event before deletion.
8. Parent account deletion removes the parent account, child profiles, child-owned learning data, and parent sessions through PostgreSQL cascades and writes an audit event before deletion.

## Current Controls

- Bearer auth is required for parent/child/progress/privacy APIs.
- Repository queries enforce parent-child ownership before reads/writes.
- Parent Gate protects settings save, data export download, consent revoke, privacy child data deletion, parent account deletion, and child profile deletion.
- No child-directed advertising SDK, third-party analytics SDK, microphone, camera, precise location, phone number, or persistent advertising identifier is collected today.
- PostgreSQL foreign keys cascade child deletion through learning sessions, attempts, progress, rewards, and child-scoped consents.

## Release Blockers

- Write public privacy policy and direct parent notice from this data map.
- Schedule the implemented `cargo run -- retention-cleanup` job in production and tune retention windows after legal review.
- Add consent versioning, region, notice URL/hash, and lawful-basis metadata.
- Complete P0-LEGAL-002 for COPPA / GDPR Article 8 / UK Children's Code checklist.
- Keep `docs/sdk-inventory.md` current before adding analytics, crash reporting, payments, speech, AI, push, mobile permissions, or any third-party processor.
- Define backup retention and deletion propagation with the selected production PostgreSQL/object-storage providers.
- Do not implement voice recording or speech APIs until explicit consent, processor review, and short-retention rules are implemented.
