# 內容管理 Database

## 主要資料表

- `courses`
- `course_units`
- `learning_steps`
- `practice_questions`
- `practice_options`
- `media_assets`
- `content_audit_logs`

## 重要欄位

### courses

- `id`
- `title`
- `description`
- `target_language`
- `level`
- `status`
- `published_at`

### content_audit_logs

- `id`
- `actor_user_id`
- `action`
- `target_type`
- `target_id`
- `created_at`

## 索引建議

- `courses.status`
- `course_units.course_id`
- `learning_steps.unit_id`
- `practice_questions.unit_id`
- `content_audit_logs.actor_user_id`
