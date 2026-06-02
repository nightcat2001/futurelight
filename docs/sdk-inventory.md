# FutureLight SDK Inventory

Created: 2026-06-01 12:52:18 +08:00
Status: Store/legal engineering inventory, not legal advice

This inventory is the required gate before adding any third-party runtime SDK, mobile SDK, analytics, crash reporting, advertising, payment, speech, AI, push notification, social, or location provider to FutureLight.

Official references checked on 2026-06-01:

- Apple App Review Guidelines, Kids Category and Privacy: https://developer.apple.com/app-store/review/guidelines/
- Google Play Families Policy: https://support.google.com/googleplay/android-developer/answer/9893335
- Google Play SDK Requirements: https://support.google.com/googleplay/android-developer/answer/13323374
- Google Play Families data practices: https://support.google.com/googleplay/android-developer/answer/11043825
- FTC COPPA SDK guidance: https://www.ftc.gov/business-guidance/blog/2025/09/using-third-partys-software-your-app-make-sure-youre-all-complying-coppa
- FTC COPPA 2025 update: https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-finalizes-changes-childrens-privacy-rule-limiting-companies-ability-monetize-kids-data

## Current Decision

FutureLight currently has no third-party runtime SDK in the child learning flow.

- No advertising SDK.
- No third-party analytics SDK.
- No crash-reporting SDK.
- No payment SDK.
- No speech, AI, microphone, camera, precise-location, push, social, or OAuth SDK.
- No Android Advertising ID, IDFA, SIM serial, build serial, BSSID, MAC, SSID, IMEI, IMSI, phone number, or precise location collection.

The current production runtime is first-party React UI, first-party Rust API, and first-party PostgreSQL storage. Package managers and build tools are not allowed to become child-data processors unless their runtime code is intentionally shipped into the child experience and re-reviewed here.

## Policy Rules Applied

| Rule | Product Gate |
| --- | --- |
| Apple Kids Category apps should avoid third-party analytics and third-party advertising; limited exceptions require strict child-safe practices and no identifiable child/device data. | Do not add analytics or ads to the child flow. If an exception is proposed, it must be documented here first and reviewed before implementation. |
| Google Play requires child-targeted apps to disclose child data collection through APIs/SDKs and avoid SDKs not approved for child-directed services. | Every mobile/API SDK must have a child-directed-services decision before release. Unknown or not-approved means blocked from the child flow. |
| Google Play Families data practices restrict AAID and device identifiers for children or users of unknown age. | Mobile builds must not request AAID/AD_ID or transmit advertising/device identifiers from children or unknown-age users. |
| FTC COPPA guidance treats third-party SDK collection as the operator's responsibility. | FutureLight must review SDK privacy policies, contracts, data collection, retention, and third-party disclosures before allowing child data through any SDK. |
| FTC 2025 COPPA update emphasizes separate opt-in for targeted advertising or other third-party disclosure. | Targeted advertising and third-party child-data sharing are blocked for launch. Any later proposal requires separate verifiable parental opt-in and legal review. |

## Current Runtime Inventory

| SDK / Package | Layer | Child Area Loaded? | Data Collected / Transmitted | Third-Party Sharing | Apple Kids Decision | Google Families Decision | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| React | Frontend runtime | Yes | None by itself; renders first-party UI state in browser memory. | None by package. | Allowed as UI library. | Allowed as UI library. | Approved for current use | Direct dependency in `frontend/package.json`. |
| React DOM | Frontend runtime | Yes | None by itself; updates browser DOM. | None by package. | Allowed as UI library. | Allowed as UI library. | Approved for current use | Direct dependency in `frontend/package.json`. |
| Browser Fetch API | Web platform | Yes | Sends parent/child requests only to first-party API base URL. | No third-party destination today. | Allowed if first-party data practices match privacy policy. | Allowed if disclosed and child data rules are met. | Approved for current use | Production must use HTTPS and first-party API origin. |
| Browser localStorage | Web platform | Parent session shell | Stores `futurelight.parentToken`; not a child SDK. | None by itself. | Allowed, but secure-cookie strategy preferred for production. | Allowed if disclosed and secured. | Temporary approval | Replace with hardened session storage before launch. |
| Axum | Backend runtime | Indirect, server-side | Receives first-party API requests. | None by crate. | N/A server-side | N/A server-side | Approved for current use | Direct Rust dependency. |
| Tokio | Backend runtime | Indirect, server-side | None by itself. | None by crate. | N/A server-side | N/A server-side | Approved for current use | Async runtime only. |
| tower-http | Backend runtime | Indirect, server-side | CORS and request tracing; no external exporter configured. | None today. | N/A server-side | N/A server-side | Approved for current use | If logs are exported later, add logging vendor to this inventory. |
| tokio-postgres | Backend runtime | Indirect, server-side | Sends app data to first-party PostgreSQL. | None beyond first-party database. | N/A server-side | N/A server-side | Approved for current use | Database processor/hosting must be reviewed before production. |
| PostgreSQL 17 Docker image | Database/runtime infra | Indirect, server-side | Stores parent, child, consent, learning, progress, reward, and audit data. | None in local Docker. | N/A server-side | N/A server-side | Approved for local/dev | Production managed DB vendor must be added before launch. |
| serde / serde_json | Backend runtime | Indirect, server-side | Serializes first-party API data. | None by crate. | N/A server-side | N/A server-side | Approved for current use | Direct Rust dependencies. |
| argon2 / sha2 / rand_core | Backend runtime/security | Indirect, server-side | Hashes passwords/tokens and uses OS randomness. | None by crate. | N/A server-side | N/A server-side | Approved for current use | Security primitives only. |
| dotenvy | Backend runtime/config | No child UI | Reads local environment variables. | None by crate. | N/A server-side | N/A server-side | Approved for current use | Do not expose secrets to frontend. |
| tracing / tracing-subscriber | Backend runtime/logging | Indirect, server-side | Writes local operational logs. | None today. | N/A server-side | N/A server-side | Approved for local use | External log sink requires separate inventory entry. |

## Build And Developer Inventory

These packages are not approved as child-data processors. They are only approved for local build, lint, and test workflows.

| SDK / Package | Layer | Child Area Loaded? | Data Collected / Transmitted | Third-Party Sharing | Apple Kids Decision | Google Families Decision | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Vite | Frontend build/dev server | Dev only | None in production runtime; dev server serves local app. | None by current config. | N/A build tool | N/A build tool | Approved for dev/build | `strictPort: true` is required by workspace port policy. |
| @vitejs/plugin-react | Frontend build | Build only | None in production runtime. | None by current config. | N/A build tool | N/A build tool | Approved for dev/build | React transform only. |
| TypeScript / @types packages | Frontend build | Build only | None in production runtime. | None by package. | N/A build tool | N/A build tool | Approved for dev/build | Type checking only. |
| ESLint / plugins / globals / typescript-eslint | Frontend lint | Build only | None in production runtime. | None by package. | N/A build tool | N/A build tool | Approved for dev/build | Lint only. |
| Cargo / Cargo.lock transitive crates | Backend build | Build/runtime as compiled | Direct runtime crates are listed above; transitive crates inherit their purpose. | None unless a future crate adds network/export behavior. | Review if runtime behavior changes. | Review if runtime behavior changes. | Approved with direct-dependency review | New direct runtime dependency must update this file. |
| Playwright CLI / browser smoke tooling | QA/dev | Test only | Test accounts and local API data during smoke tests. | None when pointed at localhost. | N/A test tool | N/A test tool | Approved for local QA only | Must not ship in child runtime. |
| RunComfy / image-video generation tooling | Asset production | Not loaded in app runtime | Prompt/assets may be sent to generation provider if used. | Yes, production provider. | Requires asset provenance and child-safety review. | Requires asset provenance and child-safety review. | Blocked from child runtime; allowed only as reviewed asset pipeline | Generated assets need manifest provenance and human review before child exposure. |

## Blocked Or Future SDK Classes

| SDK Class | Intended Use | Child Area Loaded? | Data Risk | Apple Kids Decision | Google Families Decision | Current Decision | Required Before Use |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Third-party analytics | Product analytics | No | Event streams can become child behavioral data or persistent identifiers. | Not allowed in child flow for launch. | Blocked unless approved for child-directed services and configured for no prohibited identifiers. | Do not implement. | Legal review, vendor policy review, Data Safety/App Privacy update, no child identifiers, parent notice. |
| Crash reporting | Reliability | No | Crash/device/session data may include identifiers or child context. | Not in child flow until reviewed. | Must be approved/configured for child-directed use or isolated from children. | Do not implement yet. | Redaction rules, no child identifiers, processor contract, disclosure updates. |
| Advertising / mediation | Monetization | No | Ads can collect identifiers and create profiling/targeting risk. | Blocked for launch; Apple Kids only allows very limited contextual exceptions. | Only Families self-certified ads SDKs for child ads. | No ads in child product. | Separate parental opt-in if ever sharing child data, Families ads SDK review, human ad creative review. |
| Payment / subscription SDK | Parent purchase | Parent-gated only | Adult payment and entitlement data. | Parent area only behind parental gate. | Parent area only; no child access requirement. | Future parent-only. | Parent Gate, store purchase policy, privacy labels, no child upsell. |
| Speech recognition / AI pronunciation | Pronunciation feedback | Not yet | Child voice/audio is sensitive child data and may be biometric depending on processing. | Requires explicit consent, minimization, retention, processor review. | Requires disclosure, consent, and child-directed approval. | Blocked. | Parental consent type, short retention, provider DPA, no training use without explicit approval, export/delete path. |
| Image/video generation API | Asset generation | Not runtime | Prompts/assets may include child-directed content; provider processing. | Use only for asset production with review. | Use only for asset production with review. | Not in runtime. | Asset provenance, human review, no child personal data in prompts. |
| Push notification SDK | Re-engagement | No | Contact identifiers and behavioral nudges. | Parent-only until reviewed. | Child-directed push requires careful consent/disclosure. | Blocked for child flow. | Parent-only preference center, direct notice, opt-out, no manipulative nudges. |
| OAuth/social login SDK | Authentication/social | No | Third-party identity, profile, social graph risk. | Not in child flow. | Blocked if provider ToS is not approved for child-directed services. | Use first-party parent email/password only. | Neutral age/parent area isolation and provider child-use approval. |
| Maps/location SDK | Location features | No | Precise location is high-risk child data. | Blocked for child product. | Solely child-targeted apps may not request location permission. | Do not implement. | Strong necessity, parental consent, store disclosure, child-safety review. |
| Camera/photo SDK | Avatar/media | No | Child image/face data and UGC moderation risk. | Blocked until reviewed. | Requires disclosure, consent, and moderation controls. | Do not implement. | Parent consent, local processing preference, moderation, export/delete. |
| Microphone SDK | Pronunciation/audio | No | Child voice/audio. | Blocked until speech consent design is complete. | Requires disclosure, consent, and child-directed approval. | Do not implement. | Same gate as speech recognition. |

## Mobile Store Permission Guardrail

Future mobile builds must fail release review if any child or unknown-age path requests or transmits:

- Apple IDFA or Android AAID / AD_ID.
- SIM serial, build serial, BSSID, MAC, SSID, IMEI, IMSI, phone number.
- Precise location.
- Camera or microphone before an explicit, reviewed parent consent path exists.
- Contacts, social graph, installed apps, or broad device identifiers.

## Required Review Record For Any New SDK

Before a new SDK or API provider is merged, add a row above and record:

1. Package name, version, vendor, and privacy policy URL.
2. Whether code loads before parent authentication, in parent-only area, or in child flow.
3. Data collected by default, including identifiers, diagnostics, event payloads, audio/images, location, or device metadata.
4. Network destinations and whether data leaves FutureLight-controlled infrastructure.
5. Whether vendor terms allow child-directed use.
6. Apple Kids Category decision.
7. Google Families decision, including Families self-certified ads status if ads are involved.
8. COPPA/GDPR/UK consent requirement and parent notice impact.
9. Data Safety / App Privacy label changes.
10. Test evidence proving child or unknown-age users do not trigger blocked collection.

## Current Release Blockers

- Production database/hosting provider inventory is not filled because production infrastructure is not selected.
- App-store Data Safety / App Privacy label draft exists at `docs/store-metadata-draft.md`, but final console answers remain blocked until production SDK/permission/hosting inventory is frozen.
- No automated SDK/permission scanner is wired into CI.
- Voice, analytics, crash, payment, push, and asset-generation providers remain blocked from child runtime until reviewed here.
