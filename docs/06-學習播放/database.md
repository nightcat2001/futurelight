# 學習播放 Database

## 主要資料表

- `course_units`
- `learning_steps`
- `media_assets`
- `learning_events`
- `learning_progress`

## 重要欄位

### learning_steps

- `id`
- `unit_id`
- `step_type`
- `title`
- `text_content`
- `translation`
- `media_asset_id`
- `sort_order`

### learning_events

- `id`
- `child_id`
- `unit_id`
- `step_id`
- `event_type`
- `created_at`

## 索引建議

- `learning_steps.unit_id`
- `learning_steps.sort_order`
- `learning_events.child_id`
- `learning_events.created_at`
