# FutureLight COPPA / GDPR Article 8 / UK Children's Code Checklist

Created: 2026-06-01 13:08:32 +08:00
Status: Engineering compliance checklist, not legal advice

This checklist converts `docs/child-privacy-data-map.md` into engineering gates for the current product. It tracks what is implemented today and what still blocks store/legal readiness.

Official references checked on 2026-06-01:

- FTC COPPA six-step compliance plan: https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-six-step-compliance-plan-your-business
- ICO Children and UK GDPR, ISS and consent: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/children-and-the-uk-gdpr-old/what-are-the-rules-about-an-iss-and-consent/
- ICO Age Appropriate Design Code: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/
- Google Play Families Policy: https://support.google.com/googleplay/android-developer/answer/9893335
- EU GDPR Article 8 reference: https://eur-lex.europa.eu/legal-content/EN-FR/TXT/?uri=CELEX%3A32016R0679

## Region Rules

| Market | Rule Used In Product | Current Logic | Status |
| --- | --- | --- | --- |
| US | COPPA path: all current child age bands are under 13, so parent consent is required before child learning data is recorded. | `children.market_region = 'US'` requires granted `parental_privacy` consent before `POST /api/learning/sessions` and `POST /api/learning/attempts` can write learning data. | Implemented baseline |
| DE | GDPR Article 8 path: use the 16-year default for consent-backed information society services until counsel confirms a narrower German rule. All current age bands are under 16. | `children.market_region = 'DE'` requires granted `parental_privacy` consent before learning data writes. | Implemented baseline |
| UK | UK GDPR/Children's Code path: all current age bands are under 13, and the child experience must use high-privacy defaults. | `children.market_region = 'UK'` requires granted `parental_privacy` consent before learning data writes; current child flow has no ads, analytics SDK, location, microphone, camera, or third-party tracking. | Implemented baseline |
| TW / OTHER | Parent-managed baseline until local legal checklist is expanded. | Consent can be recorded, but backend learning writes do not currently require it for these regions. | Needs later regional policy |

## Engineering Gates

| Requirement | Current Implementation | Status | Remaining Work |
| --- | --- | --- | --- |
| Store child region and age | `children.age_band`, `children.market_region`, `children.english_variant` are required and constrained in PostgreSQL. | Implemented | Add finer age/date logic only if legal review requires it. |
| Parent consent before child learning data writes | `ProgressService` checks `ProgressRepository::child_privacy_gate` before learning sessions and attempts. US/DE/UK child profiles without granted `parental_privacy` consent get `parental_consent_required`. | Implemented | Add consent version/notice URL/hash and lawful-basis metadata. |
| Parent consent record | Onboarding can write `parental_privacy` consent with age/market/variant evidence; parent center lists/revokes consent. | Implemented | Require reviewed direct notice before consent checkbox. |
| Parent rights: review | Parent center lists child profiles, learning summaries, rewards, and consent records; parent-gated export downloads a machine-readable JSON package. | Implemented baseline | Add reviewed parent-facing copy and export expiry/status tracking if files are delivered asynchronously in production. |
| Parent rights: delete | Parent center privacy deletion removes child data and cascades learning sessions, attempts, progress, rewards, and child consents; parent account deletion removes the parent account, sessions, child profiles, and child-owned data. | Implemented baseline | Backup deletion propagation and retention windows missing. |
| Parent rights: revoke | Parent center revokes consent and audit-logs the action. | Implemented | Define product behavior after revocation for existing data. |
| Data export download | Parent center generates a downloadable JSON export package and records `data_export_generated` in `audit_logs`. | Implemented baseline | Add reviewed copy, async delivery/status tracking if needed, and production retention/expiry rules. |
| Parent Gate | Settings save, data export, consent revoke, child data deletion, and child profile deletion require password-backed Parent Gate. | Implemented | Add platform-native gate/passcode option for mobile. |
| High privacy default | No child-flow ads, analytics SDKs, microphone, camera, precise location, phone number, advertising ID, or device serial collection today. | Implemented baseline | Enforce through automated SDK/permission inventory before mobile release. |
| Data minimisation | Child profile uses nickname, age band, market, and language variant; no birthday, real name, location, voice, photo, or contact fields are required today. | Implemented baseline | Add privacy review for avatar, voice, AI, analytics, payments, and push. |
| Retention/deletion policy | Cascading child deletion exists. | Partial | Written retention schedule, cleanup jobs, and backup retention rules missing. |
| Security safeguards | Bearer auth, hashed passwords, hashed tokens, ownership checks, parent gate, configured CORS, Origin guard, and process-local rate limiting exist. | Implemented local baseline | Add production edge/shared-store rate limiting, password reset, and production secret management. |
| Public privacy policy and direct notice | Internal data map exists. | Missing | Draft parent notice, child-friendly privacy copy, privacy policy URL, and store disclosure text. |

## API-Level Behavior

Learning data writes now follow this sequence:

1. Parent creates child profile with `market_region`.
2. If `market_region` is `US`, `DE`, or `UK`, backend requires a granted `parental_privacy` consent for that child.
3. Without consent, `POST /api/learning/sessions` and `POST /api/learning/attempts` return `parental_consent_required`.
4. With consent, sessions, attempts, progress, and rewards write normally.
5. Parent can revoke consent later; revocation is audit-logged. Product behavior after revocation is still a policy gap.

## Release Blockers

- Convert this checklist into public privacy policy and direct parent notice.
- Add retention schedule and automated deletion jobs.
- Add consent versioning and notice evidence.
- Keep `docs/sdk-inventory.md` current before adding any third-party SDK, mobile permission, or external child-data processor.
- Complete app-store privacy labels and Google Play Data Safety from the final data map.
