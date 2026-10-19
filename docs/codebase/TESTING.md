# Testing Patterns

## Test Stack and Commands

- Backend: Cargo test with Axum/Tower integration helpers and real PostgreSQL.
- Frontend quality: TypeScript build and ESLint.
- Browser: Playwright Core through project runners.

```powershell
Set-Location backend; cargo test
Set-Location frontend; npm run build; npm run lint
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\tools\run-playwright-e2e.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\tools\verify-delivery.ps1
```

## Test Layout

- Backend integration/security/retention tests: `backend/tests/*.rs`.
- Browser flows and runners: `tools/playwright-e2e-flow.js`, `tools/playwright-flow-runner.mjs`.
- Visual browser checks: `tools/playwright-visual-smoke.js`.
- Dedicated browser test account is removed before and after each E2E run.

## Scope Matrix

| Scope | Covered | Target | Notes |
| --- | --- | --- | --- |
| Unit | Partial | Backend validation/helpers | No coverage threshold found |
| Integration | Yes | API, PostgreSQL, security, retention | Uses real local DB |
| E2E | Yes | Auth, child, consent, learning, practice, rewards, parent, courses | Supports localhost and explicit public base URL |
| Visual | Yes | Desktop/mobile core routes | Screenshot and overflow/broken-image checks |
| Android | No | Native Android app | No Android project found |

## Isolation Strategy

- No product-flow mock is used for current E2E.
- The E2E account is deterministic and DB-cleaned before/after execution.
- Port policy enforces dedicated FutureLight ports.
- Common failure fixed on 2026-10-20: generic text locator selected a hidden option; tests now scope child names to visible cards.

## Coverage and Gaps

- Coverage tool/threshold: `[TODO]`.
- Missing: native Android tests, production deployment smoke, multi-instance rate-limit tests, backup/restore drill.

## Evidence

- `backend/tests/product_flow_integration.rs`
- `backend/tests/security_baseline.rs`
- `backend/tests/retention_cleanup.rs`
- `tools/run-playwright-e2e.ps1`
- `.github/workflows/verify.yml`

