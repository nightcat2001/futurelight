# FutureLight Product Reality Classification

Date: 2026-10-20

## Source-confirmed

- `README.md`: FutureLight is a launch-grade product in progress and is not product-complete.
- `README.md`: assigned ports are frontend `37173`, API `37200`, and PostgreSQL `37432`.
- `docs/repo-status-audit.md`: real auth, child CRUD, course, learning, progress, reward, privacy, support, and content-admin paths exist, while several launch blockers remain.
- `Todo/2026-06-01_10-05-19-real-product-backlog.md`: release gates 4, 5, and 6 are not complete.

## Image-confirmed

- The inspected Cloudflare page showed the HTML prototype route rather than the React product route.

## Code-confirmable

- `frontend/src/App.tsx`: API-backed React routes and product flows.
- `backend/src/routes/mod.rs`: auth, children, courses, learning, privacy, support, and content-admin API routes.
- `backend/migrations/`: PostgreSQL schema and seed migrations.
- `tools/run-playwright-e2e.ps1`: real local browser flow runner.

## Design-owned-by-us

- Separate prototype-review status from product-release status in all validators and reports.
- Expose only the real React application for product inspection.
- Keep local services isolated on registered ports and loopback interfaces.

## Genuinely Open Business Questions

- None required to start and verify the existing real local implementation.

## Not Verified

- Current full verification run after this correction.
- Android implementation status.
- Production hosting and operational readiness.
