# 家長中心 Database

## 主要資料表

- `users`
- `children`
- `learning_goals`
- `notification_settings`
- `learning_progress`

## 重要欄位

### learning_goals

- `id`
- `child_id`
- `goal_type`
- `target_value`
- `period`
- `enabled`

### notification_settings

- `user_id`
- `email_enabled`
- `weekly_report_enabled`
- `practice_reminder_enabled`

## 索引建議

- `learning_goals.child_id`
- `notification_settings.user_id`
