# 課程探索 Database

## 主要資料表

- `courses`
- `course_topics`
- `course_topic_links`
- `course_units`
- `learning_progress`

## 查詢需求

- 依語言、程度、年齡、主題篩選課程。
- 依關鍵字搜尋課程名稱與描述。
- 顯示孩子對每門課程的完成狀態。

## 索引建議

- `courses.target_language`
- `courses.level`
- `courses.status`
- `course_topic_links.topic_id`
- 課程搜尋可評估 PostgreSQL full text search。
