# Reviewer Account Runbook

Created: 2026-06-02 21:14:00 +08:00
Status: Draft operational runbook, no real credentials in git

This runbook defines how to prepare App Store / Google Play reviewer accounts without committing passwords or real child data.

## Rules

- Never commit reviewer passwords, recovery codes, or production tokens.
- Reviewer accounts must use synthetic parent and child data only.
- Reviewer accounts must be created in staging or production only after hosting, privacy URL, and support URL exist.
- Keep credentials in the release password vault, not in this repository.
- Delete or rotate reviewer accounts after the review window if the store process allows it.

## Required Reviewer Accounts

| Store | Parent Email Placeholder | Profiles |
| --- | --- | --- |
| Apple | `reviewer+apple@futurelight.example` | US/American `6-8`, UK/British `6-8` |
| Google Play | `reviewer+google@futurelight.example` | US/American with consent, UK/British without consent to demonstrate consent block |
| Internal QA | `qa+parent@futurelight.example` | DE/German-region baseline, TW/Other baseline |

## Setup Steps

1. Deploy staging frontend/API/database.
2. Confirm public privacy policy URL and privacy choices URL are live.
3. Create reviewer parent account through the real UI or auth API.
4. Create child profiles through the real Parent Center.
5. Grant `parental_privacy` consent for profiles that should demonstrate learning writes.
6. Leave one UK or US child profile without consent to demonstrate the blocked learning state.
7. Start one lesson, submit one correct attempt, and confirm progress/reward state is visible.
8. Confirm Parent Gate password works for data export, consent revoke, child deletion, parent account deletion, and settings.
9. Store account credentials outside git.
10. Record account creation date, release version, and environment in the release checklist.

## Reviewer Notes Template

FutureLight is a parent-managed child language learning app. Please sign in with the provided parent account. The Parent Center contains child profile management, privacy consent, data export, data deletion, sound settings, and progress summaries. Adult/destructive actions require Parent Gate password confirmation.

The child area has no ads, purchases, chat, public sharing, microphone, camera, location, third-party analytics SDK, or advertising identifiers. US/DE/UK child profiles require granted parental privacy consent before child learning session/attempt data is saved.

## Release Blockers

- Production/staging URL not assigned.
- Public privacy policy URL not hosted.
- Privacy choices/deletion URL not hosted.
- Credentials vault not configured.
- Legal review not complete.
- Native app package/permissions not finalized.
