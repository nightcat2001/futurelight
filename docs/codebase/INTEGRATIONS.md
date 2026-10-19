# External Integrations

## Integration Inventory

| System | Type | Purpose | Auth | Criticality | Evidence |
| --- | --- | --- | --- | --- | --- |
| PostgreSQL 17 | Database | Accounts, children, content, learning, privacy, support | Local credentials via env | High | `docker-compose.yml`, `backend/src/repositories/` |
| Cloudflare Quick Tunnel | Temporary review transport | Expose loopback React dev server for inspection | Account-less temporary URL | Review only | Runtime command/log; not production config |
| Browser local storage | Client state | Stores parent bearer token | Bearer token | High | `frontend/src/App.tsx` |

No queue, payment, ads, analytics, push, social, location, camera, or microphone production SDK is present; see `docs/sdk-inventory.md`.

## Data Stores

| Store | Role | Access layer | Key risk | Evidence |
| --- | --- | --- | --- | --- |
| PostgreSQL | Authoritative product data | Rust repositories | Backup/deletion propagation not production-proven | `backend/src/repositories/`, `docs/repo-status-audit.md` |
| Local storage | Session token | React auth controller | Browser token exposure model requires production review | `frontend/src/App.tsx` |

## Secrets and Credentials

- `.env` files are ignored; examples are committed.
- Local PostgreSQL credentials are development defaults.
- Production secrets manager and rotation are `[TODO]`.

## Reliability and Observability

- UI has explicit loading/error states; no silent product-data fallback is accepted.
- Database operations return structured errors; retry/circuit-breaker policy is incomplete.
- `tracing` exists, but production metrics/APM and alerting are not implemented.

## Evidence

- `.env.example`
- `backend/.env.example`
- `backend/src/security.rs`
- `docs/sdk-inventory.md`

