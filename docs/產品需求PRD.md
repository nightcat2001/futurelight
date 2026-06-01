# FutureLight 產品需求 PRD

Created: 2026-06-01 08:32:25 +08:00

本 PRD 的範圍是「可上線產品」，不是 MVP demo。FutureLight 必須能被家長信任、被 Apple / Google 審核、被孩子長期使用、被內容團隊持續維護。

## 1. 產品目標

FutureLight 是兒童語言學習平台。第一版目標是讓 3-11 歲孩子透過故事、圖像、聲音、跟讀與遊戲化練習建立英文基礎，並讓家長能安心掌握學習狀態。

### 1.1 非目標

- 不做只有首頁與硬編假資料的 demo。
- 不做讓孩子直接接觸購買、外部連結、廣告或社群互動的產品。
- 不做無審核的 AI 內容自動發布。
- 不用本機舊 common ports 作為正式啟動方案。

## 2. 使用者與場景

| 角色 | 年齡 / 身份 | 主要需求 | 成功條件 |
| --- | --- | --- | --- |
| 幼兒孩子 | 3-5 | 看圖、聽音、點選、跟讀短詞 | 不讀長文也能完成一節課 |
| 低年級孩子 | 6-8 | 單字、短句、配對、聽力、拼字 | 能理解進度與獎勵 |
| 高年級孩子 | 9-11 | 句型、故事、口說、複習 | 能看到自我進步 |
| 家長 | 成人 | 安全、無廣告、進度、時間控制、資料權利 | 能設定、查看、刪除、匯出 |
| 內容管理者 | 內部 | 快速新增課程與素材，發布前檢查 | 能避免缺圖、缺音、錯字、未審核素材 |
| 審核者 | 內部 / 商店 | 檢查隱私、內容、年齡分級、付款 | 能拿到測試帳號、流程說明、政策對照 |

## 3. 第一版功能範圍

### 3.1 兒童端

| 頁面 | 必備功能 | 上線驗收 |
| --- | --- | --- |
| 首頁 | 選孩子、繼續學習、今日複習、課程探索、獎勵入口 | 不登入時導向登入；孩子能一鍵回到未完成課 |
| 課程探索 | 主題、程度、年齡、課程卡、離線狀態 | 可依年齡與主題篩選；卡片顯示學習目標 |
| 課程詳情 | 目標詞彙、句型、單元、預估時間、開始/繼續 | 開始後建立學習 session |
| 學習播放 | 圖卡、教學語音、跟讀、字幕、下一步、暫停 | 每 30-60 秒有互動；離開保留進度 |
| 練習遊戲 | 配對、聽音選圖、拼字、口說模仿 | 答題事件寫入後端；答錯有安全回饋 |
| 進度 | 詞彙掌握、弱點、連續天數、今日任務 | 進度來自真實 attempt / progress |
| 獎勵 | 星星、徽章、貼紙簿、完成動畫 | 不連到購買；不造成付費壓力 |

### 3.2 家長端

| 模組 | 必備功能 | 上線驗收 |
| --- | --- | --- |
| 家長中心 | 孩子列表、學習時間、進度摘要、弱點 | 家長可理解孩子在學什麼 |
| 家長閘門 | 進入設定、購買、外部連結、資料操作前驗證 | 孩子不能直接進成人區 |
| 資料權利 | 匯出資料、刪除孩子資料、撤回同意 | 操作有 audit log |
| 學習設定 | 每日時間、難度、音量、字幕、麥克風、離線下載 | 設定會影響兒童端 |
| 訂閱 | plan、trial、receipt、取消說明 | 只在家長區出現 |

### 3.3 內容管理端

| 模組 | 必備功能 | 上線驗收 |
| --- | --- | --- |
| 課程管理 | 課程 CRUD、狀態 draft/review/published/archived | 只有 published 可被孩子看到 |
| 單元管理 | steps、activity、voice、image、video | 缺素材不可發布 |
| 題庫 | 題型、答案、干擾選項、難度 | 題目可版本化 |
| 素材庫 | 圖片、音效、影片、prompt、授權 | AI 素材需人工審核 |
| 發布檢查 | assets checker、content checker、policy checklist | 任一 blocker 不可發布 |

## 4. 課程與學習設計

第一版課程包：

| 課程 | 詞彙 | 句型 | 活動 |
| --- | --- | --- | --- |
| 動物英文 | cat, dog, bird, fish, rabbit | I see a cat. | 圖卡、聽音選圖、配對 |
| 顏色英文 | red, blue, yellow, green, purple | It is red. | 顏色辨識、聽音、拼字 |
| 數字英文 | one-ten | I have two. | 數量點選、聽力 |
| 家人英文 | mom, dad, sister, brother | This is my mom. | 家庭圖卡、短句 |
| 食物英文 | apple, milk, bread, rice | I like apples. | 喜好句型、配對 |
| 日常問候 | hello, goodbye, thank you | Hello, I am... | 角色對話、跟讀 |

學習演算法：

- 每題 attempt 記錄：correct、response_time_ms、hint_used、audio_replayed、pronunciation_score。
- 每個詞彙維護 mastery_score 0-100。
- SRS 排程依正確率、回應時間、提示使用與上次複習時間決定。
- 低掌握詞彙進入今日複習。
- 每節課最多 8-12 分鐘，避免兒童疲勞。

## 5. 核心資料模型

必備資料表：

- `users`
- `parent_profiles`
- `children`
- `parent_child_links`
- `consents`
- `courses`
- `course_units`
- `lesson_steps`
- `activities`
- `activity_options`
- `assets`
- `asset_reviews`
- `learning_sessions`
- `attempts`
- `word_mastery`
- `review_queue`
- `rewards`
- `child_rewards`
- `subscriptions`
- `audit_logs`
- `data_export_requests`
- `deletion_requests`

## 6. API 範圍

### 兒童學習 API

- `GET /api/children`
- `GET /api/home/summary?child_id=...`
- `GET /api/courses`
- `GET /api/courses/{course_id}`
- `POST /api/learning-sessions`
- `GET /api/learning-sessions/{session_id}/next-step`
- `POST /api/attempts`
- `GET /api/review-queue?child_id=...`
- `GET /api/rewards?child_id=...`

### 家長 API

- `POST /api/parent-gate/verify`
- `GET /api/parent/children/{child_id}/progress`
- `PATCH /api/parent/children/{child_id}/settings`
- `POST /api/parent/consents`
- `DELETE /api/parent/children/{child_id}`
- `POST /api/parent/data-export`

### 內容管理 API

- `POST /api/admin/courses`
- `PATCH /api/admin/courses/{course_id}`
- `POST /api/admin/courses/{course_id}/submit-review`
- `POST /api/admin/courses/{course_id}/publish`
- `POST /api/admin/assets`
- `PATCH /api/admin/assets/{asset_id}/review`
- `GET /api/admin/publish-checks/{course_id}`

## 7. 隱私與安全需求

- 兒童區不載入行為廣告 SDK。
- 兒童區不傳送 advertising ID、精準位置、裝置序號、聯絡人、電話號碼。
- 麥克風權限只在口說活動中請求，且需家長設定允許。
- 兒童錄音預設只短期保存；若要保存做進度回顧，需家長同意。
- 所有敏感操作寫入 `audit_logs`。
- 資料刪除要能刪除孩子 profile、learning sessions、attempts、voice recordings、derived progress。

## 8. 商業化

第一版可選模式：

- 免費試用：有限課程與孩子數。
- 月訂閱 / 年訂閱：解鎖課程、離線包、進階家長報告。
- 家庭方案：最多 4 個孩子。

規則：

- 購買入口只在家長區。
- 兒童區不可用倒數、焦慮、失去獎勵等方式逼迫付費。
- iOS 使用 In-App Purchase；Android 使用 Play Billing；Web 使用 Stripe。
- 後端需有 entitlement，不能只靠前端判斷。

## 9. 上線指標

| 指標 | 目標 |
| --- | --- |
| D1 retention | >= 25% |
| 第一節課完成率 | >= 70% |
| 今日複習完成率 | >= 50% |
| 家長中心首次查看率 | >= 40% |
| 課程 crash-free sessions | >= 99.5% |
| 兒童區外部連結事件 | 0 |
| 未審核素材上線 | 0 |

## 10. 必須阻擋上線的問題

- 家長可刪除資料但後端實際未刪。
- 課程可發布但缺音檔或圖片。
- 孩子可以進入付款或外部連結。
- App Store / Google Play 申報與實際 SDK 不一致。
- API 直接暴露孩子個資。
- 沒有 staging 與 production 分離。
- 沒有備份與 restore 演練。
