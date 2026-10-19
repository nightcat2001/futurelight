# Codebase Structure

## Top-Level Map

| Path | Purpose | Evidence |
| --- | --- | --- |
| `frontend/` | React product application | `frontend/src/main.tsx`, `frontend/src/App.tsx` |
| `backend/` | Axum API, domain, services, repositories, migrations | `backend/src/lib.rs`, `backend/src/routes/mod.rs` |
| `content/` | Source course content | `content/courses/animal-english-words.json` |
| `assets/` | Reviewed image/audio assets and manifest | `assets/asset_manifest.json` |
| `prototype/` | Design-review prototype, not product runtime | `prototype/README.md` |
| `tools/` | E2E, validation, delivery and Figma tooling | `tools/verify-delivery.ps1` |
| `docs/` | Product, legal, technical and audit documents | `docs/README.md` |

## Entry Points

- Frontend: `frontend/src/main.tsx` mounts `frontend/src/App.tsx`.
- Backend server/commands: `backend/src/main.rs` and `backend/src/lib.rs`.
- Browser E2E: `tools/run-playwright-e2e.ps1`.
- Retention/content commands: selected through backend CLI arguments in `backend/src/main.rs`.

## Module Boundaries

| Boundary | Owns | Must not own |
| --- | --- | --- |
| Frontend | Routes, forms, browser state, API calls | SQL and server authorization |
| Routes | HTTP extraction and response mapping | Database queries |
| Services | Validation and product rules | HTTP presentation |
| Repositories | PostgreSQL queries and persistence | Browser behavior |
| Migrations | Schema and deterministic seeds | Runtime UI logic |

## Naming and Organization

- Rust is layer-organized under `routes/`, `services/`, and `repositories/` with snake_case files.
- React components and controllers currently share the large `frontend/src/App.tsx` file.
- TypeScript uses relative imports and Vite bundler resolution; no path aliases are configured.

## Evidence

- `frontend/src/main.tsx`
- `backend/src/lib.rs`
- `backend/src/routes/mod.rs`
- `docs/codebase/.codebase-scan.txt`

