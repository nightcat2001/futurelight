# FutureLight Operations And Support Plan

Created: 2026-06-01 16:01:50 +08:00
Status: Process plan plus local parent support request tooling

## Support Channels

- Parent support email: required before store submission.
- In-app help entry: planned for parent center after legal copy is reviewed.
- Store review contact: required for App Store Connect and Play Console reviewer notes.

## Request Types

| Request | Owner | First Response Target | Current Product Path | Required Production Work |
| --- | --- | --- | --- | --- |
| Child data deletion | Privacy/support | 2 business days | Parent Center can delete a child profile/privacy data and the parent account through parent-gated APIs. | Add confirmation email, audit review process, backup propagation, and retention policy. |
| Data export | Privacy/support | 2 business days | Parent Center generates a parent-gated downloadable JSON export package, records export request status, and can submit support requests. | Add off-box production delivery, support review workflow, and public help copy. |
| Consent revoke | Privacy/support | 2 business days | Parent Center can revoke consent records. | Add reviewed parent copy and region-specific follow-up handling. |
| Refund | Billing/support | 2 business days | Not implemented. | Define store-billing paths for Apple/Google and any web subscription provider before paid launch. |
| Content error report | Content ops | 3 business days | Parent Center can submit a `content_error` support request tied to account or child. | Add content-admin triage status, rollback/publish workflow, and parent response templates. |
| Store review rejection | Release owner | Same business day | Not implemented. | Keep rejection log, map rejected guideline/policy to owner, update store metadata/assets/build, and rerun staging verification. |
| Parent learning/support question | Support/content | 3 business days | Parent Center can submit and list support requests stored in PostgreSQL. | Add FAQ, support macros, escalation path, and localization review. |

## Triage Workflow

1. Classify request type and region.
2. Confirm parent identity without asking for child-sensitive data in plain text.
3. Record the request in the support tracker with timestamp, owner, status, and due date.
4. For privacy requests, verify the parent account and affected child profile before action.
5. For content issues, create a content-admin review item and keep the affected course in draft/review/archived state until resolved.
6. Send a parent-safe response that avoids exposing another child, internal IDs, logs, or raw database data.
7. Close only after the action is verified and the audit note is attached.

## Escalation

- Privacy/legal: deletion/export disputes, regulator inquiries, parental consent questions, or child-safety concerns.
- Engineering: API failures, export generation failure, account access problems, suspected security incidents, or data integrity issues.
- Content: incorrect English variant, age-inappropriate wording, image/audio concern, or localization mistake.
- Release: App Store / Google Play rejection, screenshot mismatch, metadata change, SDK/permission discrepancy.

## Support Macros To Draft

- Data export completed.
- Child data deletion completed.
- Consent revoked.
- Content report received.
- Store review rejection remediation in progress.
- Parent account access help.
- Refund path through Apple / Google.

## Metrics

- Open privacy requests by age.
- Data deletion/export completion time.
- Content error reports by course.
- Store rejection count and reason.
- Parent support first response time.
- Security/support escalations by severity.

## Launch Blockers

- No production support mailbox or external tracker is configured.
- Local support request intake exists, but staff/admin triage, assignment, SLA reporting, and support email confirmation are not implemented.
- DB-backed export request status exists, but off-box production delivery and support visibility are incomplete.
- Backup deletion propagation and production retention scheduling are not implemented.
- Refund policy and billing provider paths are not implemented.
- Public FAQ, support macros, and reviewed legal/privacy templates are not complete.
