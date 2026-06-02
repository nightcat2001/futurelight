# Privacy Choices And Data Deletion Page Draft

Created: 2026-06-02 21:14:00 +08:00
Status: Draft public help page for legal/support review

This page is intended to become the public privacy choices / data deletion URL referenced from App Store Connect, Google Play, and the privacy policy.

## Parent Privacy Choices

Current Parent Center controls:

- Download a JSON export package.
- Revoke parental privacy consent.
- Delete a child profile and child learning data.
- Delete the parent account.
- Manage sound preferences.

## Data Export

The current product can generate a parent-gated JSON export package containing parent account profile fields, child profiles, consent records, learning sessions, attempts, progress records, rewards, and audit logs. Password and session hashes are excluded.

## Export Request Status

The current product records each export in PostgreSQL `data_export_requests` with request id, status, scope, requested time, completed time, expiry time, audit log link, and non-PII package counts. The Parent Trust Center shows recent export requests after the parent passes Parent Gate and downloads the JSON package.

Production still needs off-box delivery, support visibility, and reviewed expiry rules before public launch.

Production blocker:

- Export delivery/status tracking and expiry are not implemented.

## Child Data Deletion

Parent Center can delete a child profile and child-scoped data through a parent-gated privacy action.

Current child deletion removes:

- Child profile.
- Learning sessions.
- Attempts.
- Progress records.
- Rewards.
- Child-scoped consents.

Production blockers:

- Backup deletion propagation is not implemented.
- Retention schedule is not finalized.
- Support confirmation workflow is not implemented.

## Parent Account Deletion

Parent Center can delete the parent account through a parent-gated privacy action. This cascades parent sessions, child profiles, and child-owned learning data.

Production blockers:

- Confirmation email is not implemented.
- Support review path is not implemented.
- Production backup retention handling is not implemented.

## How To Request Help

Before public launch, replace placeholders:

- Privacy email: `privacy@futurelight.example`
- Support email: `support@futurelight.example`
- Expected first response: 2 business days for privacy requests.

When contacting support, parents should not send sensitive child details in plain text. Support should verify parent identity through the account before taking action.

## Store URL Requirements

- Apple privacy policy URL: public, accessible without login.
- Apple user privacy choices URL: recommended for parent deletion/export help.
- Google Play privacy policy URL: public, accessible without login.
- Google Play Data Safety must match this page and the app's actual data flows.
