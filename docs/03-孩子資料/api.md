# 孩子資料 API

## 需要的 API

### GET /api/children

取得目前家長底下的孩子清單。

### POST /api/children

建立孩子資料。

### GET /api/children/{child_id}

取得單一孩子資料。

### PATCH /api/children/{child_id}

更新孩子資料。

### DELETE /api/children/{child_id}

刪除或停用孩子資料。

## 權限

- 家長只能管理自己的孩子。
- 管理員可依後台需求查詢孩子資料，但需留下紀錄。
