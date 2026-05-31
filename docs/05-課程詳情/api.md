# 課程詳情 API

## 需要的 API

### GET /api/courses/{course_id}

取得課程詳情。

### GET /api/courses/{course_id}/units

取得課程單元列表。

### GET /api/courses/{course_id}/progress

取得目前孩子在此課程的進度。

### POST /api/courses/{course_id}/start

開始課程或建立課程進度。

## 權限

- 前台只能讀取已發布課程。
- 管理員可讀取草稿與下架課程。
