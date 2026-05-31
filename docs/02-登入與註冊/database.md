# 登入與註冊 Database

## 主要資料表

- `users`：帳號主表。
- `auth_sessions`：登入 session。
- `password_reset_tokens`：密碼重設 token。
- `login_events`：登入紀錄。

## 重要欄位

### users

- `id`
- `email`
- `password_hash`
- `display_name`
- `role`
- `created_at`
- `updated_at`

### password_reset_tokens

- `id`
- `user_id`
- `token_hash`
- `expires_at`
- `used_at`

## 索引建議

- `users.email` 唯一索引。
- `auth_sessions.user_id`
- `password_reset_tokens.token_hash`
