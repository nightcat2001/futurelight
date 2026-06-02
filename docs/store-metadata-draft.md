# FutureLight Store Metadata Draft

Created: 2026-06-01 14:46:41 +08:00
Status: Draft store-console answers, not legal advice

This document converts the current FutureLight implementation into App Store Connect and Google Play Console metadata drafts. It must be rechecked before submission because store policies and the implemented data flows can change.

## Official References Checked

- Apple App Privacy Details: https://developer.apple.com/app-store/app-privacy-details/
- Apple App Store Connect age rating: https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating
- Apple age rating values and definitions: https://developer.apple.com/help/app-store-connect/reference/app-information/age-ratings-values-and-definitions
- Apple categories and Kids category: https://developer.apple.com/app-store/categories/
- Apple App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Google Play target audience and content: https://support.google.com/googleplay/android-developer/answer/9867159
- Google Play Families Policy: https://support.google.com/googleplay/android-developer/answer/9893335
- Google Play Families data practices: https://support.google.com/googleplay/android-developer/answer/11043825
- Google Play Data safety: https://support.google.com/googleplay/android-developer/answer/10787469

## Current Product Assumptions

| Area | Draft Decision |
| --- | --- |
| Product type | Parent-managed child language learning app. |
| Child age bands in product | `3-5`, `6-8`, `9-11`. |
| Markets in product | `DE`, `UK`, `US`, `TW`, `OTHER`. |
| Language variants | American and British English content selection. |
| Ads | None. |
| Third-party analytics SDK | None. |
| Crash-reporting SDK | None. |
| Push notifications | None. |
| Microphone / camera / precise location | Not implemented. |
| Payments / subscriptions | Not implemented. |
| User-generated child sharing / chat | None. |
| Parent account | First-party email/password, hashed password, hashed bearer sessions. |
| Child profile data | Nickname/display name, age band, market region, English variant. |
| Learning data | Sessions, attempts, scores, progress, rewards. |
| Deletion | Child data deletion, parent account deletion, and downloadable JSON export package are implemented in the local parent center. |
| Privacy policy URL | Blocked until public policy and hosting URL exist. |

## App Store Connect Draft

### Product Page

| Field | Draft |
| --- | --- |
| App name | FutureLight |
| Subtitle | Parent-guided English practice |
| Primary category | Education |
| Secondary category | Games, only if the final app is reviewed as game-like; otherwise leave unset. |
| Kids category | Candidate, but do not submit as Kids category until public privacy policy, direct parent notice, production parent gate, and reviewer account are ready. |
| Made for Kids age band | Product supports 3-11 internally. Store selection needs final product/legal decision because App Store Connect asks for a specific Kids age range. Initial recommendation: launch with the most complete reviewed band, likely 6-8, or avoid Kids category language until the decision is finalized. |
| Metadata wording guardrail | Do not use "For Kids" or "For Children" in metadata unless the app is approved for the Kids category. |

### Age Rating Questionnaire Draft

Expected outcome if current content remains as implemented: Apple global `4+`.

| Questionnaire Area | Draft Answer |
| --- | --- |
| In-app controls | Parental controls: Yes. Age assurance: No, unless a native age screen is added. |
| User-generated content | No. |
| Messaging or chat | No. |
| Advertising | No. |
| Unrestricted web access | No. |
| Contests / gambling / loot boxes | No. |
| Violence, weapons, horror, mature themes | None. |
| Sexuality, nudity, alcohol, tobacco, drugs | None. |
| Medical or treatment information | None. |
| Region-specific ratings | Recheck once native build and final content are frozen. |

### App Privacy Label Draft

All current data is first-party, linked to the parent/child account, not used for tracking, and not shared with third-party advertising or analytics providers.

| Apple Data Type | Collected? | Linked? | Tracking? | Purpose | Current Evidence |
| --- | --- | --- | --- | --- | --- |
| Contact Info - Email Address | Yes | Yes | No | App Functionality, account management, parent notices. | `parent_accounts.email` |
| Contact Info - Name | Yes, if parent or child enters a real name as display name | Yes | No | App Functionality. | `parent_accounts.display_name`, `children.display_name` |
| Identifiers - User ID | Yes | Yes | No | App Functionality, security, account/session ownership. | UUIDs for parent, child, sessions, learning records |
| User Content - Gameplay Content | Yes | Yes | No | App Functionality, product personalization. | Learning sessions, attempts, progress, rewards |
| Usage Data - Product Interaction | Yes | Yes | No | App Functionality, product personalization. | Attempts, scores, completion/progress rows |
| Other Data | Yes | Yes | No | App Functionality, compliance. | Child age band, market region, English variant, consent/audit state |
| Audio Data | No | N/A | N/A | N/A | Voice recording not implemented |
| Photos or Videos | No | N/A | N/A | N/A | Camera/upload not implemented |
| Location | No | N/A | N/A | N/A | Precise/coarse location not collected |
| Device ID | No | N/A | N/A | N/A | No IDFA/advertising/device identifier collection |
| Diagnostics | No for current app runtime | N/A | N/A | N/A | No crash/diagnostic SDK; production server logging vendor still TBD |

Blocked before final App Privacy submission:

- Public privacy policy URL.
- Privacy choices/delete URL or equivalent parent help page.
- Production hosting/database/logging vendor inventory.
- Native build review for any SDKs, permissions, privacy manifests, or diagnostics.

### App Review Notes Draft

FutureLight is a parent-managed children's English learning app. A parent creates an account, creates a child profile with age band, market region, and English variant, then grants parental privacy consent before supported child learning data is recorded for US/DE/UK profiles. The child experience contains no ads, no third-party analytics SDK, no chat, no user-generated sharing, no microphone/camera/location access, and no external social login. Adult and destructive actions are protected by a password-backed Parent Gate.

Reviewer access still needs a production or staging account before submission:

- Parent email: `reviewer+apple@futurelight.example` (placeholder, not created)
- Password: create in the release password vault, not in git
- Child profiles: one US/American 6-8 profile and one UK/British 6-8 profile
- Consent state: one profile with granted `parental_privacy` consent

## Google Play Console Draft

### Target Audience And Content

| Field | Draft |
| --- | --- |
| Target age groups | Ages 5 and under, Ages 6-8, Ages 9-12. Final decision must match the native app's reviewed UX and content depth. |
| Designed primarily for children | Yes, if listing uses child-directed imagery/copy and the app remains parent-managed child learning. |
| Families Policy | Must comply. No ads are planned. |
| Ads declaration | No ads. |
| In-app purchases | No, until parent-only purchase flow exists and is separately reviewed. |
| Neutral age screen | Not needed for launch if the app is solely child/parent-managed and has no adult-only monetization/ads. Add only if a mixed-age adult feature is introduced. |
| Personal information | Yes. Parent email/account data, child nickname/profile data, consent records, learning/progress data. |
| App access instructions | Provide reviewer parent account and describe Parent Gate password flow. |
| Expert Approved | Candidate after full production content, privacy policy, screenshots, and stability pass. |

### IARC / Content Rating Draft

Expected low rating if current content remains as implemented:

- No violence.
- No sexual content.
- No gambling or simulated gambling.
- No user-generated sharing/chat.
- No ads.
- No location sharing.
- No unrestricted web access.
- Educational language-learning content only.

### Data Safety Draft

| Google Data Type | Collected? | Shared? | Required? | Purpose | Current Evidence |
| --- | --- | --- | --- | --- | --- |
| Personal info - Email address | Yes | No | Required for parent account | Account management, app functionality, security/compliance | `parent_accounts.email` |
| Personal info - Name | Yes, display names/nicknames | No | Required as display label | App functionality | `display_name` fields |
| Personal info - Other info | Yes | No | Required for child profile | App functionality, personalization, legal/compliance | age band, market region, English variant |
| User IDs | Yes | No | Required | Account management, app functionality, security/compliance | UUID IDs and session ownership |
| App activity - App interactions / Other actions | Yes | No | Required for learning progress | App functionality, personalization | sessions, attempts, progress, rewards |
| Device or other IDs | No | No | N/A | N/A | No AAID/AD_ID or device identifier collection |
| Location | No | No | N/A | N/A | No location permission |
| Audio files / voice recordings | No | No | N/A | N/A | Microphone and speech flow not implemented |
| Photos and videos | No | No | N/A | N/A | Camera/upload not implemented |
| Diagnostics / crash logs | No for current runtime | No | N/A | N/A | No crash SDK; re-evaluate after native build/hosting choices |

Security practices draft:

- Data encrypted in transit: Yes for production only after HTTPS is enforced.
- Data deletion request mechanism: Implemented local baseline for child data deletion and parent account deletion; final Play disclosure should still wait for a public deletion URL/process and production support path.
- Committed to follow Play Families policy: Candidate after final checklist and privacy policy are complete.
- Independent security review: No.

### Play Review Notes Draft

FutureLight targets children with parent-managed account setup. The app has no ads, no in-app purchases, no third-party analytics SDK, no social login, no chat, no location, no camera, and no microphone in the launch scope. Parent account data and child learning progress are stored only on first-party infrastructure. US/DE/UK child learning writes require granted parental privacy consent. Parent Gate protects sensitive parent-center actions.

Reviewer access still needs a production or staging account before submission:

- Parent email: `reviewer+google@futurelight.example` (placeholder, not created)
- Password: create in the release password vault, not in git
- Child profiles: US/American and UK/British test profiles
- Consent state: include one profile with consent granted and one without consent to demonstrate the block

## Release Blockers For Store Metadata

- Public privacy policy URL and privacy choices/deletion page.
- Production hosting/database/logging vendor inventory and processor review.
- Native app build inventory: package ID, permissions, SDK list, privacy manifests, Android manifest, network security config.
- App icon, screenshots, preview video, and screenshot text reviewed against Apple metadata rules and Google Families suitability.
- Final legal review for COPPA, GDPR Article 8, UK Children's Code, Taiwan local obligations, and Apple/Google store declarations.
- Real reviewer accounts created in staging/production and stored outside git.
