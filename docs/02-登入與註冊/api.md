# 登入與註冊 API

## 需要的 API

### POST /api/auth/register

建立家長帳號。

### POST /api/auth/login

登入並取得 session 或 access token。

### POST /api/auth/logout

登出目前帳號。

### POST /api/auth/password/forgot

寄送密碼重設信。

### POST /api/auth/password/reset

使用重設 token 更新密碼。

### GET /api/auth/session

確認目前登入狀態。

## 安全需求

- 密碼必須雜湊後儲存。
- 登入失敗需要基本頻率限制。
- 密碼重設 token 必須有過期時間。
