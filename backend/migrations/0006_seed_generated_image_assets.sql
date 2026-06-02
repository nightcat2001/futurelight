WITH generated_assets (
    asset_key,
    asset_type,
    path,
    status,
    source,
    prompt_summary,
    metadata
) AS (
    VALUES
        (
            'course_cover_color_english_words',
            'course_cover',
            'assets/images/course-covers/color-english-words-cover.png',
            'approved',
            'imagegen',
            'FutureLight color words course cover with red apple, blue kite, yellow star, and guide character',
            '{"art_bible": "docs/art-bible.md", "review": "visual_checked_by_codex"}'::jsonb
        ),
        (
            'word_card_apple',
            'word_card',
            'assets/images/word-cards/apple-word-card.png',
            'approved',
            'imagegen',
            'FutureLight apple word card with one clear red apple on a light background',
            '{"art_bible": "docs/art-bible.md", "review": "visual_checked_by_codex"}'::jsonb
        ),
        (
            'badge_activity_mastery',
            'reward_badge',
            'assets/images/badges/activity-mastery-badge.png',
            'approved',
            'imagegen',
            'Activity Mastery reward badge with rounded shield, star, and leaf motif',
            '{"art_bible": "docs/art-bible.md", "review": "visual_checked_by_codex"}'::jsonb
        ),
        (
            'guide_happy',
            'character_expression',
            'assets/images/characters/guide-happy.png',
            'approved',
            'imagegen',
            'FutureLight guide character happy encouragement expression',
            '{"art_bible": "docs/art-bible.md", "review": "visual_checked_by_codex"}'::jsonb
        ),
        (
            'guide_thinking',
            'character_expression',
            'assets/images/characters/guide-thinking.png',
            'approved',
            'imagegen',
            'FutureLight guide character thinking encouragement expression',
            '{"art_bible": "docs/art-bible.md", "review": "visual_checked_by_codex"}'::jsonb
        )
),
upsert_assets AS (
    INSERT INTO assets (
        asset_key,
        asset_type,
        path,
        status,
        source,
        prompt_summary,
        metadata
    )
    SELECT asset_key,
        asset_type,
        path,
        status,
        source,
        prompt_summary,
        metadata
    FROM generated_assets
    ON CONFLICT (asset_key) DO UPDATE
    SET asset_type = EXCLUDED.asset_type,
        path = EXCLUDED.path,
        status = EXCLUDED.status,
        source = EXCLUDED.source,
        prompt_summary = EXCLUDED.prompt_summary,
        metadata = EXCLUDED.metadata
    RETURNING id, asset_key
)
UPDATE courses
SET cover_asset_id = upsert_assets.id
FROM upsert_assets
WHERE courses.slug = 'color-english-words'
    AND upsert_assets.asset_key = 'course_cover_color_english_words';

UPDATE activities
SET content = jsonb_set(content, '{image_asset_key}', '"word_card_apple"', true)
FROM lessons
INNER JOIN courses ON courses.id = lessons.course_id
WHERE activities.lesson_id = lessons.id
    AND courses.slug = 'food-english-words'
    AND lessons.slug = 'favorite-foods'
    AND activities.slug = 'apple-word';
