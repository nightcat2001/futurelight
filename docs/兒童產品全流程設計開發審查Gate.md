# 兒童產品全流程設計、開發、審查 Gate

本文件是 FutureLight 0-6 歲兒童教育產品的強制執行規範。它適用於產品規劃、UX/UI 設計、Figma 輸出、H5、Android、Frontend、Backend、API、Database、QA、Regression、Release、Production Readiness。

核心原則：

```text
不得因為程式可執行、compile 成功、node --check 成功，就宣稱設計或產品完成。
```

Figma 是最後輸出，不是第一層 QA，也不是用來補洞的地方。

## 1. 必須先載入的能力

開始任何設計、開發或審查前，必須先套用以下能力：

- Product Discovery
- Product Manager
- User Story
- User Journey
- Jobs To Be Done
- Information Architecture
- Sitemap Planning
- Requirement Traceability
- Acceptance Criteria
- Edge Case Analysis
- 0-6 歲兒童認知與理解能力
- 家長使用情境
- UX Research
- UX Flow
- UX Writing
- Interaction Design
- Mobile UX
- Android UX
- H5 Responsive Design
- Design System
- Component Architecture
- Visual Hierarchy
- Typography
- Spacing
- Color System
- Motion Design
- Accessibility
- Nielsen Heuristics
- Material Design
- Apple Human Interface Guidelines
- Frontend Architecture
- Backend Architecture
- API Design
- Database
- Cache
- Cron
- Performance
- Security
- Code Review
- Unit Test
- Integration Test
- E2E Test
- Regression Test
- Visual Regression Test
- Accessibility Test
- Responsive Test
- Root Cause Analysis
- Coverage Analysis
- Production Readiness Review

## 2. 禁止直接產生 Figma

在以下內容完成前，禁止產生或更新任何 Figma Frame：

- Project Audit
- Sitemap
- Navigation
- User Journey
- User Flow
- Task Flow
- Page Specs
- Design System
- Local Validation
- PM Review
- UX Review
- UI Review
- Child Safety Review
- Accessibility Review
- Responsive Review
- Content Review

Figma 只能作為通過驗證後的輸出結果。

## 3. 必須先做 Project Audit

開始前必須檢查：

- 現有產品規格
- Sitemap
- Page Specs
- JSON / Structured Data
- Figma Plugin
- Renderer
- Components
- Existing Figma output
- API
- Database schema
- Tests
- README / Handoff docs
- Design System

Audit 必須回答：

- 哪些已存在
- 哪些缺失
- 哪些重複
- 哪些是 placeholder
- 哪些是 generic content
- 哪些沒有 child safety 證據
- 哪些沒有 UX / PM / Accessibility 證據

## 4. 每一頁必須有完整 Page Spec

每個 Page Spec 必須包含：

- Page ID
- Page Name
- Route 或 Figma-only 狀態
- Actor
- Audience
- Age Band 或 Adult Role
- Business Goal
- User Goal
- User Pain / Need
- Sitemap Location
- Navigation Entry / Exit
- User Journey Position
- User Flow
- Task Flow
- Information Architecture Role
- Layout Type
- Component Tree
- Primary CTA
- Secondary CTA
- Copywriting
- Illustration / Visual Asset Description
- Data Source
- API Dependency
- Route Dependency
- Default State
- Loading State
- Empty State
- Error State
- Success State
- Disabled State
- Offline / Retry / Permission State
- Interaction Behavior
- Animation Behavior
- Accessibility Requirements
- Responsive Requirements for H5 and Android
- Child Safety Requirements
- Parent Control Requirements
- Acceptance Criteria
- Test Case IDs

如果某欄位不適用，必須明確寫 `not applicable` 並說明原因。空值視為 Fail。

## 5. 兒童與家長必須分開設計

0-6 歲不是單一使用者。

必須分開處理：

- 0-2 歲：圖片、聲音、動作優先；不能要求閱讀。
- 3-4 歲：簡單選擇、重複、具體圖像、短任務。
- 5-6 歲：可加入短文字，但仍需圖片和語音輔助。
- 家長：需要信任、控制、設定、隱私、進度、支援、刪除、匯出。

禁止：

- 讓 2 歲兒童閱讀
- 把家長責任放進兒童 UI
- 用抽象 icon 讓兒童猜
- 把法律、隱私、帳號、刪除、付款、權限設定交給兒童

## 6. Design System Gate

設計系統必須定義並驗證：

- Typography Scale
- Spacing Scale
- Color System
- Contrast
- Icon Rules
- Illustration Rules
- Layout Grid
- Child-facing Components
- Parent-facing Components
- Android / H5 Responsive Behavior
- Navigation Components
- Modal
- Bottom Sheet
- Overlay
- Tab
- Toast
- Progress
- Player Controls
- Loading State
- Empty State
- Error State
- Success State
- Disabled State
- Focus State
- Pressed State
- Selected State

禁止所有頁面都使用相同的 Hero + Cards 模板。

## 7. Local Validation Pipeline

Figma 或 Production Ready 前，必須通過：

```text
Structured specs
-> Schema Validation
-> Content Validation
-> Coverage Validation
-> Duplicate Detection
-> Layout Similarity Detection
-> Accessibility Validation
-> Child Safety Validation
-> Component Validation
-> Business Logic Validation
-> Page Coverage Validation
-> State Coverage Validation
-> Interaction Validation
-> Animation Validation
-> Product Positioning Validation
-> Traceability Validation
-> Design QA
-> PM Review
-> UX Review
```

Validation 必須檢查：

- Content
- Design
- UX
- Accessibility
- Child Safety
- Layout
- Component
- Business Logic
- Page Coverage
- State Coverage
- Interaction
- Animation
- Product Positioning
- H5 / Android 行為
- Route / API / DB / Test Traceability

`node --check`、build、compile、typecheck、lint 只能作為 syntax smoke test，不能當成設計驗證。

## 8. Figma Output Gate

只有以下全部通過，才允許產生 Figma：

- Sitemap complete
- Navigation complete
- User Journey complete
- User Flow complete
- Task Flow complete
- Page Specs complete
- Design System complete
- Local Validation PASS
- Design QA PASS
- PM Review PASS
- UX Review PASS
- Child Safety Review PASS
- Accessibility Review PASS
- Responsive Review PASS
- Content Review PASS

追加硬規則：

- Layout similarity > 45% 必須 FAIL。
- SVG poster / catalog / long page list 不能算 Figma UI。
- 不能先做 79 頁廣撒式輸出；必須先完成 12 個核心 high-fidelity product screens，通過專業 UI/UX/PM/Child Safety review 後才可擴展。
- 每一頁必須是實際產品畫面，不是 Page Spec 卡片、Wireframe catalog、Screen list、Poster、或文字規格海報。
- 任何使用相同 renderer、相同 Hero + Cards、相同 CTA 結構，只換文字的頁面，都視為 template duplication。
- Validator 若只證明 JSON 完整、SVG 存在、Frame 數量正確、或程式無 syntax error，必須 FAIL。

每個 Figma Frame 必須能追溯到：

- Page ID
- Page Spec
- Route 或 Figma-only 狀態
- Audience
- Primary CTA
- Core State
- Responsive Target

禁止：

- 空白 Frame
- 重複 Frame
- 低品質 Frame
- Placeholder Frame
- Generic Frame
- 與兒童教育產品無關的 Frame
- 只為了增加頁數而產生 Frame
- SVG poster / screen catalog
- 79 頁一次性模板輸出

## 8.1 當前 79 頁輸出撤回規則

如果輸出符合以下任一條件，必須立刻撤回 PASS：

- 看起來是 79 個相似卡片模板。
- 不是產品 UI，而是一張頁面清單海報。
- Layout similarity 高於 45%。
- 大量頁面使用相同 renderer family。
- 沒有真實 app navigation。
- 沒有真實 child-facing / parent-facing UI 差異。
- 沒有每頁獨立 visual hierarchy。
- 沒有 loading / empty / error / success / offline 的畫面級設計。
- 沒有先完成 12 個核心 high-fidelity screens。

撤回後狀態必須是：

```text
DESIGN VALIDATION: FAIL
UI REVIEW: FAIL
UX REVIEW: FAIL
PRODUCT REVIEW: FAIL
CHILD PRODUCT REVIEW: FAIL
CONTENT REVIEW: FAIL
VISUAL DIFFERENTIATION: FAIL
PRODUCTION READY: NO
TASK COMPLETE: NO
```

## 9. Traceability

實作時必須建立追蹤鏈：

```text
Page ID
-> Figma Frame
-> Route
-> Component
-> API
-> Data Model
-> Test Case
```

禁止用假 UI 掩蓋缺少的 Backend、Database、Route、API 或 Test。

## 10. Bug 與 Root Cause

任何 Fail 或 Bug 必須記錄：

- Bug ID
- Symptom
- Affected Page / Module
- Expected Behavior
- Actual Behavior
- Reproduction Steps
- Root Cause
- Fix Strategy
- Affected Specs
- Affected Implementation
- Validation Method
- Regression Coverage

禁止只修畫面症狀而不查 Root Cause。

## 11. Required Test Matrix

依範圍執行：

- Page Coverage Test
- User Flow Coverage Test
- Requirement Traceability Test
- Content Safety Test
- Child Safety Test
- Schema Validation
- Duplicate Detection
- Layout Similarity Detection
- Placeholder Detection
- Generic Content Detection
- Unit Test
- Integration Test
- API Test
- Database Test
- Calculation Test
- Cron Test
- E2E Test
- Visual Regression Test
- Responsive Test
- Accessibility Test
- Performance Test
- Large Data Test
- Error Recovery Test
- Regression Test
- Production Smoke Test

每條 User Flow 必須覆蓋：

- Happy Path
- Failure Path
- Recovery Path
- Permission Path
- Network Failure Path

## 12. Validation FAIL 處理

Validation FAIL 時，禁止跳過，必須：

1. 列出失敗 Gate
2. 列出受影響頁面或模組
3. 找 Root Cause
4. 修正 Page Spec / Design System / Implementation
5. 重跑 Validation
6. 補 Regression
7. 更新 Bug / Coverage

禁止：

- 宣稱只是小問題
- 宣稱先產圖再修
- 宣稱 compile 成功所以可以過
- 把 Figma 當 QA
- 把 validation FAIL 當 warning 忽略

## 13. Production Ready Gate

Production Ready 只有在以下全部 PASS 才能是 `YES`：

- Page Specs complete
- 每頁有唯一目的與 Layout
- 無 Duplicate Page
- 無 Placeholder
- 無 Generic Content
- 無 unsafe child content
- 無 unrelated imagery
- Sitemap complete
- Navigation complete
- User Flow complete
- Task Flow complete
- Design System complete
- UI Review PASS
- UX Review PASS
- PM Review PASS
- Child Safety PASS
- Accessibility PASS
- Responsive PASS
- Content Review PASS
- API PASS
- Frontend PASS
- Backend PASS
- Database PASS
- Cron PASS where applicable
- Performance PASS
- Security PASS
- E2E PASS
- Regression PASS
- Visual Regression PASS
- Production Smoke Test PASS
- 無 unresolved Critical / High Bug
- 無 blocking Medium Bug
- Android 與 H5 Primary Flow 已驗證

只要任何一項缺少證據：

```text
Production Ready: NO
Task Complete: NO
```

## 14. 回報格式

每次回報必須包含：

```text
目前階段：
目前完成：
剩餘工作：
已驗證：
發現問題：
下一步：
TASK STATUS：
```

沒有證據不得宣稱完成。
