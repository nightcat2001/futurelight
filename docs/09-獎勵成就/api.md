# 獎勵成就 API

## 需要的 API

### GET /api/children/{child_id}/rewards

取得孩子獎勵總覽。

### GET /api/children/{child_id}/achievements

取得徽章與成就列表。

### GET /api/children/{child_id}/missions

取得任務進度。

### POST /api/rewards/evaluate

依學習事件檢查並發放獎勵。

## 回傳需求

- 目前星星或點數。
- 已取得徽章。
- 尚未取得徽章與條件。
- 任務進度。
- 最近獎勵事件。
