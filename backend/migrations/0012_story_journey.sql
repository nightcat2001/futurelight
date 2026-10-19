ALTER TABLE children DROP CONSTRAINT children_age_band_check;
ALTER TABLE children
    ADD CONSTRAINT children_age_band_check
    CHECK (age_band IN ('0-2', '3-4', '5-6', '3-5', '6-8', '9-11'));

CREATE TABLE stories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text NOT NULL UNIQUE,
    title text NOT NULL,
    summary text NOT NULL,
    theme text NOT NULL,
    mode text NOT NULL DEFAULT 'standard',
    min_age integer NOT NULL,
    max_age integer NOT NULL,
    duration_minutes integer NOT NULL,
    cover_path text NOT NULL,
    pages jsonb NOT NULL,
    parent_prompt text NOT NULL,
    calming_prompt text,
    status text NOT NULL DEFAULT 'published',
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT stories_mode_check CHECK (mode IN ('standard', 'bedtime')),
    CONSTRAINT stories_age_check CHECK (min_age >= 0 AND max_age <= 11 AND min_age <= max_age),
    CONSTRAINT stories_duration_check CHECK (duration_minutes BETWEEN 1 AND 30),
    CONSTRAINT stories_status_check CHECK (status IN ('draft', 'review', 'published', 'archived')),
    CONSTRAINT stories_pages_check CHECK (jsonb_typeof(pages) = 'array' AND jsonb_array_length(pages) >= 2)
);

CREATE INDEX stories_recommendation_idx
    ON stories(status, mode, min_age, max_age, sort_order);

CREATE TRIGGER stories_set_updated_at
BEFORE UPDATE ON stories
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE story_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    story_id uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    mode text NOT NULL,
    current_page integer NOT NULL DEFAULT 0,
    started_at timestamptz NOT NULL DEFAULT now(),
    last_progress_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz,
    CONSTRAINT story_sessions_mode_check CHECK (mode IN ('standard', 'bedtime')),
    CONSTRAINT story_sessions_page_check CHECK (current_page >= 0)
);

CREATE INDEX story_sessions_child_started_idx
    ON story_sessions(child_id, started_at DESC);

CREATE TABLE daily_family_tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    task_key text NOT NULL UNIQUE,
    title text NOT NULL,
    instruction text NOT NULL,
    parent_tip text NOT NULL,
    min_age integer NOT NULL,
    max_age integer NOT NULL,
    duration_minutes integer NOT NULL,
    sort_order integer NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'published',
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT family_tasks_age_check CHECK (min_age >= 0 AND max_age <= 11 AND min_age <= max_age),
    CONSTRAINT family_tasks_duration_check CHECK (duration_minutes BETWEEN 1 AND 20),
    CONSTRAINT family_tasks_status_check CHECK (status IN ('draft', 'published', 'archived'))
);

CREATE TABLE family_task_completions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    task_id uuid NOT NULL REFERENCES daily_family_tasks(id) ON DELETE CASCADE,
    completion_date date NOT NULL DEFAULT CURRENT_DATE,
    completed_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(child_id, task_id, completion_date)
);

CREATE INDEX family_task_completions_child_date_idx
    ON family_task_completions(child_id, completion_date DESC);

INSERT INTO stories (
    slug, title, summary, theme, mode, min_age, max_age, duration_minutes,
    cover_path, pages, parent_prompt, calming_prompt, sort_order
) VALUES
(
    'little-seed-finds-sun',
    '小種子找到太陽',
    '跟著小種子感受雨水、泥土與陽光，練習等待與觀察。',
    '自然與耐心',
    'standard', 0, 3, 4,
    '/assets/images/course-covers/color-english-words-cover.png',
    '[
      {"text":"小種子躺在軟軟的泥土裡。","scene":"seed","prompt":"你找到小種子了嗎？"},
      {"text":"滴答、滴答，春雨來喝水。","scene":"rain","prompt":"用手指點一點雨滴。"},
      {"text":"暖暖的太陽說：慢慢長大吧。","scene":"sun","prompt":"把雙手張開，像太陽一樣。"},
      {"text":"啵！小嫩芽探出頭，向大家說早安。","scene":"sprout","prompt":"和小嫩芽一起說早安。"}
    ]'::jsonb,
    '和孩子一起找家中一個正在長大的東西。',
    NULL,
    10
),
(
    'cloud-bread-delivery',
    '雲朵麵包送到了',
    '小米和爸爸合作，把香香的雲朵麵包送給需要幫忙的鄰居。',
    '合作與同理',
    'standard', 3, 6, 6,
    '/assets/images/course-covers/animal-english-words-cover.png',
    '[
      {"text":"小米在窗邊接住一朵像棉花的白雲。","scene":"cloud","prompt":"白雲摸起來會像什麼？"},
      {"text":"爸爸揉呀揉，把白雲做成圓圓的小麵包。","scene":"bread","prompt":"一起做揉麵團的動作。"},
      {"text":"門外的風很大，他們一起抱緊麵包籃。","scene":"wind","prompt":"遇到困難時，可以請誰幫忙？"},
      {"text":"第一個麵包送給腳受傷的林奶奶。","scene":"door","prompt":"小米為什麼先來這裡？"},
      {"text":"最後一個麵包，爸爸和小米一人一半。","scene":"share","prompt":"想一想，你今天和誰分享過？"}
    ]'::jsonb,
    '請孩子選一件今天能一起完成的小事，完成後互相說謝謝。',
    NULL,
    20
),
(
    'moon-boat-goodnight',
    '月亮小船晚安',
    '搭上慢慢搖晃的月亮小船，向一天裡遇見的人和事說晚安。',
    '安定與睡眠',
    'bedtime', 0, 6, 5,
    '/assets/images/characters/guide-happy.png',
    '[
      {"text":"月亮小船停在窗邊，輕輕搖呀搖。","scene":"moon","prompt":"慢慢吸一口氣。"},
      {"text":"我們向忙了一天的小手說晚安。","scene":"hands","prompt":"把小手放鬆在棉被上。"},
      {"text":"我們向跑跑跳跳的小腳說晚安。","scene":"feet","prompt":"讓小腳安靜地休息。"},
      {"text":"今天開心的事，變成一顆亮亮的星星。","scene":"star","prompt":"想一件今天開心的事。"},
      {"text":"小船回到夢裡。晚安，我們明天見。","scene":"sleep","prompt":"閉上眼睛，慢慢呼吸。"}
    ]'::jsonb,
    '睡前只問一題：今天哪一件事讓你覺得暖暖的？',
    '把螢幕亮度調低，跟著每頁提示做一次慢呼吸。',
    10
);

INSERT INTO daily_family_tasks (
    task_key, title, instruction, parent_tip, min_age, max_age, duration_minutes, sort_order
) VALUES
('find-three-colors', '找找三種顏色', '一起在家裡找到紅色、綠色和黃色的東西。', '讓孩子用指認、拿取或說出名稱的方式完成，不要求讀字。', 0, 3, 3, 10),
('kindness-helper', '今天的小幫手', '請孩子選一件可以和大人一起完成的家事。', '把任務拆成一個清楚動作，例如把湯匙放上桌。', 3, 6, 5, 20),
('story-feeling-face', '故事表情遊戲', '輪流做出故事角色開心、擔心和安心的表情。', '先示範，再讓孩子自由模仿；不糾正表情是否標準。', 2, 6, 5, 30);
