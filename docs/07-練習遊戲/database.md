# 練習遊戲 Database

## 主要資料表

- `practice_questions`
- `practice_options`
- `practice_sessions`
- `practice_answers`
- `reward_events`

## 重要欄位

### practice_questions

- `id`
- `unit_id`
- `question_type`
- `prompt`
- `correct_answer`
- `media_asset_id`

### practice_answers

- `id`
- `session_id`
- `question_id`
- `answer`
- `is_correct`
- `answered_at`

## 索引建議

- `practice_questions.unit_id`
- `practice_sessions.child_id`
- `practice_answers.session_id`
