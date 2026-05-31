# 練習遊戲 API

## 需要的 API

### GET /api/practice-sessions/start

建立練習 session 並取得題目。

查詢參數：

- `child_id`
- `unit_id`
- `course_id`
- `practice_type`

### POST /api/practice-sessions/{session_id}/answers

送出單題答案。

### POST /api/practice-sessions/{session_id}/complete

完成練習並計算結果。

## 回傳需求

- 題目內容。
- 選項。
- 媒體資源。
- 答題結果。
- 獲得星星或獎勵。
