# 系統設定 API

## 需要的 API

### GET /api/settings

取得目前使用者設定。

### PATCH /api/settings/profile

更新帳號資料。

### PATCH /api/settings/password

更新密碼。

### PATCH /api/settings/preferences

更新語言與偏好設定。

### PATCH /api/settings/privacy

更新隱私設定。

## 安全需求

- 修改密碼需要驗證舊密碼。
- 敏感設定變更可要求重新登入。
- 所有設定更新都需檢查目前使用者身分。
