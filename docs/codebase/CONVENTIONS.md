# Coding Conventions

## Naming Rules

| Item | Rule | Example | Evidence |
| --- | --- | --- | --- |
| Rust files/functions | snake_case | `list_child_progress` | `backend/src/routes/progress.rs` |
| Rust types | PascalCase | `AppState` | `backend/src/state.rs` |
| React components/types | PascalCase | `ChildProfileList` | `frontend/src/App.tsx` |
| TypeScript variables/functions | camelCase | `refreshChildren` | `frontend/src/App.tsx` |
| Environment variables | SCREAMING_SNAKE_CASE | `ALLOWED_ORIGINS` | `backend/.env.example` |

## Formatting and Linting

- Rust: `cargo fmt --check`, `cargo clippy --all-targets -- -D warnings`.
- Frontend: ESLint plus TypeScript build checks.
- Commands and CI enforcement are in `.github/workflows/verify.yml`.

## Imports and Modules

- Rust modules are declared from layer `mod.rs` files.
- TypeScript uses relative imports and `verbatimModuleSyntax`.
- No TypeScript barrel or alias convention is configured.

## Error and Logging

- Backend maps product errors through `backend/src/errors.rs`.
- Frontend maps API error codes to parent-readable messages in `frontend/src/App.tsx`.
- Tracing dependencies exist; production log transport and redaction verification are `[TODO]`.

## Testing

- Backend integration tests live in `backend/tests/*.rs`.
- Browser flows live in `tools/playwright-*.js` and PowerShell wrappers.
- Real PostgreSQL is used; the E2E runner removes its dedicated test account before and after a run.
- Enforced coverage percentage: `[TODO]`; no threshold configuration was found.

## Evidence

- `frontend/eslint.config.js`
- `frontend/tsconfig.app.json`
- `.github/workflows/verify.yml`
- `backend/tests/product_flow_integration.rs`

