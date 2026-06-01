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

- [ ] 2026-06-01 10:05:19 +08:00 P0-BLOCKER-001 遷移所有本機 port 設定到 registry 指定值：frontend `37173`、API `37200`、PostgreSQL `37432`。
  - 驗收：`frontend/vite.config.ts`、backend env/default、`docker-compose.yml`、`.env.example`、README 全部一致。
  - 驗收：Vite 使用 `strictPort: true` 或等效嚴格模式。
  - 驗收：啟動前跑 workspace port policy check；未完成前不得啟動服務。
- [ ] 2026-06-01 10:05:19 +08:00 P0-BLOCKER-002 建立 no-mock enforcement checklist，放進 PR/交付檢查流程。
  - 驗收：前端頁面、Rust API、DB、AI 素材、音效、影片、瀏覽器驗證都列出「不可接受 mock」條件。
  - 驗收：若功能未完成，UI 必須 disabled / coming soon / blocked，不可假成功。
- [ ] 2026-06-01 10:05:19 +08:00 P0-BLOCKER-003 建立 repo 現況審計表。
  - 驗收：列出目前 React/Rust/PostgreSQL/asset/content 的真實完成度。
  - 驗收：列出所有硬編資料、固定 JSON、未接 API 按鈕、缺檔素材、缺測試項。
- [ ] 2026-06-01 10:05:19 +08:00 P0-BLOCKER-004 修正 README 啟動說明，避免任何 agent 依舊 port 啟動。
  - 驗收：README 只保留遷移後指令；歷史 port 僅列為禁止事項。

## Phase 1：資料層與後端真實 API

- [ ] 2026-06-01 10:05:19 +08:00 P0-BACKEND-001 建立 PostgreSQL migration 系統。
  - 驗收：可從空 DB 重建 schema。
  - 驗收：至少包含 users、children、courses、lessons、activities、attempts、progress、rewards、assets、consents、audit_logs。
- [ ] 2026-06-01 10:05:19 +08:00 P0-BACKEND-002 建立 Rust API 分層。
  - 驗收：route、service、repository、domain model、error model、request validation 分離。
  - 驗收：API 不回固定 JSON 當完成。
- [ ] 2026-06-01 10:05:19 +08:00 P0-BACKEND-003 完成 auth 與 parent account API。
  - 驗收：家長註冊、登入、登出、目前使用者、密碼重設或可替代安全流程。
  - 驗收：密碼 hash、token/session、輸入驗證、錯誤格式完整。
- [ ] 2026-06-01 10:05:19 +08:00 P0-BACKEND-004 完成 child profile API。
  - 驗收：建立/編輯/刪除/查詢孩子資料。
  - 驗收：孩子資料只能由所屬家長讀寫。
  - 驗收：支援 age_band、market_region、english_variant。
- [ ] 2026-06-01 10:05:19 +08:00 P0-BACKEND-005 完成 course / lesson / activity API。
  - 驗收：課程、單元、步驟、題目從 PostgreSQL 讀取。
  - 驗收：支援 published 狀態、年齡層、主題、語言變體、地區可用標記。
- [ ] 2026-06-01 10:05:19 +08:00 P0-BACKEND-006 完成 learning session、attempt、progress API。
  - 驗收：開始課程、完成步驟、提交答案、記錄音檔播放、更新 mastery/progress。
  - 驗收：中途離開可恢復第一個未完成步驟。
- [ ] 2026-06-01 10:05:19 +08:00 P0-BACKEND-007 完成 consent / privacy / data deletion API。
  - 驗收：家長同意、撤回同意、資料匯出請求、刪除孩子資料。
  - 驗收：寫入 audit_logs。
- [ ] 2026-06-01 10:05:19 +08:00 P0-BACKEND-008 建立 backend integration tests。
  - 驗收：auth、children、courses、progress、consent、delete child 至少有成功與拒絕案例。

## Phase 2：React 真實頁面與流程

- [ ] 2026-06-01 10:05:19 +08:00 P0-FRONTEND-001 建立 React route 架構。
  - 驗收：所有主要頁面有真實 URL、browser back、未登入導向、角色保護。
- [ ] 2026-06-01 10:05:19 +08:00 P0-FRONTEND-002 完成登入/註冊頁。
  - 驗收：表單接真實 auth API；錯誤、loading、成功導向完整。
- [ ] 2026-06-01 10:05:19 +08:00 P0-FRONTEND-003 完成首頁與孩子選擇。
  - 驗收：孩子列表、繼續學習、今日複習、課程探索、家長中心入口都接 API。
- [ ] 2026-06-01 10:05:19 +08:00 P0-FRONTEND-004 完成 onboarding：市場、年齡層、英式/美式英文、家長同意入口。
  - 驗收：DE/UK/US/TW/OTHER 會存入後端；不同地區觸發不同同意需求。
- [ ] 2026-06-01 10:05:19 +08:00 P0-FRONTEND-005 完成課程探索與課程詳情。
  - 驗收：篩選、課程卡、單元列表、開始/繼續學習全部接 API。
- [ ] 2026-06-01 10:05:19 +08:00 P0-FRONTEND-006 完成學習播放。
  - 驗收：圖卡、教學語音、字幕、跟讀入口、完成步驟、離開保存進度都接真實 API。
  - 驗收：按鈕導向與 `docs/互動導向規劃.md`、各頁 `flow.md` 一致。
- [ ] 2026-06-01 10:05:19 +08:00 P0-FRONTEND-007 完成練習遊戲第一版。
  - 驗收：配對、聽音選圖、拼字或拖放排序至少一種真實題型；答題寫入 attempts。
- [ ] 2026-06-01 10:05:19 +08:00 P0-FRONTEND-008 完成學習進度與獎勵。
  - 驗收：掌握度、弱點、連續天數、星星、徽章由 progress/rewards API 取得。
- [ ] 2026-06-01 10:05:19 +08:00 P0-FRONTEND-009 完成家長中心第一版。
  - 驗收：孩子列表、學習摘要、設定、資料匯出、刪除孩子資料、撤回同意可操作。
- [ ] 2026-06-01 10:05:19 +08:00 P0-FRONTEND-010 完成家長閘門。
  - 驗收：購買、外部連結、資料刪除、內容管理、系統設定等成人操作前必經 gate。

## Phase 3：內容、音效、AI 素材與管理後台

- [ ] 2026-06-01 10:05:19 +08:00 P1-CONTENT-001 建立第一批真實課程資料。
  - 驗收：動物、顏色、數字、家人、食物、日常問候至少各有課程、單元、活動、題目。
  - 驗收：資料進 PostgreSQL 或可匯入 migration/seed，不只在前端硬編。
- [ ] 2026-06-01 10:05:19 +08:00 P1-CONTENT-002 建立 content checker 必過規則。
  - 驗收：缺單元、缺步驟、缺答案、缺素材、未審核 AI 素材不可發布。
- [ ] 2026-06-01 10:05:19 +08:00 P1-ASSET-001 補齊 UI 音效真實檔案。
  - 驗收：`ui_click`、`ui_toggle`、`ui_error_soft`、`learning_step_complete`、`learning_unit_complete`、`answer_correct`、`answer_wrong_soft`、`reward_star`、`reward_badge`、`mission_complete`、`page_success` 都有檔案與 manifest。
- [ ] 2026-06-01 10:05:19 +08:00 P1-ASSET-002 建立 SoundProvider 與音量設定。
  - 驗收：音效開關、教學語音音量、UI 音效音量、自動播放設定接 DB/API。
- [ ] 2026-06-01 10:05:19 +08:00 P1-ASSET-003 建立 art bible。
  - 驗收：角色比例、色彩、插畫風格、禁用元素、年齡層差異、圖卡版型。
- [ ] 2026-06-01 10:05:19 +08:00 P1-ASSET-004 使用 Image2.0 / imagegen 產出第一批真實圖片。
  - 驗收：課程封面、單字卡、徽章、角色表情放入 `assets/images` 並更新 manifest。
  - 驗收：每個 AI 素材記錄 prompt、模型、日期、用途、授權狀態、審核者。
- [ ] 2026-06-01 10:05:19 +08:00 P1-ASSET-005 使用 Seedance 產出第一批真實短動畫。
  - 驗收：4-15 秒影片放入 `assets/video/generated`；更新 manifest；記錄 RunComfy request 或 blocker。
- [ ] 2026-06-01 10:05:19 +08:00 P1-VIDEO-001 建立 Remotion / HyperFrames 模板。
  - 驗收：課程 intro、單字複習、家長週報、社群短片至少各有可 render 或可預覽 composition。
- [ ] 2026-06-01 10:05:19 +08:00 P1-CMS-001 建立內容管理後台。
  - 驗收：課程 CRUD、單元 CRUD、活動 CRUD、素材選取、發布前檢查、版本紀錄。

## Phase 4：法規、國際化與商店準備

- [ ] 2026-06-01 10:05:19 +08:00 P0-LEGAL-001 完成兒童隱私資料地圖。
  - 驗收：每個資料欄位列出來源、用途、保存、是否兒童資料、同意需求、刪除方式。
- [ ] 2026-06-01 10:05:19 +08:00 P0-LEGAL-002 完成 COPPA / GDPR Article 8 / UK Children's Code checklist。
  - 驗收：DE 16 歲以下、US 13 歲以下、UK high privacy default 都有產品與資料邏輯。
- [ ] 2026-06-01 10:05:19 +08:00 P0-LEGAL-003 完成 SDK inventory。
  - 驗收：每個 SDK 是否進孩子區、收集資料、第三方分享、Apple Kids / Google Families 可用性都有決策。
- [ ] 2026-06-01 10:05:19 +08:00 P1-I18N-001 完成 `market_region` 與 `english_variant` 前後端落地。
  - 驗收：DE/UK/US/TW/OTHER 地區流程、American/British English 素材選擇可運作。
- [ ] 2026-06-01 10:05:19 +08:00 P1-STORE-001 建立 App Store / Google Play metadata 草稿。
  - 驗收：age rating、privacy nutrition labels、Data Safety、Families policy、審核備註、測試帳號準備。
- [ ] 2026-06-01 10:05:19 +08:00 P1-STORE-002 建立 DE/UK/US 商店文案與截圖需求。
  - 驗收：德文、英式英文、美式英文的定位、隱私承諾、口音差異、家長信任文案分開。

## Phase 5：品質、安全、上線

- [ ] 2026-06-01 10:05:19 +08:00 P0-QA-001 建立每次交付必跑命令清單。
  - 驗收：frontend build、Rust fmt/clippy/test、migration check、asset checker、content checker、secret scan。
- [ ] 2026-06-01 10:05:19 +08:00 P1-QA-002 建立 Playwright E2E。
  - 驗收：新家長註冊、建立孩子、開始課程、完成活動、家長查看進度、刪除孩子資料。
- [ ] 2026-06-01 10:05:19 +08:00 P1-QA-003 建立 browser visual smoke。
  - 驗收：桌面與手機 viewport 截圖；確認文字不重疊、按鈕可點、主要流程可走。
- [ ] 2026-06-01 10:05:19 +08:00 P1-SECURITY-001 建立安全基線。
  - 驗收：rate limit、CORS、CSRF/同源策略、SQL injection 防護、password/token 儲存、輸入驗證。
- [ ] 2026-06-01 10:05:19 +08:00 P2-OPS-001 建立 staging / production deployment plan。
  - 驗收：frontend CDN/PWA、Rust API、managed PostgreSQL、object storage、backup、monitoring、rollback。
- [ ] 2026-06-01 10:05:19 +08:00 P2-OPS-002 建立營運與客服流程。
  - 驗收：資料刪除請求、退款、內容錯誤回報、審核拒絕處理、家長問題回覆。

## Release Gates

- [ ] 2026-06-01 10:05:19 +08:00 Gate 0 No Mock / Port Safe：port migration 完成，沒有舊 port 啟動風險，主要功能不以 mock 冒充完成。
- [ ] 2026-06-01 10:05:19 +08:00 Gate 1 Data Flow Complete：PostgreSQL migration、Rust API、React pages 形成真實資料流。
- [ ] 2026-06-01 10:05:19 +08:00 Gate 2 Child Learning Alpha：孩子可從登入到完成一節課，進度與獎勵真實保存。
- [ ] 2026-06-01 10:05:19 +08:00 Gate 3 Parent Trust Ready：家長中心、同意、資料匯出、刪除、音量/麥克風控制可用。
- [ ] 2026-06-01 10:05:19 +08:00 Gate 4 Content Pipeline Ready：內容管理、asset checker、content checker、AI 素材審核可用。
- [ ] 2026-06-01 10:05:19 +08:00 Gate 5 Privacy / Store Ready：COPPA/GDPR/UK Children’s Code、Apple/Google 申報資料完成。
- [ ] 2026-06-01 10:05:19 +08:00 Gate 6 Launch Ready：staging/production、監控、備份、客服、營運儀表板與回滾流程完成。

## Superseded Todo Files

- `2026-06-01_08-05-36-project-roadmap.md`：只規劃 basic runnable，已廢止。
- `2026-06-01_08-10-55-product-launch-roadmap.md`：已被本檔重編；保留研究與歷史上下文，不再作為執行主線。
