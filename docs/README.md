# 小孩語言學習網站文件

這個 `/docs` 目錄以「使用者會看到的頁面」作為主要分類。每個資料夾代表一個頁面或一組高度相關的頁面，方便前端 React、後端 Rust、資料庫 PostgreSQL 在討論需求時對齊同一個畫面。

## 頁面文件分類

- `01-首頁`：網站入口、推薦內容、快速開始學習。
- `02-登入與註冊`：帳號建立、登入、家長驗證、忘記密碼。
- `03-孩子資料`：孩子個人檔案、年齡、語言程度、學習偏好。
- `04-課程探索`：語言課程列表、主題分類、程度篩選。
- `05-課程詳情`：單一課程介紹、單元列表、學習目標。
- `06-學習播放`：故事、單字、發音、聽力、跟讀等主要學習體驗。
- `07-練習遊戲`：配對、選擇題、拼字、語音互動等練習活動。
- `08-學習進度`：完成度、連續學習天數、能力成長、弱點提示。
- `09-獎勵成就`：徽章、星星、任務、鼓勵回饋。
- `10-家長中心`：家長查看孩子狀態、設定學習目標、管理孩子帳號。
- `11-內容管理`：管理員維護課程、單字、故事、音檔、題目。
- `12-系統設定`：語言、通知、隱私、安全與帳號設定。

## 每個頁面資料夾建議內容

每個頁面資料夾可以依需要逐步補上：

- `README.md`：頁面目的、主要使用者、入口與出口。
- `features.md`：頁面功能、規則、資料需求與邊界情境。
- `flow.md`：頁面操作流程圖，必須包含頁面虛線圖、按鈕與操作表、Mermaid 流程圖、正確性檢查。
- `ui.md`：畫面區塊、互動狀態、錯誤狀態、響應式需求。
- `api.md`：前端需要的 Rust API、request/response、錯誤碼。
- `database.md`：PostgreSQL 資料表、欄位、索引、關聯。
- `acceptance.md`：驗收條件與測試情境。

## 流程審核

操作流程圖完成後，需重複審核頁面之間是否能正確串接：

- `流程審核.md`：彙整所有頁面的入口、出口、功能資料一致性與待實作檢查項目。
- `音效規劃.md`：定義全站音效原則、音量、資源格式、播放規則、設定與實作方向。
- `互動導向規劃.md`：集中管理按鈕會到哪個頁面、連續交互流程、換頁動畫與點選音效。
- `研究依據與設計準則.md`：整理 Google、W3C、NN/g、兒童互動研究與 GitHub 教育設計系統參考，作為介面與互動決策依據。
- `外掛使用規劃.md`：整理 Browser、imagegen、verified-delivery、文件/試算表能力與 FutureLight 自訂外掛。
- `AI協作製作流程.md`：整理 Codex、Image2.0、Seedance、Remotion、Suno 的製作分工與素材落地流程。
- `RunComfy執行方案.md`：定義 Windows 開發環境中用 Docker 執行 Seedance / Image2.0 的方式。
- `產品上線規劃.md`：定義 FutureLight 必須做到可上線產品，而不是基本可跑 demo。
- `競品研究蒐集.md`：整理 GitHub、Google Search、X/Twitter、App Store、Google Play 與官方政策的研究結論。
- `環境與Port規劃.md`：定義 FutureLight 必須遵守的 port 分配，避免任意啟動舊 port。
- `產品需求PRD.md`：把可上線產品拆成角色、頁面、API、資料模型、隱私、安全、商業化與上線指標。
- `交付完成標準.md`：定義 no-mock 完成標準、PR/交付檢查、真實功能驗收證據。
- `交付驗證命令清單.md`：定義每次交付必跑命令，包含 port policy、migration、Rust fmt/clippy/test、frontend build/lint、content/asset checker、secret scan。
- `art-bible.md`：定義 FutureLight 視覺規範，包含角色比例、色彩、插畫風格、禁用元素、年齡層差異與圖卡版型。
- `競品矩陣.md`：把 Lingokids、Studycat、Khan Academy Kids、Duolingo ABC、開源 SRS / 語言學習專案轉成產品決策。
- `國際市場研究-德英美.md`：補齊德國、英國、美國的兒童法規、競品、口音、商店上架與產品落地差異。
- `法規與上架檢查.md`：整理 Apple Kids Category、Google Play Families、COPPA、Data Safety、SDK inventory 與上架 blocker。
- `store-metadata-draft.md`：整理 App Store Connect / Google Play Console metadata、age rating、privacy label、Data Safety、Families/Kids review notes 草稿。
- `store-listing-copy-de-uk-us.md`：整理德國、英國、美國 store listing 文案、定位、隱私承諾、截圖與 feature graphic 需求。
- `security-baseline.md`: documents the implemented local backend security baseline for CORS, Origin guard, rate limiting, password/token handling, SQL query safety, and request validation.
- `deployment-plan.md`: documents the planned staging/production topology, runtime config, release flow, backup/restore, monitoring, rollback, and launch blockers.
- `operations-support-plan.md`: documents planned support channels, privacy/support request triage, refunds, content reports, review rejection handling, escalations, and support metrics.
- `技術落地藍圖.md`：定義 React、Rust、PostgreSQL、AI 素材管線、測試、CI/CD、部署與 port migration 落地順序。

## 功能設計閱讀順序

建議先從使用者最核心的學習流程開始閱讀：

1. `01-首頁/features.md`
2. `03-孩子資料/features.md`
3. `04-課程探索/features.md`
4. `05-課程詳情/features.md`
5. `06-學習播放/features.md`
6. `07-練習遊戲/features.md`
7. `08-學習進度/features.md`
8. `09-獎勵成就/features.md`
9. `10-家長中心/features.md`
10. `02-登入與註冊/features.md`
11. `11-內容管理/features.md`
12. `12-系統設定/features.md`

閱讀完功能設計後，接著看同資料夾的 `flow.md`，確認畫面上的按鈕、使用者操作、頁面導向與功能規則一致。
