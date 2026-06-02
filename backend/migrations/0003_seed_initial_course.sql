WITH cover_asset AS (
    INSERT INTO assets (
        asset_key,
        asset_type,
        path,
        status,
        source,
        prompt_summary
    )
    VALUES (
        'course_cover_animal_english_words',
        'course_cover',
        'assets/images/course-covers/animal-english-words-cover.png',
        'approved',
        'imagegen',
        'Children language learning course cover for English animal words'
    )
    ON CONFLICT (asset_key) DO UPDATE
    SET asset_type = EXCLUDED.asset_type,
        path = EXCLUDED.path,
        status = EXCLUDED.status,
        source = EXCLUDED.source,
        prompt_summary = EXCLUDED.prompt_summary
    RETURNING id
),
seed_course AS (
    INSERT INTO courses (
        slug,
        status,
        title,
        target_language,
        level,
        cover_asset_id,
        sort_order
    )
    VALUES (
        'animal-english-words',
        'draft',
        '動物英文單字',
        'en',
        'beginner',
        (SELECT id FROM cover_asset),
        10
    )
    ON CONFLICT (slug) DO UPDATE
    SET status = EXCLUDED.status,
        title = EXCLUDED.title,
        target_language = EXCLUDED.target_language,
        level = EXCLUDED.level,
        cover_asset_id = EXCLUDED.cover_asset_id,
        sort_order = EXCLUDED.sort_order
    RETURNING id
),
seed_lesson AS (
    INSERT INTO lessons (
        course_id,
        slug,
        title,
        learning_objectives,
        sort_order
    )
    VALUES (
        (SELECT id FROM seed_course),
        'zoo-animals',
        'Zoo Animals',
        '["Recognize common animal words", "Match spoken or written animal words to images"]'::jsonb,
        10
    )
    ON CONFLICT (course_id, slug) DO UPDATE
    SET title = EXCLUDED.title,
        learning_objectives = EXCLUDED.learning_objectives,
        sort_order = EXCLUDED.sort_order
    RETURNING id
)
INSERT INTO activities (
    lesson_id,
    slug,
    activity_type,
    prompt,
    content,
    answer_key,
    sort_order
)
VALUES
    (
        (SELECT id FROM seed_lesson),
        'lion-word',
        'word_card',
        '{"text": "lion", "instruction": "Listen and repeat"}'::jsonb,
        '{"word": "lion", "translation": "獅子", "image_asset_key": "course_cover_animal_english_words", "audio_asset_key": null}'::jsonb,
        '{"expected": "lion"}'::jsonb,
        10
    ),
    (
        (SELECT id FROM seed_lesson),
        'bird-word',
        'word_card',
        '{"text": "bird", "instruction": "Listen and repeat"}'::jsonb,
        '{"word": "bird", "translation": "鳥", "image_asset_key": "course_cover_animal_english_words", "audio_asset_key": null}'::jsonb,
        '{"expected": "bird"}'::jsonb,
        20
    ),
    (
        (SELECT id FROM seed_lesson),
        'pick-lion',
        'single_choice',
        '{"text": "Which one is lion?"}'::jsonb,
        '{"choices": ["lion", "bird"], "image_asset_key": "course_cover_animal_english_words"}'::jsonb,
        '{"correct_answer": "lion"}'::jsonb,
        30
    )
ON CONFLICT (lesson_id, slug) DO UPDATE
SET activity_type = EXCLUDED.activity_type,
    prompt = EXCLUDED.prompt,
    content = EXCLUDED.content,
    answer_key = EXCLUDED.answer_key,
    sort_order = EXCLUDED.sort_order;
