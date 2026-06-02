# FutureLight Real Product Backlog

Created: 2026-06-01 10:05:19 +08:00
Status: Open

本檔為 FutureLight 目前唯一主線代辦。舊 roadmap 保留為歷史參考，但後續實作、驗收、交接與新 Codex 視窗都以本檔為準。

## Non-Negotiable Rules

- 2026-06-01 10:05:19 +08:00 不准 mock 被標記為完成；前端、Rust API、PostgreSQL、AI 素材、音效、影片與瀏覽器驗證都必須是真實資料流或真實檔案。
- 2026-06-01 10:05:19 +08:00 開始任何工作前必讀 `Todo/README.md`、本檔、相關 docs，以及對應 skill。
- 2026-06-01 10:05:19 +08:00 不准任意啟動 port；FutureLight assigned ports 為 frontend `37173`、API `37200`、PostgreSQL `37432`。
- 2026-06-01 10:05:19 +08:00 舊 `5173 / 4000 / 5433` 只能作為歷史資訊，不可直接啟動。
- 2026-06-01 10:05:19 +08:00 每個完成項必須有驗收證據：檔案、測試、真實 API/DB、截圖、瀏覽器流程或生成資源 manifest。
- 2026-06-01 10:05:19 +08:00 兒童區不得有廣告、外部連結、購買入口、未審核 AI 內容或未經家長同意的敏感資料處理。

## Source Documents

- `docs/產品上線規劃.md`
- `docs/產品需求PRD.md`
- `docs/技術落地藍圖.md`
- `docs/法規與上架檢查.md`
- `docs/國際市場研究-德英美.md`
- `docs/AI協作製作流程.md`
- `docs/外掛使用規劃.md`
- `docs/環境與Port規劃.md`
- `docs/流程審核.md`
- `docs/音效規劃.md`

## Phase 0：立即解除 Blocker

- [x] 2026-06-01 10:05:19 +08:00 P0-BLOCKER-001 遷移所有本機 port 設定到 registry 指定值：frontend `37173`、API `37200`、PostgreSQL `37432`。
  - Completed: 2026-06-01 10:10:18 +08:00
  - 驗收：`frontend/vite.config.ts`、backend env/default、`docker-compose.yml`、`.env.example`、README 全部一致。
  - 驗收：Vite 使用 `strictPort: true` 或等效嚴格模式。
  - 驗收：啟動前跑 workspace port policy check；未完成前不得啟動服務。
  - 驗收證據：`check-port-policy.ps1` 通過、`npm.cmd run build` 通過、`cargo check` 通過；未啟動任何服務。
- [x] 2026-06-01 10:05:19 +08:00 P0-BLOCKER-002 建立 no-mock enforcement checklist，放進 PR/交付檢查流程。
  - Completed: 2026-06-01 10:12:27 +08:00
  - 驗收：前端頁面、Rust API、DB、AI 素材、音效、影片、瀏覽器驗證都列出「不可接受 mock」條件。
  - 驗收：若功能未完成，UI 必須 disabled / coming soon / blocked，不可假成功。
  - 驗收證據：新增 `docs/交付完成標準.md` 與 `.github/pull_request_template.md`，並更新 `docs/README.md`。
- [x] 2026-06-01 10:05:19 +08:00 P0-BLOCKER-003 建立 repo 現況審計表。
  - Completed: 2026-06-01 10:33:37 +08:00
  - 驗收：列出目前 React/Rust/PostgreSQL/asset/content 的真實完成度。
  - 驗收：列出所有硬編資料、固定 JSON、未接 API 按鈕、缺檔素材、缺測試項。
- [x] 2026-06-01 10:05:19 +08:00 P0-BLOCKER-004 修正 README 啟動說明，避免任何 agent 依舊 port 啟動。
  - Completed: 2026-06-01 10:33:37 +08:00
  - 驗收：README 只保留遷移後指令；歷史 port 僅列為禁止事項。

## Phase 1：資料層與後端真實 API

- [x] 2026-06-01 10:05:19 +08:00 P0-BACKEND-001 建立 PostgreSQL migration 系統。
  - Completed: 2026-06-01 10:39:10 +08:00
  - 驗收：可從空 DB 重建 schema。
  - 驗收：至少包含 users、children、courses、lessons、activities、attempts、progress、rewards、assets、consents、audit_logs。
- [x] 2026-06-01 10:05:19 +08:00 P0-BACKEND-002 建立 Rust API 分層。
  - Completed: 2026-06-01 10:42:12 +08:00
  - 驗收：route、service、repository、domain model、error model、request validation 分離。
  - 驗收：API 不回固定 JSON 當完成。
- [x] 2026-06-01 10:05:19 +08:00 P0-BACKEND-003 完成 auth 與 parent account API。
  - Completed: 2026-06-01 10:47:13 +08:00
  - 驗收：家長註冊、登入、登出、目前使用者、密碼重設或可替代安全流程。
  - 驗收：密碼 hash、token/session、輸入驗證、錯誤格式完整。
- [x] 2026-06-01 10:05:19 +08:00 P0-BACKEND-004 完成 child profile API。
  - Completed: 2026-06-01 10:50:49 +08:00
  - 驗收：建立/編輯/刪除/查詢孩子資料。
  - 驗收：孩子資料只能由所屬家長讀寫。
  - 驗收：支援 age_band、market_region、english_variant。
- [x] 2026-06-01 10:05:19 +08:00 P0-BACKEND-005 完成 course / lesson / activity API。
  - Completed: 2026-06-01 10:55:36 +08:00
  - 驗收：課程、單元、步驟、題目從 PostgreSQL 讀取。
  - 驗收：支援 published 狀態、年齡層、主題、語言變體、地區可用標記。
- [x] 2026-06-01 10:05:19 +08:00 P0-BACKEND-006 完成 learning session、attempt、progress API。
  - Completed: 2026-06-01 11:01:11 +08:00
  - 驗收：開始課程、完成步驟、提交答案、記錄音檔播放、更新 mastery/progress。
  - 驗收：中途離開可恢復第一個未完成步驟。
- [x] 2026-06-01 10:05:19 +08:00 P0-BACKEND-007 consent / privacy / data deletion API.
  - Completed: 2026-06-01 11:06:44 +08:00
  - Evidence: implemented consent grant/list/revoke, data export audit request, and privacy child deletion endpoints.
  - Evidence: bearer auth, parent-child ownership checks, and audit_logs writes were verified by backend smoke flow.
- [x] 2026-06-01 10:05:19 +08:00 P0-BACKEND-008 backend integration tests.
  - Completed: 2026-06-01 11:12:41 +08:00
  - Evidence: added `backend/tests/product_flow_integration.rs` with real PostgreSQL coverage for auth, children, courses, progress, consent, and privacy child deletion.
  - Evidence: rejection cases cover duplicate parent, wrong password, invalid child age, cross-parent child read, missing course, cross-parent session start, invalid score, missing consent child, cross-parent delete, and revoked session.
  - Verification: `cargo test --test product_flow_integration -- --nocapture` passed.
## Phase 2：React 真實頁面與流程
- [x] 2026-06-01 10:05:19 +08:00 P0-FRONTEND-001 React route shell.
  - Completed: 2026-06-01 11:24:39 +08:00
  - Evidence: replaced the single-page state switch with URL-driven routes for `/`, `/courses`, `/learn`, `/practice`, `/parent`, `/settings`, plus a not-found state.
  - Evidence: implemented History API navigation and `popstate` handling for browser back/forward.
  - Verification: `npm.cmd run build`, `npm.cmd run lint`, Chrome headless DOM checks, and Playwright CLI open/click/go-back snapshots passed.
- [x] 2026-06-01 10:05:19 +08:00 P0-FRONTEND-002 parent signup/login UI.
  - Completed: 2026-06-01 11:32:45 +08:00
  - Evidence: `/parent` now calls `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, and `/api/auth/logout` with bearer token storage in localStorage.
  - Evidence: UI handles loading, signed-in/signed-out states, backend error codes, and logout token clearing.
  - Verification: `npm.cmd run build`, `npm.cmd run lint`, and Playwright CLI register/logout/login/logout smoke passed against the local backend.
- [x] 2026-06-01 10:05:19 +08:00 P0-FRONTEND-003 child profile UI.
  - Completed: 2026-06-01 11:41:49 +08:00
  - Evidence: signed-in `/parent` now loads child profiles from `/api/children` and supports create, edit, and delete with bearer auth.
  - Evidence: UI uses real validation options for age band, region, and English variant with loading/error/empty states.
  - Verification: `npm.cmd run build`, `npm.cmd run lint`, and Playwright CLI register/create-child/edit-child/delete-child smoke passed against the local backend.
- [x] 2026-06-01 10:05:19 +08:00 P0-FRONTEND-004 onboarding market/age/privacy choices.
  - Completed: 2026-06-01 11:47:31 +08:00
  - Evidence: child onboarding form includes age band, market region, English variant, region-specific privacy guidance, and parent privacy consent choice.
  - Evidence: when selected, onboarding writes `parental_privacy` consent through `/api/privacy/consents` with child/market/age/variant evidence.
  - Verification: `npm.cmd run build`, `npm.cmd run lint`, Playwright CLI onboarding smoke, and PostgreSQL consent count check passed.
- [x] 2026-06-01 10:05:19 +08:00 P0-FRONTEND-005 course exploration UI.
  - Completed: 2026-06-01 11:51:41 +08:00
  - Evidence: `/courses` now selects API-backed courses, fetches lessons from `/api/courses/{course_slug}/lessons`, and fetches activities from `/api/lessons/{lesson_id}/activities`.
  - Evidence: selected course detail shows lesson objectives and activity prompts from PostgreSQL-backed API responses.
  - Verification: `npm.cmd run build`, `npm.cmd run lint`, and Playwright CLI `/courses` smoke passed.
- [x] 2026-06-01 10:05:19 +08:00 P0-FRONTEND-006 learning player UI.
  - Completed: 2026-06-01 11:58:52 +08:00
  - Evidence: `/learn` now requires parent auth and child profile, selects child/course/lesson, shows API-backed activity prompts, starts learning sessions, records attempts, refreshes progress, and completes sessions.
  - Evidence: attempts use `/api/learning/attempts`, sessions use `/api/learning/sessions`, completion uses `/api/learning/sessions/{session_id}/complete`, and progress uses `/api/children/{child_id}/progress`.
  - Verification: `npm.cmd run build`, `npm.cmd run lint`, Playwright CLI learning smoke, and PostgreSQL attempts/progress/completed-session count checks passed.
- [x] 2026-06-01 10:05:19 +08:00 P0-FRONTEND-007 practice game attempt flow.
  - Completed: 2026-06-01 12:09:03 +08:00
  - Evidence: backend activity API now returns `answer_key`; `/practice` loads API-backed child/course/lesson/activity data, renders single-choice choices, grades against `answer_key`, records attempts, and refreshes progress.
  - Evidence: practice attempts write through `/api/learning/attempts` and progress refreshes through `/api/children/{child_id}/progress`.
  - Verification: `cargo fmt --check`, `cargo test`, `npm.cmd run build`, `npm.cmd run lint`, Playwright CLI practice smoke, and PostgreSQL attempts/progress count checks passed.
- [x] 2026-06-01 10:05:19 +08:00 P0-FRONTEND-008 progress and reward surfaces.
  - Completed: 2026-06-01 12:24:53 +08:00
  - Evidence: backend now awards persisted `activity_mastery` rewards on correct attempts and exposes `GET /api/children/{child_id}/rewards` with parent-child ownership checks.
  - Evidence: `/learn` and `/practice` refresh progress and rewards together, show a real Rewards metric, and render reward pills from the rewards API.
  - Verification: `cargo fmt --check`, `cargo test`, `npm.cmd run build`, `npm.cmd run lint`, Playwright CLI reward smoke, and PostgreSQL rewards/attempts count checks passed.
- [x] 2026-06-01 10:05:19 +08:00 P0-FRONTEND-009 parent center first version.
  - Completed: 2026-06-01 12:34:12 +08:00
  - Evidence: `/parent` now includes editable parent settings backed by `PATCH /api/auth/me`, child profile management, progress/reward summaries per child, consent listing/revocation, data export request, and privacy child data deletion.
  - Evidence: backend parent settings updates persist to PostgreSQL and are covered by the integration flow.
  - Verification: `cargo fmt --check`, `cargo test`, `npm.cmd run build`, `npm.cmd run lint`, Playwright CLI parent-center smoke, and PostgreSQL parent/audit/child count checks passed.
- [x] 2026-06-01 10:05:19 +08:00 P0-FRONTEND-010 parent gate.
  - Completed: 2026-06-01 12:41:39 +08:00
  - Evidence: adult/destructive parent-center actions now require a password-backed Parent Gate verified through the real `/api/auth/login` endpoint before settings save, data export, consent revoke, privacy child data deletion, and child profile deletion.
  - Evidence: failed password, cancel, and successful confirmation states are handled in the modal; successful gate checks are short-lived and do not bypass a page reload.
  - Verification: `npm.cmd run build`, `npm.cmd run lint`, Playwright CLI parent-gate smoke, and PostgreSQL parent/audit/child count checks passed.

## Phase 3：內容、音效、AI 素材與管理後台

- [x] 2026-06-01 10:05:19 +08:00 P1-CONTENT-001 建立第一批真實課程資料。
  - Completed: 2026-06-01 13:06:27 +08:00
  - Evidence: added `backend/migrations/0004_seed_core_courses.sql` with draft PostgreSQL seed data for animals, colors, numbers, family, food, and daily greetings.
  - Evidence: seed creates 6 courses, 6 lessons, and 29 activities/questions; integration test now asserts all six required course slugs are available from the course repository.
  - Verification: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\tools\verify-delivery.ps1` passed; live PostgreSQL query returned 6 courses, 6 lessons, and 29 activities.
- [x] 2026-06-01 10:05:19 +08:00 P1-CONTENT-002 建立 content checker 必過規則。
  - Completed: 2026-06-01 13:10:10 +08:00
  - Evidence: added `cargo run -- check-content` through `backend/src/content_checker.rs` and wired it into `tools/verify-delivery.ps1`.
  - Evidence: published PostgreSQL courses now fail verification if they lack cover assets, lessons, activities, answer keys, required word-card audio/visual material, materialized assets, or approved/published asset status.
  - Verification: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\tools\verify-delivery.ps1` passed and reported `Content publish check passed for 6 course(s), 0 published.`
- [x] 2026-06-01 10:05:19 +08:00 P1-ASSET-001 補齊 UI 音效真實檔案。
  - Completed: 2026-06-01 13:13:09 +08:00
  - Evidence: generated real WAV files under `assets/audio/ui` for `ui_click`, `ui_toggle`, `ui_error_soft`, `learning_step_complete`, `learning_unit_complete`, `answer_correct`, `answer_wrong_soft`, `reward_star`, `reward_badge`, `mission_complete`, and `page_success`.
  - Evidence: updated `assets/asset_manifest.json` with file paths, `approved` status, `procedural-synthesis` source, and prompt summaries; added `tools/generate-ui-audio.mjs` as reproducible generation source.
  - Verification: `node tools\check-content-assets.mjs` passed and found 12 assets; WAV files are non-empty.
- [x] 2026-06-01 10:05:19 +08:00 P1-ASSET-002 建立 SoundProvider 與音量設定。
  - Completed: 2026-06-01 13:27:03 +08:00
  - Evidence: added `backend/migrations/0005_parent_sound_preferences.sql` and extended parent auth/settings API to persist `sound_enabled`, `voice_volume`, `effect_volume`, and `auto_play_voice`.
  - Evidence: frontend now wraps the app in `SoundProvider`, serves WAV files from `frontend/public/assets/audio/ui`, plays navigation/practice/learning/settings cues, and exposes DB-backed parent settings controls for sound effects, lesson voice volume, UI effect volume, and voice autoplay.
  - Verification: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\tools\verify-delivery.ps1` passed; Playwright CLI sound-settings smoke saved preferences through Parent Gate and verified `/api/auth/me` returned `sound_enabled=false`, `auto_play_voice=false`, `voice_volume=72`, `effect_volume=44`.
- [x] 2026-06-01 10:05:19 +08:00 P1-ASSET-003 建立 art bible。
  - Completed: 2026-06-01 13:29:44 +08:00
  - Evidence: added `docs/art-bible.md` with FutureLight product feel, character proportions, color system, illustration style, prohibited visual content, age-band differences, word-card layout, course-cover layout, rewards/badges, manifest requirements, prompt template, and review checklist.
  - Verification: linked from README, docs index, and repo audit; `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\tools\verify-delivery.ps1` passed.
- [x] 2026-06-01 10:05:19 +08:00 P1-ASSET-004 使用 Image2.0 / imagegen 產出第一批真實圖片。
  - Completed: 2026-06-01 13:45:40 +08:00
  - 驗收：課程封面、單字卡、徽章、角色表情放入 `assets/images` 並更新 manifest。
  - 驗收：每個 AI 素材記錄 prompt、模型、日期、用途、授權狀態、審核者。
  - Evidence: generated and visually checked five art-bible-aligned images: `assets/images/course-covers/color-english-words-cover.png`, `assets/images/word-cards/apple-word-card.png`, `assets/images/badges/activity-mastery-badge.png`, `assets/images/characters/guide-happy.png`, and `assets/images/characters/guide-thinking.png`.
  - Evidence: copied the same five images into `frontend/public/assets/images` so the Vite app can serve them.
  - Evidence: updated `assets/asset_manifest.json` with approved source, prompt summary, model, generated date, intended use, license status, reviewer, and art bible metadata for the five generated images.
  - Evidence: added `backend/migrations/0006_seed_generated_image_assets.sql` and `backend/migrations/0007_generated_image_asset_metadata.sql` to seed DB asset rows, connect the color course cover, link the apple word-card activity image key, and preserve model/date/use/license/reviewer metadata.
  - Verification: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\tools\verify-delivery.ps1` passed and the content/asset checker reported 17 assets.
- [ ] 2026-06-01 10:05:19 +08:00 P1-ASSET-005 使用 Seedance 產出第一批真實短動畫。
  - 驗收：4-15 秒影片放入 `assets/video/generated`；更新 manifest；記錄 RunComfy request 或 blocker。
  - Blocked: 2026-06-01 13:48:51 +08:00 RunComfy CLI is not installed, `RUNCOMFY_TOKEN` is absent, and no local RunComfy token file exists at `C:\Users\USER\.config\runcomfy\token.json` or `C:\Users\USER\AppData\Roaming\runcomfy\token.json`.
  - Still blocked: 2026-06-02 14:36:56 +08:00 Stop Gate re-check confirmed the request payload exists, but no RunComfy auth/CLI is available to submit the Seedance job.
  - Evidence: added `assets/video/generated/seedance-guide-color-intro.request.json` with the Seedance request payload, intended output path, reference assets, and exact authentication blocker so it can be submitted after `runcomfy login` or `RUNCOMFY_TOKEN` is available.
- [x] 2026-06-01 10:05:19 +08:00 P1-VIDEO-001 建立 Remotion / HyperFrames 模板。
  - Completed: 2026-06-01 14:00:55 +08:00
  - 驗收：課程 intro、單字複習、家長週報、社群短片至少各有可 render 或可預覽 composition。
  - Evidence: scaffolded `video/futurelight-templates` with HyperFrames CLI and added four sub-compositions: `course-intro`, `word-review`, `parent-report`, and `social-short`.
  - Evidence: mirrored approved images and WAV cues into the HyperFrames project assets folder, then rendered `video/futurelight-templates/renders/futurelight-template-reel.mp4`.
  - Verification: `npm.cmd run check` in `video/futurelight-templates` passed HyperFrames lint, validate, and inspect with 0 lint errors/warnings and 0 layout issues; only the browser AudioContext autoplay warning remains.
  - Verification: draft render succeeded, output duration is 28.02 seconds, and sampled frames at 3s/10s/17s/24s showed the four expected compositions without black frames or obvious overlap after the parent-report card fix.
- [x] 2026-06-01 10:05:19 +08:00 P1-CMS-001 建立內容管理後台。
  - Completed: 2026-06-01 14:29:29 +08:00
  - 驗收：課程 CRUD、單元 CRUD、活動 CRUD、素材選取、發布前檢查、版本紀錄。
  - Evidence: added `backend/migrations/0008_content_admin_workflow.sql` with `parent_accounts.is_content_admin` and `content_versions`.
  - Evidence: added admin-gated backend endpoints for course create/update/archive/list, lesson create/update/delete/list, activity create/update/delete/list, asset listing, publish check, and content version history.
  - Evidence: `/content` React route now exposes the first Content Studio with course, lesson, activity editors, cover asset selection, word-card asset selection, publish check output, and version history.
  - Verification: backend integration test covers non-admin rejection, admin CRUD, asset selection, publish check blocker, content version history, activity/lesson delete, and course archive.
  - Verification: Playwright CLI content-admin smoke passed against local frontend `37173` and backend `37200`; temporary admin/course data and backend smoke process were cleaned up.

## Phase 4：法規、國際化與商店準備

- [x] 2026-06-01 10:05:19 +08:00 P0-LEGAL-001 child privacy data map.
  - Completed: 2026-06-01 12:58:07 +08:00
  - Evidence: added `docs/child-privacy-data-map.md` with current parent, child, learning, consent, audit, localStorage, and future voice/SDK data mapped to source, storage, purpose, parent control, retention status, third-party sharing, and gaps.
  - Evidence: map was checked against current Rust routes, PostgreSQL migrations, and official FTC/ICO/Google Play guidance reviewed on 2026-06-01.
  - Verification: document links added to README, legal checklist doc, and repo audit.
- [x] 2026-06-01 10:05:19 +08:00 P0-LEGAL-002 完成 COPPA / GDPR Article 8 / UK Children's Code checklist。
  - Completed: 2026-06-01 12:52:18 +08:00
  - Evidence: added `docs/coppa-gdpr-uk-childrens-code-checklist.md` with COPPA, GDPR Article 8, and UK Children's Code engineering checklist tied to current product flows.
  - Evidence: backend now blocks US/DE/UK child learning session and attempt writes without granted `parental_privacy` consent; frontend maps `parental_consent_required` to a parent-facing action.
  - Verification: `cargo fmt --check`, `cargo test`, `npm.cmd run build`, `npm.cmd run lint`, `git diff --check`, and workspace port policy check passed.
- [x] 2026-06-01 10:05:19 +08:00 P0-LEGAL-003 完成 SDK inventory。
  - Completed: 2026-06-01 12:55:54 +08:00
  - Evidence: added `docs/sdk-inventory.md` with current runtime/build dependency inventory and blocked future SDK classes for analytics, crash reporting, ads, payments, speech/AI, push, social, location, camera, and microphone.
  - Evidence: inventory records whether each package enters the child area, data collection/transmission, third-party sharing, Apple Kids decision, Google Families decision, and required review before use.
  - Verification: checked current `frontend/package.json`, `backend/Cargo.toml`, official Apple/Google/FTC SDK guidance, `cargo fmt --check`, `cargo test`, `npm.cmd run build`, `npm.cmd run lint`, `git diff --check`, and workspace port policy check.
- [x] 2026-06-01 10:05:19 +08:00 P1-I18N-001 完成 `market_region` 與 `english_variant` 前後端落地。
  - Completed: 2026-06-01 14:43:16 +08:00
  - Evidence: added `backend/migrations/0009_market_variant_content_selection.sql` with `market_regions` and `english_variants` arrays on courses, lessons, and activities, activity `variant_overrides`, constraints, GIN indexes, a DE availability difference, and American/British spelling-copy overrides.
  - Evidence: course APIs now accept optional `market_region=DE|UK|US|TW|OTHER` and `english_variant=american|british` query parameters; repository filtering applies them across course, lesson, and activity availability and merges variant overrides into activity JSON.
  - Evidence: `/learn` and `/practice` pass the selected child profile's market and English variant when loading lessons and activities, and only show compatible courses.
  - Verification: `cargo test --test product_flow_integration -- --nocapture`, `npm.cmd run lint`, and `npm.cmd run build` passed; integration coverage asserts invalid selection rejection, DE activity filtering, and British `colour` / American `color` overrides.
- [x] 2026-06-01 10:05:19 +08:00 P1-STORE-001 建立 App Store / Google Play metadata 草稿。
  - Completed: 2026-06-01 14:48:58 +08:00
  - Evidence: added `docs/store-metadata-draft.md` with App Store Connect product-page fields, Kids category decision guardrails, age-rating questionnaire draft, App Privacy label draft, review notes, Google Play target audience, Families policy positioning, IARC/content-rating draft, Data Safety draft, and reviewer account placeholders.
  - Evidence: updated README, docs index, SDK inventory, child privacy data map, and repo audit to point at the draft and record remaining store-readiness blockers.
  - Verification: official Apple and Google docs were checked on 2026-06-01 before drafting; full verification will be rerun after the next Stop Gate batch.
- [x] 2026-06-01 10:05:19 +08:00 P1-STORE-002 建立 DE/UK/US 商店文案與截圖需求。
  - Completed: 2026-06-01 14:52:16 +08:00
  - Evidence: added `docs/store-listing-copy-de-uk-us.md` with Germany, UK, and US store listing localization matrix, copy guardrails, subtitles, promotional text, Google short descriptions, keyword themes, long descriptions, privacy/trust positioning, screenshot overlay lines, required UI states, market-specific capture states, Apple screenshot requirements, Google Play icon/feature graphic/screenshot requirements, and feature graphic direction.
  - Evidence: updated README, docs index, and repo audit to point at the listing-copy draft and note remaining native screenshot, feature graphic, privacy URL, support URL, and legal-review blockers.
  - Verification: official Apple localization/screenshot and Google Play listing/preview-asset/Families guidance was checked on 2026-06-01 before drafting.
- [x] 2026-06-02 14:53:49 +08:00 P1-PRIVACY-001 完成家長資料匯出包與家長帳號刪除。
  - Completed: 2026-06-02 14:53:49 +08:00
  - Evidence: `POST /api/privacy/data-export-requests` now returns a parent-gated downloadable JSON export package with parent, child, consent, learning session, attempt, progress, reward, and audit data while excluding password/session hashes.
  - Evidence: `DELETE /api/privacy/parent-account` now deletes the parent account through PostgreSQL cascades, clears frontend local auth state, and records `parent_account_deleted`.
  - Evidence: Parent Center now downloads export JSON and exposes parent-gated parent account deletion.
  - Verification: `cargo test --test product_flow_integration -- --nocapture`, `cargo test`, `npm.cmd run lint`, and `npm.cmd run build` passed.

## Phase 5：品質、安全、上線

- [x] 2026-06-01 10:05:19 +08:00 P0-QA-001 建立每次交付必跑命令清單。
  - Completed: 2026-06-01 13:01:54 +08:00
  - Evidence: added `docs/交付驗證命令清單.md`, `tools/verify-delivery.ps1`, `tools/check-content-assets.mjs`, and `tools/check-secrets.ps1`.
  - Evidence: full verification now runs workspace port policy, `git diff --check`, migration check, Rust fmt/clippy/test, frontend build/lint, content/asset checker, and secret scan; the script now fails on native command non-zero exit codes.
  - Verification: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\tools\verify-delivery.ps1` passed.
- [x] 2026-06-01 10:05:19 +08:00 P1-QA-002 建立 Playwright E2E。
  - Completed: 2026-06-01 15:00:07 +08:00
  - Evidence: added `tools/playwright-e2e-flow.js` and `tools/run-playwright-e2e.ps1` using Playwright CLI via `npx --package @playwright/cli`; the wrapper runs port policy, starts only missing assigned-port services, waits for health/frontend, runs the browser flow, and cleans up `playwright-e2e@futurelight.test`.
  - Evidence: E2E covers parent account creation, sign out/sign in, child profile creation, parent privacy consent, learning session start/correct attempt/reward/session completion, practice choice/result, parent progress/consent view, and course library load.
  - Evidence: `tools/verify-delivery.ps1` now includes the Playwright E2E step, and `docs/交付驗證命令清單.md`, README, and repo audit document it.
  - Verification: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\tools\run-playwright-e2e.ps1` passed.
- [x] 2026-06-01 10:05:19 +08:00 P1-QA-003 建立 browser visual smoke。
  - Completed: 2026-06-01 15:14:33 +08:00
  - Evidence: added `tools/playwright-visual-smoke.js` and `tools/run-browser-visual-smoke.ps1` to capture home, courses, learn, practice, and parent routes across desktop and mobile viewports with a logged-in UK/British child profile.
  - Evidence: visual smoke checks horizontal overflow, visible buttons, button text overflow, broken images, and loaded course detail before saving screenshots under `output/playwright/visual-smoke`.
  - Evidence: fixed course cover public asset paths by serving DB-backed `assets/images/...` paths from `frontend/public/assets/images`, copied the animal cover into the canonical public mirror, and bound Vite to `127.0.0.1` for deterministic local QA.
  - Verification: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\tools\run-browser-visual-smoke.ps1` passed after screenshot review showed no broken course images, loading placeholders, or obvious mobile/desktop overlap.
- [x] 2026-06-01 10:05:19 +08:00 P1-SECURITY-001 建立安全基線。
  - Completed: 2026-06-01 15:54:56 +08:00
  - Evidence: added `backend/src/security.rs` with configured CORS allow-list, state-changing request Origin guard, process-local API/auth rate limiting, and hashed rate-limit identities.
  - Evidence: `AppConfig` now reads `ALLOWED_ORIGINS`, `RATE_LIMIT_WINDOW_SECONDS`, `RATE_LIMIT_MAX_REQUESTS`, and `AUTH_RATE_LIMIT_MAX_REQUESTS`; `routes::app_router` applies security middleware and CORS before the app serves requests.
  - Evidence: password and token handling remain Argon2 + hashed bearer sessions; SQL injection protection continues through parameterized `tokio-postgres` queries and service-layer validation.
  - Evidence: added `docs/security-baseline.md` with implemented controls, limits, and production follow-ups.
  - Verification: `cargo test --test security_baseline -- --nocapture` and `cargo test` passed.
- [x] 2026-06-01 10:05:19 +08:00 P2-OPS-001 建立 staging / production deployment plan。
  - Completed: 2026-06-01 16:01:01 +08:00
  - Evidence: added `docs/deployment-plan.md` covering frontend CDN/static hosting, Rust API deployment, managed PostgreSQL, object storage, runtime config, migration flow, staging verification, backup/restore, monitoring, rollback, and launch blockers.
  - Evidence: updated README, docs index, and repo audit to point at the plan and keep deployment implementation classified as incomplete.
- [x] 2026-06-01 10:05:19 +08:00 P2-OPS-002 建立營運與客服流程。
  - Completed: 2026-06-01 16:03:34 +08:00
  - Evidence: added `docs/operations-support-plan.md` covering support channels, child data deletion, data export, consent revoke, refunds, content error reports, store review rejection handling, parent questions, triage, escalation, support macros, metrics, and launch blockers.
  - Evidence: updated README, docs index, and repo audit to point at the plan and keep support tooling classified as incomplete.
- [x] 2026-06-02 20:56:23 +08:00 P2-OPS-003 建立核心 CI 驗證 workflow。
  - Completed: 2026-06-02 20:56:23 +08:00
  - Evidence: added `.github/workflows/verify.yml` for pull requests and pushes to `main`/`master`.
  - Evidence: CI starts PostgreSQL on assigned host port `37432`, installs frontend dependencies, runs frontend build/lint, backend migrations, Rust fmt/clippy/tests, backend content publish check, content/asset checker, and secret scan.
  - Evidence: README, deployment plan, and repo audit now distinguish core CI from the still-missing production deployment/CD pipeline.

## Release Gates

- [x] 2026-06-01 10:05:19 +08:00 Gate 0 No Mock / Port Safe：port migration 完成，沒有舊 port 啟動風險，主要功能不以 mock 冒充完成。
  - Completed: 2026-06-02 14:36:56 +08:00
  - Evidence: assigned FutureLight ports are enforced, old fallback ports were removed from runtime defaults, no frontend/backend listeners remained after verification cleanup, and `tools/verify-delivery.ps1` passed.
- [x] 2026-06-01 10:05:19 +08:00 Gate 1 Data Flow Complete：PostgreSQL migration、Rust API、React pages 形成真實資料流。
  - Completed: 2026-06-02 14:36:56 +08:00
  - Evidence: PostgreSQL migrations, Rust API routes/services/repositories, and React pages now drive auth, children, courses, lessons, activities, attempts, progress, rewards, consent, export, and deletion flows through persisted data.
- [x] 2026-06-01 10:05:19 +08:00 Gate 2 Child Learning Alpha：孩子可從登入到完成一節課，進度與獎勵真實保存。
  - Completed: 2026-06-02 14:36:56 +08:00
  - Evidence: Playwright E2E covers parent signup/login, child profile, consent, lesson start, correct attempt, reward, session completion, practice flow, and parent progress visibility.
- [x] 2026-06-01 10:05:19 +08:00 Gate 3 Parent Trust Ready：家長中心、同意、資料匯出、刪除、音量/麥克風控制可用。
  - Completed: 2026-06-02 14:36:56 +08:00
  - Evidence: parent center supports parent gate protected settings, child management, consent revoke, data export request, child data deletion, sound preferences, and persisted parent settings.
- [ ] 2026-06-01 10:05:19 +08:00 Gate 4 Content Pipeline Ready：內容管理、asset checker、content checker、AI 素材審核可用。
  - Blocked: 2026-06-02 14:36:56 +08:00 Seedance short-animation generation remains blocked by missing RunComfy auth/CLI, so the final video asset pipeline is not fully ready.
- [ ] 2026-06-01 10:05:19 +08:00 Gate 5 Privacy / Store Ready：COPPA/GDPR/UK Children’s Code、Apple/Google 申報資料完成。
  - Remaining: 2026-06-02 14:53:49 +08:00 Draft privacy/store documents, local export package, parent account deletion, and local DB retention cleanup exist, but production privacy/support URLs, final legal review, store screenshots/native assets, public deletion/support page, production retention scheduling, backup deletion propagation, and production export delivery/status tracking are still required before launch readiness.
  - Progress: 2026-06-02 21:14:00 +08:00 Added `docs/privacy-policy-draft.md`, `docs/direct-parent-notice-draft.md`, `docs/privacy-choices-and-deletion-page-draft.md`, and `docs/reviewer-account-runbook.md` so privacy/store review has concrete draft artifacts instead of placeholder blockers.
  - Still blocked: 2026-06-02 21:14:00 +08:00 Public hosting URL, legal review, production/staging reviewer accounts, native app package/permissions, final screenshots, final store console submission, production retention scheduling, backup deletion propagation, and production export delivery/status tracking remain incomplete.
  - Progress: 2026-06-02 21:34:00 +08:00 Implemented real local DB retention cleanup command `cargo run -- retention-cleanup` with integration coverage for expired sessions, old revoked consent evidence minimization, and old detached audit log deletion.
  - Still blocked: 2026-06-02 21:34:00 +08:00 Public hosting URL, legal review, production/staging reviewer accounts, native app package/permissions, final screenshots, final store console submission, production retention scheduling, backup deletion propagation, and production export delivery/status tracking remain incomplete.
  - Progress: 2026-06-02 22:02:00 +08:00 Added real `data_export_requests` PostgreSQL tracking, `GET /api/privacy/data-export-requests`, export response request metadata, frontend recent export status display, and integration coverage.
  - Still blocked: 2026-06-02 22:02:00 +08:00 Public hosting URL, legal review, production/staging reviewer accounts, native app package/permissions, final screenshots, final store console submission, production retention scheduling, backup deletion propagation, off-box production export delivery, and support visibility remain incomplete.
- [ ] 2026-06-01 10:05:19 +08:00 Gate 6 Launch Ready：staging/production、監控、備份、客服、營運儀表板與回滾流程完成。
  - Remaining: 2026-06-02 20:56:23 +08:00 Deployment and support plans plus core CI exist, but staging/production hosting, production deployment/CD, monitoring, backup/restore drill, rollback runbook execution, and support tooling are not implemented yet.

## Superseded Todo Files

- `2026-06-01_08-05-36-project-roadmap.md`：只規劃 basic runnable，已廢止。
- `2026-06-01_08-10-55-product-launch-roadmap.md`：已被本檔重編；保留研究與歷史上下文，不再作為執行主線。
