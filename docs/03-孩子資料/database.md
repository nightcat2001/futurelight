# 孩子資料 Database

## 主要資料表

- `children`：孩子主資料。
- `child_language_profiles`：語言設定。
- `child_preferences`：學習偏好。

## 重要欄位

### children

- `id`
- `user_id`
- `nickname`
- `birth_date`
- `status`
- `created_at`
- `updated_at`

### child_language_profiles

- `child_id`
- `native_language`
- `target_language`
- `level`

## 索引建議

- `children.user_id`
- `child_language_profiles.child_id`
