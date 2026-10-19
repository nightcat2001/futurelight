# Architecture

## Architectural Style

- Browser/server/database product with a layered Rust backend.
- React calls relative `/api` routes; Vite proxies local requests to Axum.
- Axum routes delegate to services and repositories; repositories use parameterized PostgreSQL queries.

## System Flow

```text
React route/form
-> relative /api request
-> Axum security middleware and route
-> service validation/business rule
-> PostgreSQL repository
-> JSON response
-> React loading/error/success state
```

## Layer Responsibilities

| Layer | Owns | Must not own | Evidence |
| --- | --- | --- | --- |
| React app | Product routes and interaction | Persistence authorization | `frontend/src/App.tsx` |
| Security middleware | CORS, origin guard, rate limit | Product feature rules | `backend/src/security.rs` |
| Routes | HTTP contracts | SQL | `backend/src/routes/mod.rs` |
| Services | Validation and orchestration | DOM/UI | `backend/src/services/` |
| Repositories | Persistence and ownership filters | Route layout | `backend/src/repositories/` |

## Reused Patterns

| Pattern | Where | Purpose |
| --- | --- | --- |
| Repository | `backend/src/repositories/` | Isolate PostgreSQL access |
| Service | `backend/src/services/` | Centralize validation and business rules |
| Context/controller | `frontend/src/App.tsx` | Share auth, child, sound and gate state |
| Embedded migrations | `backend/src/migrations.rs` | Apply ordered schema changes |

## Known Architectural Risks

- `frontend/src/App.tsx` is over 4,000 lines and combines API clients, state controllers, routes, and presentation.
- `/api/pages` and `/api/home/summary` still use bootstrap/static repository data.
- Rate limiting is process-local and is not suitable for multi-instance production.
- There is no native Android project in the repository.

## Evidence

- `frontend/src/App.tsx`
- `backend/src/routes/mod.rs`
- `backend/src/services/`
- `backend/src/repositories/`
- `docs/repo-status-audit.md`

