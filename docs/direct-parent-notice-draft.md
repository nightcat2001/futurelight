# FutureLight Direct Parent Notice Draft

Created: 2026-06-02 21:14:00 +08:00
Status: Draft for legal review and parent-facing copy

This notice is the parent-facing summary shown before collecting child learning data in regions where parental privacy consent is required.

## Short Notice For Onboarding

FutureLight is a parent-managed language learning app. Before your child starts learning, we need your permission to save child learning data such as their child profile, lesson sessions, answers, scores, progress, rewards, and consent records.

We do not currently collect voice recordings, camera images, location, phone number, contacts, advertising identifiers, third-party analytics identifiers, or payment data. The child area has no ads, no chat, no public sharing, and no purchases.

You can review your child's progress, revoke consent, download a data export, delete your child's data, or delete your parent account from Parent Center. Sensitive parent actions require Parent Gate password confirmation.

## Full Direct Notice

### What We Collect

- Parent account email, display name, locale, password hash, and session token hash.
- Child display name/nickname, age band, market region, and English variant.
- Learning sessions, answers, correctness, scores, progress, and rewards.
- Consent records and audit logs for privacy/security actions.

### Why We Collect It

- To let the parent manage child profiles and settings.
- To show age-appropriate language learning content.
- To save progress and rewards.
- To provide parent export, deletion, consent, and audit controls.

### Sharing

Current implementation does not share child data with advertising, analytics, speech, payment, social, or crash-reporting providers.

### Parent Choices

Parents can grant or decline privacy consent, revoke consent later, view child progress, download a JSON export package, delete child data, and delete the parent account.

### If Consent Is Not Granted

For US, DE, and UK child profiles, FutureLight blocks child learning session and attempt writes until `parental_privacy` consent is granted.

### Contact

Replace before public release:

- Privacy email: `privacy@futurelight.example`
- Support email: `support@futurelight.example`
- Privacy choices URL: `https://futurelight.example/privacy-choices`

## Product Copy Requirements

- Use plain parent-readable language.
- Do not ask a child to consent.
- Do not hide consent behind a general terms checkbox.
- Link to the public privacy policy and privacy choices page once hosted.
- Update the consent record evidence with notice version, timestamp, child ID, market region, age band, and English variant.
