# 首頁 API

## 需要的 API

### GET /api/me

取得目前登入使用者。

### GET /api/children/current

取得目前選取的孩子資料。

### GET /api/home/summary

取得首頁摘要。

回傳內容：

- 今日推薦課程。
- 最近未完成單元。
- 學習進度摘要。
- 獎勵摘要。

### POST /api/children/current

切換目前使用中的孩子。

## 權限

- 未登入只能取得公開首頁內容。
- 已登入家長只能讀取自己孩子的資料。
