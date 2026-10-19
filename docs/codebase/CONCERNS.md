# Codebase Concerns

## Top Risks

| Severity | Concern | Evidence | Impact | Suggested action |
| --- | --- | --- | --- | --- |
| High | No native Android project | Repository scan | Android delivery cannot be verified | Select native/Capacitor approach and implement primary flows |
| High | Production hosting/monitoring/backup not implemented | `docs/repo-status-audit.md` | Cannot claim launch readiness | Implement staging/CD/observability/restore drill |
| High | Prototype gate previously claimed product readiness | `prototype/tests/html-prototype-gate.mjs` and correction report | Misleading completion status | Restrict gate to prototype review only |
| Medium | React application is a 4,000+ line file | `frontend/src/App.tsx` | High regression and ownership risk | Split API clients, controllers, routes and components |
| Medium | Bootstrap home/page endpoints remain static | `backend/src/repositories/pages.rs` | Home does not represent full persisted product state | Replace with authoritative queries |
| Medium | Process-local rate limiting | `backend/src/security.rs` | Limits diverge across instances | Move enforcement to edge/shared store |

## Technical Debt

| Debt | Why | Where | Risk | Suggested fix |
| --- | --- | --- | --- | --- |
| Draft content and missing teaching audio | Asset pipeline incomplete | `backend/migrations/0004_seed_core_courses.sql`, `assets/` | Child learning quality incomplete | Complete reviewed content/audio pipeline |
| Frontend mixed responsibilities | MVP grew in one file | `frontend/src/App.tsx` | Slow, fragile changes | Extract typed API layer and route modules |
| No production deployment implementation | Planning preceded infrastructure | `docs/deployment-plan.md` | Local-only product | Build staging then production pipeline |

## Security Concerns

| Risk | Category | Evidence | Mitigation | Gap |
| --- | --- | --- | --- | --- |
| Browser bearer token storage | A07 | `frontend/src/App.tsx` | Hashed server sessions and logout | Production session/storage review required |
| Process-local rate limiting | A04 | `backend/src/security.rs` | Request throttling exists | Not shared across instances |
| Local DB exposure | A05 | `docker-compose.yml` | Changed to bind `127.0.0.1` | CI compose exposure is runner-local only |

## Performance and Scaling

| Concern | Evidence | Symptom | Risk | Improvement |
| --- | --- | --- | --- | --- |
| Large React root module | `frontend/src/App.tsx` | Large bundle/module responsibility | Slower iteration and rendering analysis | Route-level splitting and lazy loading |
| No load/performance suite | codebase scan | No baseline | Unknown capacity | Add API load and browser performance budgets |

## Fragile Areas

| Area | Why fragile | Churn signal | Safe strategy |
| --- | --- | --- | --- |
| `prototype/` readiness reports | Scope confused with product | Recent commits focus on prototype | Keep status namespace separate |
| `frontend/src/App.tsx` | Many features in one file | Largest core source file | Extract incrementally with E2E after each step |

## `[ASK USER]` Questions

1. [ASK USER] Should Android be native Kotlin/Compose or a packaged web application? The repository contains no chosen Android runtime.
2. [ASK USER] Which hosting provider should own staging/production API, database, assets, and monitoring?

## Evidence

- `docs/codebase/.codebase-scan.txt`
- `docs/repo-status-audit.md`
- `Todo/2026-06-01_10-05-19-real-product-backlog.md`
- `frontend/src/App.tsx`
- `backend/src/repositories/pages.rs`
