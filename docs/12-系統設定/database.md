# 系統設定 Database

## 主要資料表

- `users`
- `user_preferences`
- `notification_settings`
- `privacy_settings`
- `security_events`

## 重要欄位

### user_preferences

- `user_id`
- `ui_language`
- `timezone`
- `default_child_id`

### security_events

- `id`
- `user_id`
- `event_type`
- `metadata`
- `created_at`

## 索引建議

- `user_preferences.user_id`
- `privacy_settings.user_id`
- `security_events.user_id`
- `security_events.created_at`
