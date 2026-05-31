# 課程詳情 Database

## 主要資料表

- `courses`
- `course_units`
- `learning_steps`
- `learning_progress`

## 查詢需求

- 取得課程基本資料。
- 取得排序後的單元清單。
- 取得孩子在每個單元的完成狀態。

## 索引建議

- `course_units.course_id`
- `course_units.sort_order`
- `learning_progress.child_id`
- `learning_progress.course_id`
