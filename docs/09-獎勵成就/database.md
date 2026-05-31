# 獎勵成就 Database

## 主要資料表

- `achievements`
- `child_achievements`
- `missions`
- `child_mission_progress`
- `reward_events`
- `child_reward_balances`

## 重要欄位

### reward_events

- `id`
- `child_id`
- `reward_type`
- `amount`
- `reason`
- `source_type`
- `source_id`
- `created_at`

## 索引建議

- `child_achievements.child_id`
- `child_mission_progress.child_id`
- `reward_events.child_id`
- `reward_events.created_at`
