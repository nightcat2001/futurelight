# 學習進度 Database

## 主要資料表

- `learning_progress`
- `learning_events`
- `practice_answers`
- `practice_sessions`
- `courses`
- `course_units`

## 統計需求

- 計算單元完成數。
- 計算課程完成率。
- 計算連續學習天數。
- 根據答題結果產生能力分類統計。

## 索引建議

- `learning_progress.child_id`
- `learning_progress.course_id`
- `learning_events.child_id`
- `learning_events.created_at`
- `practice_sessions.child_id`
