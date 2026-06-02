# FutureLight

FutureLight is a launch-grade children's language learning product in progress. The repo currently contains the React shell, Rust API shell with a local security baseline, PostgreSQL service config, six draft core course seeds with market/English-variant selection, first content-admin workflow, the first reviewed generated image batch, first HyperFrames video templates, and planning/audit docs.

Current stack:

- Frontend: React + Vite
- Backend: Rust + Axum
- Database: PostgreSQL

Primary planning and delivery docs live in [`docs`](docs).

Current repo status:

- Latest execution backlog: `Todo/2026-06-01_10-05-19-real-product-backlog.md`
- Repo implementation audit: `docs/repo-status-audit.md`
- Child privacy data map: `docs/child-privacy-data-map.md`
- COPPA/GDPR/UK child checklist: `docs/coppa-gdpr-uk-childrens-code-checklist.md`
- SDK inventory: `docs/sdk-inventory.md`
- Store metadata draft: `docs/store-metadata-draft.md`
- DE/UK/US store listing copy: `docs/store-listing-copy-de-uk-us.md`
- Delivery verification checklist: `docs/交付驗證命令清單.md`
- No-mock completion standard: `docs/交付完成標準.md`
- Art bible: `docs/art-bible.md`
- Port policy: `docs/環境與Port規劃.md`

First content and asset files:

- `assets/asset_manifest.json`
- `assets/audio/ui/*.wav`
- `assets/images/course-covers/*.png`
- `assets/images/word-cards/*.png`
- `assets/images/badges/*.png`
- `assets/images/characters/*.png`
- `video/futurelight-templates`
- `content/courses/animal-english-words.json`
- `backend/migrations/0004_seed_core_courses.sql`
- `backend/migrations/0009_market_variant_content_selection.sql`

AI production pipeline:

- `docs/AI協作製作流程.md`

## Non-Negotiable Startup Rules

Before project work or service startup, read:

- `Todo/README.md`
- `Todo/*.md`
- `C:\Users\USER\Desktop\work\config\port-registry.json`
- `C:\Users\USER\Desktop\work\PORT_POLICY.md`
- `C:\Users\USER\Desktop\work\PORT_ALLOCATION_PLAN.md`
- `docs/環境與Port規劃.md`

Before starting services or changing ports, run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File C:\Users\USER\Desktop\work\scripts\check-port-policy.ps1
```

FutureLight must use only the assigned local ports:

- Frontend: `37173`
- Backend API: `37200`
- PostgreSQL host port: `37432`

Do not use historical ports `5173 / 4000 / 5433` for FutureLight. Do not choose fallback ports. If an assigned port is busy, stop and investigate the conflicting process.

## Local Startup

Start PostgreSQL:

```bash
docker compose up -d postgres
```

Start the Rust API:

```bash
cd backend
cargo run
```

Apply migrations without starting the API server:

```bash
cd backend
cargo run -- migrate
```

The API also runs pending migrations on startup by default. Set `RUN_MIGRATIONS=false` only for diagnostic work where database access is intentionally unavailable.

Security-related local defaults:

- `ALLOWED_ORIGINS=http://127.0.0.1:37173,http://localhost:37173`
- `RATE_LIMIT_WINDOW_SECONDS=60`
- `RATE_LIMIT_MAX_REQUESTS=240`
- `AUTH_RATE_LIMIT_MAX_REQUESTS=30`

See `docs/security-baseline.md` before changing CORS, origin, auth, or rate-limit behavior.

Deployment planning lives in `docs/deployment-plan.md`; production hosting is not implemented yet. Operations and support planning lives in `docs/operations-support-plan.md`.

GitHub Actions core verification lives in `.github/workflows/verify.yml`. Local full delivery verification, including Playwright E2E and visual smoke on assigned local ports, remains `tools/verify-delivery.ps1`.

Start the React frontend:

```bash
cd frontend
npm install
npm run dev
```

Default local URLs:

- Frontend: http://localhost:37173
- Backend: http://localhost:37200
- PostgreSQL: localhost:37432
- Health: http://localhost:37200/health

Current frontend routes:

- `/`
- `/courses` (course, lesson, and activity exploration)
- `/learn` (market/variant-aware learning session, attempt recording, progress and rewards refresh)
- `/practice` (market/variant-aware single-choice practice attempt flow with reward display)
- `/parent` (parent sign-up, login, gated settings, DB-backed sound preferences, child profile CRUD, learning summaries, consent, downloadable export, child deletion, and parent account deletion controls)
- `/content` (content-admin course, lesson, activity, asset-selection, publish-check, and version-history workflow)
- `/settings`

Current backend auth endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PATCH /api/auth/me`
- `POST /api/auth/logout`

Current child profile endpoints:

- `POST /api/children`
- `GET /api/children`
- `GET /api/children/{child_id}`
- `PATCH /api/children/{child_id}`
- `DELETE /api/children/{child_id}`

Current course content endpoints:

- `GET /api/courses`
- `GET /api/courses/{course_slug}`
- `GET /api/courses/{course_slug}/lessons`
- `GET /api/lessons/{lesson_id}/activities`

Course endpoints accept optional child-selection query parameters:

- `market_region=DE|UK|US|TW|OTHER`
- `english_variant=american|british`

When supplied, the API filters course/lesson/activity availability and merges activity variant overrides, such as American `color` versus British `colour` teaching copy.

Current content-admin endpoints require a bearer token for a parent account with `is_content_admin=true`:

- `GET /api/admin/courses`
- `POST /api/admin/courses`
- `PATCH /api/admin/courses/{course_id}`
- `DELETE /api/admin/courses/{course_id}` (archives the course)
- `GET /api/admin/courses/{course_id}/lessons`
- `POST /api/admin/courses/{course_id}/lessons`
- `POST /api/admin/courses/{course_id}/publish-check`
- `PATCH /api/admin/lessons/{lesson_id}`
- `DELETE /api/admin/lessons/{lesson_id}`
- `GET /api/admin/lessons/{lesson_id}/activities`
- `POST /api/admin/lessons/{lesson_id}/activities`
- `PATCH /api/admin/activities/{activity_id}`
- `DELETE /api/admin/activities/{activity_id}`
- `GET /api/admin/assets`
- `GET /api/admin/content-versions`

Current learning progress endpoints:

- `POST /api/learning/sessions`
- `PATCH /api/learning/sessions/{session_id}/complete`
- `POST /api/learning/attempts`
- `GET /api/children/{child_id}/progress`
- `GET /api/children/{child_id}/rewards`

Current privacy endpoints:

- `GET /api/privacy/consents`
- `POST /api/privacy/consents`
- `POST /api/privacy/consents/{consent_id}/revoke`
- `POST /api/privacy/data-export-requests`
- `DELETE /api/privacy/children/{child_id}`

## Verification

Run the full delivery checklist from the repo root:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\tools\verify-delivery.ps1
```

The script runs port policy, `git diff --check`, migrations, Rust fmt/clippy/test, backend content publish check, frontend build/lint, Playwright E2E, browser visual smoke, content/asset validation, and secret scan. See `docs/交付驗證命令清單.md`.

Individual checks:

```bash
cd backend
cargo check
```

```bash
cd backend
cargo test --test product_flow_integration -- --nocapture
```

```bash
cd frontend
npm run build
```

```bash
node tools/check-content-assets.mjs
```

This repo is not yet product-complete. Static/demo payloads, draft content, planned audio assets, or unconnected UI must not be marked complete. See `docs/repo-status-audit.md` before claiming product readiness.
