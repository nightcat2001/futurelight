# 家長中心 API

## 需要的 API

### GET /api/parent/dashboard

取得家長中心總覽。

### GET /api/children/{child_id}/goals

取得孩子學習目標。

### PUT /api/children/{child_id}/goals

更新孩子學習目標。

### GET /api/parent/notification-settings

取得通知設定。

### PUT /api/parent/notification-settings

更新通知設定。

## 權限

- 只有家長本人可以讀取與修改自己的家長中心資料。
