# 首頁 Database

## 主要資料表

- `users`：家長或管理員帳號。
- `children`：孩子資料。
- `courses`：課程。
- `course_units`：課程單元。
- `learning_progress`：孩子學習進度。
- `reward_events`：獎勵事件。

## 查詢需求

- 取得目前家長底下的孩子清單。
- 取得孩子最近未完成單元。
- 取得孩子今日推薦課程。
- 彙整孩子完成單元數與連續學習天數。

## 索引建議

- `children.user_id`
- `learning_progress.child_id`
- `learning_progress.updated_at`
- `reward_events.child_id`
