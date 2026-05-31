# 學習播放 API

## 需要的 API

### GET /api/units/{unit_id}/learning-steps

取得單元內的學習步驟。

### POST /api/learning-events

記錄孩子的學習事件。

事件類型：

- `step_started`
- `audio_played`
- `step_completed`
- `unit_completed`

### POST /api/units/{unit_id}/complete

標記單元完成。

## 回傳需求

- 學習步驟順序。
- 文字內容。
- 翻譯。
- 音檔 URL。
- 圖片 URL。
- 是否需要跟讀或互動。
