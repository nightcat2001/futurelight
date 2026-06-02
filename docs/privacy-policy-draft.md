# FutureLight Privacy Policy Draft

Created: 2026-06-02 21:14:00 +08:00
Status: Draft for legal review and public hosting

This draft is designed to become the public privacy policy URL required by app stores. It reflects the current implemented product, not future features. It is not legal advice and must be reviewed before publication.

## Official References Checked

- FTC COPPA compliance plan: https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-six-step-compliance-plan-your-business
- FTC children's privacy page: https://www.ftc.gov/business-guidance/privacy-security/childrens-privacy
- ICO Children's Code resources: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/
- Apple App Privacy Details: https://developer.apple.com/app-store/app-privacy-details/
- Apple App Store Connect privacy policy requirement: https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy
- Google Play Data Safety: https://support.google.com/googleplay/android-developer/answer/10787469
- Google Play Families Policy: https://support.google.com/googleplay/android-developer/answer/9893335

## 1. Who We Are

FutureLight is a parent-managed children's language learning service. A parent creates an account, creates child profiles, grants required privacy consent for supported regions, and manages learning settings and privacy controls.

Public contact before launch:

- Privacy contact email: `privacy@futurelight.example` placeholder.
- Support email: `support@futurelight.example` placeholder.
- Public policy URL: blocked until production/staging hosting is selected.

## 2. Children And Parent Control

FutureLight is designed for children to learn through parent-managed accounts. Children do not create their own independent accounts.

Current child experience:

- No advertising.
- No third-party analytics SDK.
- No social sharing.
- No chat or user-generated public posting.
- No microphone, camera, precise location, contacts, phone number, advertising ID, or device serial collection.
- No child-facing purchase flow.

Parent controls:

- Create, edit, and delete child profiles.
- Grant and revoke parental privacy consent.
- Download a JSON export package.
- Delete a child profile and child learning data.
- Delete the parent account.
- Manage sound settings.

Sensitive parent actions are protected by a password-backed Parent Gate in the current implementation.

## 3. Data We Collect

| Data | Source | Purpose |
| --- | --- | --- |
| Parent email | Parent registration | Login, account ownership, privacy/support contact |
| Parent display name and locale | Parent registration/settings | Parent-center display and localization |
| Parent password hash | Parent registration | Authentication; raw password is not stored |
| Parent session token hash | Login/session | Authenticated API access; raw token is not stored server-side |
| Child display name/nickname | Parent child profile form | Display child profile |
| Child age band | Parent child profile form | Age-appropriate product behavior |
| Child market region | Parent child profile form | Region-specific privacy and content behavior |
| Child English variant | Parent child profile form | American/British English content selection |
| Learning sessions | Child learning flow | Resume learning and track completion |
| Attempts and scores | Practice/learning flow | Progress, mastery, rewards |
| Progress and rewards | Derived from attempts | Parent/child progress display |
| Consent records | Parent consent actions | Proof of consent and revocation state |
| Audit logs | Privacy/security actions | Accountability for export, deletion, consent, and security events |

## 4. Data We Do Not Collect Today

FutureLight does not currently collect voice recordings, camera photos/videos, location, contacts, phone number, device advertising identifiers, third-party analytics identifiers, or payment data.

## 5. How We Use Data

Current uses:

- Provide parent account login and session security.
- Create and display child profiles.
- Select age/region/English-variant appropriate learning content.
- Save learning progress, attempts, rewards, and completion state.
- Enforce parental privacy consent before US/DE/UK child learning writes.
- Provide parent export and deletion controls.
- Maintain security and privacy audit logs.

FutureLight does not use child data for behavioral advertising or third-party tracking.

## 6. Sharing

Current implementation does not share child data with third-party advertising, analytics, social, speech, payment, or crash-reporting providers.

Production hosting providers, database providers, object storage, email/support vendors, and any future SDKs must be added to the SDK/data processor inventory before public launch.

## 7. Region-Specific Notes

| Region | Current Product Behavior |
| --- | --- |
| US | Child learning sessions and attempts require granted `parental_privacy` consent before data writes. |
| Germany / EU baseline | The product uses a 16-year consent threshold baseline for DE until legal review approves otherwise. |
| UK | Child learning writes require parental privacy consent, and child-facing defaults avoid ads, tracking, location, profiling, chat, and social sharing. |
| Taiwan / Other | Parent-managed baseline; local legal review remains required before public launch. |

## 8. Parent Rights And Choices

Parents can review child profiles and learning summaries, download a JSON export package, revoke consent records, delete child data, and delete the parent account.

Production must add public help pages, support tracking, retention schedule, and backup deletion propagation before launch.

## 9. Retention

Current implementation stores parent and child data for the account lifetime unless the parent deletes child data or the parent account.

Known launch blockers:

- Retention schedule is not finalized.
- Session cleanup job is not implemented.
- Backup deletion propagation is not implemented.
- Audit log retention policy is not finalized.

## 10. Security

Current implementation includes hashed passwords, hashed bearer sessions, parent-child ownership checks, Parent Gate, parameterized PostgreSQL queries, configured CORS allow-list, Origin guard, and process-local API/auth rate limiting.

Production blockers include shared/edge rate limiting, production secret manager, password reset, production logging processor review, and backup/restore rehearsal.

## 11. Contact

Before launch, replace these placeholders with live public contacts:

- Privacy: `privacy@futurelight.example`
- Support: `support@futurelight.example`
- Deletion/help page: `https://futurelight.example/privacy-choices`
