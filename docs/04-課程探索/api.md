# 課程探索 API

## 需要的 API

### GET /api/courses

取得課程列表。

查詢參數：

- `language`
- `level`
- `age_min`
- `age_max`
- `topic`
- `keyword`

### GET /api/course-topics

取得課程主題清單。

### GET /api/courses/recommended

取得目前孩子的推薦課程。

## 回傳需求

- 課程名稱。
- 封面圖片。
- 適合年齡。
- 程度。
- 單元數。
- 孩子完成狀態。
