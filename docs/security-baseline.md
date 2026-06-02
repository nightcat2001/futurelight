# FutureLight Security Baseline

Created: 2026-06-01 15:51:37 +08:00
Status: Implemented local baseline, not final production review

## Backend Controls

- CORS is no longer permissive. The backend accepts origins from `ALLOWED_ORIGINS`, defaulting to `http://127.0.0.1:37173` and `http://localhost:37173`.
- State-changing browser requests (`POST`, `PATCH`, `PUT`, `DELETE`) with an `Origin` header must match the configured allow-list or they fail with `403 origin_not_allowed`.
- API requests are rate-limited in memory by origin/IP/authorization identity. Defaults:
  - `RATE_LIMIT_WINDOW_SECONDS=60`
  - `RATE_LIMIT_MAX_REQUESTS=240`
  - `AUTH_RATE_LIMIT_MAX_REQUESTS=30`
- Passwords are hashed with Argon2 before storage.
- Bearer session tokens are generated with OS randomness, stored only as SHA-256 hashes in PostgreSQL, expire after 30 days, and are revoked on logout.
- SQL injection risk is controlled by `tokio-postgres` parameterized queries. Content/admin ID inputs are validated before use.
- JSON request fields are validated in service layers before writes, including auth, child profile, content-admin, progress, privacy, market-region, and English-variant values.
- The backend exposes a real privacy retention cleanup command, `cargo run -- retention-cleanup`, for scheduler use. It deletes expired parent sessions, minimizes old revoked consent evidence, and removes old detached audit logs.
- Data export requests are recorded in PostgreSQL with status, scope, completion time, expiry time, audit log link, and non-PII package counts before the parent downloads the JSON package.

## Current Limits

- Rate limiting is process-local and resets on backend restart. Production needs shared enforcement at the API edge or a shared store.
- Origin checks protect browser CSRF-style requests but do not replace bearer auth.
- Password reset, email verification, production audit policy, production retention scheduling, off-box export delivery, and backup deletion propagation are still open product work.
- Production deployment must set `ALLOWED_ORIGINS` to the exact app/store domains before public exposure.

## Verification

- `cargo test --test security_baseline -- --nocapture`
- `cargo test --test retention_cleanup -- --nocapture`
- `cargo test`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\tools\verify-delivery.ps1`
