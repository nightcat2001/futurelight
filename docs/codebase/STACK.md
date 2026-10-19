# Technology Stack

## Runtime Summary

| Area | Value | Evidence |
| --- | --- | --- |
| Frontend | TypeScript, React 19.2.6, Vite 8.0.12 | `frontend/package.json` |
| Backend | Rust 2024 edition, Axum 0.8, Tokio 1 | `backend/Cargo.toml` |
| Database | PostgreSQL 17 | `docker-compose.yml` |
| Package managers | npm and Cargo | `frontend/package-lock.json`, `backend/Cargo.lock` |

Exact Rust compiler pin: `[TODO]` because no `rust-toolchain.toml` is present.

## Production Frameworks and Dependencies

| Dependency | Version | Role | Evidence |
| --- | --- | --- | --- |
| React / React DOM | 19.2.6 | Browser UI | `frontend/package.json` |
| Axum | 0.8 | HTTP routing | `backend/Cargo.toml` |
| Tokio | 1 | Async runtime | `backend/Cargo.toml` |
| tokio-postgres | 0.7 | PostgreSQL access | `backend/Cargo.toml` |
| Argon2 | 0.5 | Password hashing | `backend/Cargo.toml` |
| tower-http | 0.6 | CORS and tracing | `backend/Cargo.toml` |

## Development Toolchain

| Tool | Purpose | Evidence |
| --- | --- | --- |
| TypeScript | Frontend type/build checks | `frontend/tsconfig.app.json` |
| ESLint | Frontend lint | `frontend/eslint.config.js` |
| Cargo fmt/clippy/test | Backend quality checks | `.github/workflows/verify.yml` |
| Playwright Core | Browser E2E and visual checks | `frontend/package.json`, `tools/run-playwright-e2e.ps1` |
| Docker Compose | Local PostgreSQL | `docker-compose.yml` |

## Key Commands

```powershell
docker compose up -d postgres
Set-Location backend; cargo run
Set-Location frontend; npm run dev
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\tools\verify-delivery.ps1
```

## Environment and Config

- Config sources: `.env.example`, `backend/.env.example`, `frontend/vite.config.ts`.
- Main variables: `DATABASE_URL`, `PORT`, `RUN_MIGRATIONS`, `ALLOWED_ORIGINS`, rate-limit and retention settings.
- Assigned ports: frontend `37173`, API `37200`, PostgreSQL `37432`.

## Evidence

- `frontend/package.json`
- `backend/Cargo.toml`
- `docker-compose.yml`
- `.github/workflows/verify.yml`

