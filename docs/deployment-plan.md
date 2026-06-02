# FutureLight Staging / Production Deployment Plan

Created: 2026-06-01 15:58:18 +08:00
Status: Plan ready, implementation not started

## Target Topology

- Frontend: static React/Vite build hosted on a CDN or static web host with HTTPS, immutable asset caching, and history fallback to `index.html`.
- API: Rust Axum service running as a private HTTPS service behind a managed load balancer or edge proxy.
- Database: managed PostgreSQL with automated backups, point-in-time recovery, and separate staging/production instances.
- Object storage: private bucket for reviewed image/audio/video source assets, with public CDN paths only for approved static assets.
- Observability: API structured logs, request metrics, uptime checks for `/health` and `/api/health/db`, error-rate alerts, and backup-restore alerts.

## Environments

| Environment | Purpose | Data Rules | Release Source |
| --- | --- | --- | --- |
| Local | Developer verification on assigned ports `37173`, `37200`, `37432`. | Disposable local test data. | Working tree. |
| Staging | Store-review rehearsal, legal/privacy review, screenshot capture, and QA. | Synthetic accounts only; no real child data. | Protected branch or tagged build. |
| Production | Public release. | Real parent/child data; strict retention/export/deletion policy required first. | Signed release tag. |

## Required Runtime Configuration

- `DATABASE_URL`: environment-specific managed PostgreSQL connection string.
- `PORT`: service port assigned by the runtime platform; local remains `37200`.
- `RUN_MIGRATIONS`: `true` for controlled startup migration in staging only; production should use an explicit migration job.
- `ALLOWED_ORIGINS`: exact frontend origins for staging/production.
- `RATE_LIMIT_WINDOW_SECONDS`, `RATE_LIMIT_MAX_REQUESTS`, `AUTH_RATE_LIMIT_MAX_REQUESTS`: production-tuned limits or edge-rate-limit mirror values.
- Future secret variables: email provider, support mailbox, object storage credentials, backup credentials, and any reviewed analytics/crash SDK keys.

## Deployment Flow

1. Build frontend with `npm.cmd run build` and upload `frontend/dist` to the static host.
2. Build backend with `cargo build --release`.
3. Run database migrations as a separate release step before routing traffic to the new API version.
4. Run `tools/verify-delivery.ps1` against staging with staging `DATABASE_URL`.
5. Capture store screenshots from staging only after visual smoke passes.
6. Promote the same backend image/artifact and frontend build hash to production.
7. Keep the previous production backend image and frontend build available for rollback.

## Backup And Restore

- Enable daily automated PostgreSQL backups and point-in-time recovery.
- Run a monthly restore rehearsal into a private non-production database.
- Keep asset source files in versioned object storage or a reviewed artifact archive.
- Document recovery time objective and recovery point objective before launch.

## Privacy Retention Job

- Local command exists: `cargo run -- retention-cleanup`.
- Production should schedule the same backend command at least daily after deployment.
- Current defaults:
  - `SESSION_RETENTION_DAYS=7`
  - `REVOKED_CONSENT_EVIDENCE_RETENTION_DAYS=365`
  - `DETACHED_AUDIT_LOG_RETENTION_DAYS=2555`
- The job deletes expired parent sessions, minimizes old revoked consent evidence, and deletes old detached audit logs after parent/child deletion has removed direct ownership links.
- Production still needs provider-specific backup deletion propagation and a restore rehearsal before launch.

## Monitoring And Alerts

- Uptime checks:
  - `GET /health`
  - `GET /api/health/db`
- API alerts:
  - elevated `5xx`
  - elevated `401/403/429` after release
  - database connection failures
  - migration job failure
- Product/privacy alerts:
  - data export request queue age
  - deletion request failure
  - consent revoke failure

## Rollback

- Frontend rollback: switch CDN/static host to the previous build artifact.
- Backend rollback: route traffic to the previous backend image after confirming migration compatibility.
- Database rollback: prefer forward-fix migrations; destructive schema changes require a written rollback rehearsal before production.
- Content rollback: archive the problematic course/content version through the content-admin workflow.

## Launch Blockers

- Core CI exists in `.github/workflows/verify.yml` for frontend build/lint, Rust migration/fmt/clippy/test/content check, content/asset check, and secret scan. Production deployment/CD is not implemented yet.
- Production hosting provider, domains, certificates, and object storage are not selected.
- Production shared/edge rate limiting is not implemented; current backend limit is process-local.
- Local DB retention cleanup exists, but production scheduling, backup deletion propagation, production export delivery/status tracking, password reset, and reviewed legal copy remain incomplete.
- Native app permissions, SDK inventory finalization, privacy/support URLs, and final store assets remain incomplete.
