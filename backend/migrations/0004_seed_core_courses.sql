WITH course_seed (
    slug,
    status,
    title,
    target_language,
    level,
    cover_asset_key,
    sort_order
) AS (
    VALUES
        ('animal-english-words', 'draft', '動物英文單字', 'en', 'beginner', 'course_cover_animal_english_words', 10),
        ('color-english-words', 'draft', '顏色英文單字', 'en', 'beginner', NULL, 20),
        ('number-english-words', 'draft', '數字英文單字', 'en', 'beginner', NULL, 30),
        ('family-english-words', 'draft', '家人英文單字', 'en', 'beginner', NULL, 40),
        ('food-english-words', 'draft', '食物英文單字', 'en', 'beginner', NULL, 50),
        ('daily-greetings-english', 'draft', '日常問候英文', 'en', 'beginner', NULL, 60)
),
upsert_courses AS (
    INSERT INTO courses (
        slug,
        status,
        title,
        target_language,
        level,
        cover_asset_id,
        sort_order,
        published_at
    )
    SELECT course_seed.slug,
        course_seed.status,
        course_seed.title,
        course_seed.target_language,
        course_seed.level,
        assets.id,
        course_seed.sort_order,
        NULL
    FROM course_seed
    LEFT JOIN assets ON assets.asset_key = course_seed.cover_asset_key
    ON CONFLICT (slug) DO UPDATE
    SET status = EXCLUDED.status,
        title = EXCLUDED.title,
        target_language = EXCLUDED.target_language,
        level = EXCLUDED.level,
        cover_asset_id = EXCLUDED.cover_asset_id,
        sort_order = EXCLUDED.sort_order,
        published_at = EXCLUDED.published_at
    RETURNING id, slug
),
lesson_seed (
    course_slug,
    slug,
    title,
    learning_objectives,
    sort_order
) AS (
    VALUES
        (
            'animal-english-words',
            'zoo-animals',
            'Zoo Animals',
            '["Recognize common animal words", "Choose the matching animal word", "Say the target animal word with parent guidance"]'::jsonb,
            10
        ),
        (
            'color-english-words',
            'bright-colors',
            'Bright Colors',
            '["Recognize red, blue, and yellow", "Choose a color from a spoken or written prompt", "Use colors in simple noun phrases"]'::jsonb,
            10
        ),
        (
            'number-english-words',
            'one-to-five',
            'One To Five',
            '["Recognize number words one through five", "Match numerals and number words", "Answer simple counting prompts"]'::jsonb,
            10
        ),
        (
            'family-english-words',
            'family-members',
            'Family Members',
            '["Recognize common family words", "Choose the correct family member word", "Use family words in short phrases"]'::jsonb,
            10
        ),
        (
            'food-english-words',
            'favorite-foods',
            'Favorite Foods',
            '["Recognize common food words", "Choose a food from a simple prompt", "Practice polite food phrases"]'::jsonb,
            10
        ),
        (
            'daily-greetings-english',
            'hello-goodbye',
            'Hello And Goodbye',
            '["Recognize common greeting phrases", "Choose the right greeting for a situation", "Practice polite daily expressions"]'::jsonb,
            10
        )
),
upsert_lessons AS (
    INSERT INTO lessons (
        course_id,
        slug,
        title,
        learning_objectives,
        sort_order
    )
    SELECT upsert_courses.id,
        lesson_seed.slug,
        lesson_seed.title,
        lesson_seed.learning_objectives,
        lesson_seed.sort_order
    FROM lesson_seed
    INNER JOIN upsert_courses ON upsert_courses.slug = lesson_seed.course_slug
    ON CONFLICT (course_id, slug) DO UPDATE
    SET title = EXCLUDED.title,
        learning_objectives = EXCLUDED.learning_objectives,
        sort_order = EXCLUDED.sort_order
    RETURNING id, course_id, slug
),
activity_seed (
    course_slug,
    lesson_slug,
    slug,
    activity_type,
    prompt,
    content,
    answer_key,
    sort_order
) AS (
    VALUES
        ('animal-english-words', 'zoo-animals', 'lion-word', 'word_card', '{"text": "lion", "instruction": "Listen and repeat"}'::jsonb, '{"word": "lion", "translation": "獅子", "image_asset_key": "course_cover_animal_english_words", "audio_asset_key": null, "example": "A lion is big."}'::jsonb, '{"expected": "lion"}'::jsonb, 10),
        ('animal-english-words', 'zoo-animals', 'bird-word', 'word_card', '{"text": "bird", "instruction": "Listen and repeat"}'::jsonb, '{"word": "bird", "translation": "鳥", "image_asset_key": "course_cover_animal_english_words", "audio_asset_key": null, "example": "A bird can fly."}'::jsonb, '{"expected": "bird"}'::jsonb, 20),
        ('animal-english-words', 'zoo-animals', 'elephant-word', 'word_card', '{"text": "elephant", "instruction": "Listen and repeat"}'::jsonb, '{"word": "elephant", "translation": "大象", "image_asset_key": "course_cover_animal_english_words", "audio_asset_key": null, "example": "An elephant is strong."}'::jsonb, '{"expected": "elephant"}'::jsonb, 30),
        ('animal-english-words', 'zoo-animals', 'pick-lion', 'single_choice', '{"text": "Which one is lion?"}'::jsonb, '{"choices": ["lion", "bird", "elephant"], "image_asset_key": "course_cover_animal_english_words"}'::jsonb, '{"correct_answer": "lion"}'::jsonb, 40),

        ('color-english-words', 'bright-colors', 'red-word', 'word_card', '{"text": "red", "instruction": "Look and say the color"}'::jsonb, '{"word": "red", "translation": "紅色", "color_hex": "#e53935", "audio_asset_key": null, "example": "A red apple."}'::jsonb, '{"expected": "red"}'::jsonb, 10),
        ('color-english-words', 'bright-colors', 'blue-word', 'word_card', '{"text": "blue", "instruction": "Look and say the color"}'::jsonb, '{"word": "blue", "translation": "藍色", "color_hex": "#1e88e5", "audio_asset_key": null, "example": "A blue sky."}'::jsonb, '{"expected": "blue"}'::jsonb, 20),
        ('color-english-words', 'bright-colors', 'yellow-word', 'word_card', '{"text": "yellow", "instruction": "Look and say the color"}'::jsonb, '{"word": "yellow", "translation": "黃色", "color_hex": "#fdd835", "audio_asset_key": null, "example": "A yellow star."}'::jsonb, '{"expected": "yellow"}'::jsonb, 30),
        ('color-english-words', 'bright-colors', 'pick-blue', 'single_choice', '{"text": "Which one is blue?"}'::jsonb, '{"choices": ["red", "blue", "yellow"]}'::jsonb, '{"correct_answer": "blue"}'::jsonb, 40),

        ('number-english-words', 'one-to-five', 'one-word', 'word_card', '{"text": "one", "instruction": "Count and say the word"}'::jsonb, '{"word": "one", "translation": "一", "number": 1, "audio_asset_key": null, "example": "One star."}'::jsonb, '{"expected": "one"}'::jsonb, 10),
        ('number-english-words', 'one-to-five', 'two-word', 'word_card', '{"text": "two", "instruction": "Count and say the word"}'::jsonb, '{"word": "two", "translation": "二", "number": 2, "audio_asset_key": null, "example": "Two birds."}'::jsonb, '{"expected": "two"}'::jsonb, 20),
        ('number-english-words', 'one-to-five', 'three-word', 'word_card', '{"text": "three", "instruction": "Count and say the word"}'::jsonb, '{"word": "three", "translation": "三", "number": 3, "audio_asset_key": null, "example": "Three apples."}'::jsonb, '{"expected": "three"}'::jsonb, 30),
        ('number-english-words', 'one-to-five', 'four-word', 'word_card', '{"text": "four", "instruction": "Count and say the word"}'::jsonb, '{"word": "four", "translation": "四", "number": 4, "audio_asset_key": null, "example": "Four cups."}'::jsonb, '{"expected": "four"}'::jsonb, 40),
        ('number-english-words', 'one-to-five', 'five-word', 'word_card', '{"text": "five", "instruction": "Count and say the word"}'::jsonb, '{"word": "five", "translation": "五", "number": 5, "audio_asset_key": null, "example": "Five cats."}'::jsonb, '{"expected": "five"}'::jsonb, 50),
        ('number-english-words', 'one-to-five', 'pick-three', 'single_choice', '{"text": "Which word means 3?"}'::jsonb, '{"choices": ["one", "three", "five"]}'::jsonb, '{"correct_answer": "three"}'::jsonb, 60),

        ('family-english-words', 'family-members', 'mother-word', 'word_card', '{"text": "mother", "instruction": "Listen and repeat"}'::jsonb, '{"word": "mother", "translation": "媽媽", "audio_asset_key": null, "example": "This is my mother."}'::jsonb, '{"expected": "mother"}'::jsonb, 10),
        ('family-english-words', 'family-members', 'father-word', 'word_card', '{"text": "father", "instruction": "Listen and repeat"}'::jsonb, '{"word": "father", "translation": "爸爸", "audio_asset_key": null, "example": "This is my father."}'::jsonb, '{"expected": "father"}'::jsonb, 20),
        ('family-english-words', 'family-members', 'sister-word', 'word_card', '{"text": "sister", "instruction": "Listen and repeat"}'::jsonb, '{"word": "sister", "translation": "姊妹", "audio_asset_key": null, "example": "My sister smiles."}'::jsonb, '{"expected": "sister"}'::jsonb, 30),
        ('family-english-words', 'family-members', 'brother-word', 'word_card', '{"text": "brother", "instruction": "Listen and repeat"}'::jsonb, '{"word": "brother", "translation": "兄弟", "audio_asset_key": null, "example": "My brother waves."}'::jsonb, '{"expected": "brother"}'::jsonb, 40),
        ('family-english-words', 'family-members', 'pick-mother', 'single_choice', '{"text": "Which one means 媽媽?"}'::jsonb, '{"choices": ["mother", "father", "brother"]}'::jsonb, '{"correct_answer": "mother"}'::jsonb, 50),

        ('food-english-words', 'favorite-foods', 'apple-word', 'word_card', '{"text": "apple", "instruction": "Listen and repeat"}'::jsonb, '{"word": "apple", "translation": "蘋果", "audio_asset_key": null, "example": "I like apples."}'::jsonb, '{"expected": "apple"}'::jsonb, 10),
        ('food-english-words', 'favorite-foods', 'bread-word', 'word_card', '{"text": "bread", "instruction": "Listen and repeat"}'::jsonb, '{"word": "bread", "translation": "麵包", "audio_asset_key": null, "example": "Bread is soft."}'::jsonb, '{"expected": "bread"}'::jsonb, 20),
        ('food-english-words', 'favorite-foods', 'milk-word', 'word_card', '{"text": "milk", "instruction": "Listen and repeat"}'::jsonb, '{"word": "milk", "translation": "牛奶", "audio_asset_key": null, "example": "Milk is white."}'::jsonb, '{"expected": "milk"}'::jsonb, 30),
        ('food-english-words', 'favorite-foods', 'rice-word', 'word_card', '{"text": "rice", "instruction": "Listen and repeat"}'::jsonb, '{"word": "rice", "translation": "飯", "audio_asset_key": null, "example": "Rice is warm."}'::jsonb, '{"expected": "rice"}'::jsonb, 40),
        ('food-english-words', 'favorite-foods', 'pick-apple', 'single_choice', '{"text": "Which one is apple?"}'::jsonb, '{"choices": ["apple", "bread", "milk"]}'::jsonb, '{"correct_answer": "apple"}'::jsonb, 50),

        ('daily-greetings-english', 'hello-goodbye', 'hello-word', 'word_card', '{"text": "hello", "instruction": "Say hello"}'::jsonb, '{"word": "hello", "translation": "你好", "audio_asset_key": null, "example": "Hello, Sam!"}'::jsonb, '{"expected": "hello"}'::jsonb, 10),
        ('daily-greetings-english', 'hello-goodbye', 'goodbye-word', 'word_card', '{"text": "goodbye", "instruction": "Say goodbye"}'::jsonb, '{"word": "goodbye", "translation": "再見", "audio_asset_key": null, "example": "Goodbye, teacher."}'::jsonb, '{"expected": "goodbye"}'::jsonb, 20),
        ('daily-greetings-english', 'hello-goodbye', 'thank-you-word', 'word_card', '{"text": "thank you", "instruction": "Say thank you"}'::jsonb, '{"word": "thank you", "translation": "謝謝", "audio_asset_key": null, "example": "Thank you, Mom."}'::jsonb, '{"expected": "thank you"}'::jsonb, 30),
        ('daily-greetings-english', 'hello-goodbye', 'please-word', 'word_card', '{"text": "please", "instruction": "Say please"}'::jsonb, '{"word": "please", "translation": "請", "audio_asset_key": null, "example": "Please help me."}'::jsonb, '{"expected": "please"}'::jsonb, 40),
        ('daily-greetings-english', 'hello-goodbye', 'pick-hello', 'single_choice', '{"text": "Which word do we say when we meet someone?"}'::jsonb, '{"choices": ["hello", "goodbye", "please"]}'::jsonb, '{"correct_answer": "hello"}'::jsonb, 50)
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
SELECT upsert_lessons.id,
    activity_seed.slug,
    activity_seed.activity_type,
    activity_seed.prompt,
    activity_seed.content,
    activity_seed.answer_key,
    activity_seed.sort_order
FROM activity_seed
INNER JOIN upsert_courses ON upsert_courses.slug = activity_seed.course_slug
INNER JOIN upsert_lessons ON upsert_lessons.course_id = upsert_courses.id
    AND upsert_lessons.slug = activity_seed.lesson_slug
ON CONFLICT (lesson_id, slug) DO UPDATE
SET activity_type = EXCLUDED.activity_type,
    prompt = EXCLUDED.prompt,
    content = EXCLUDED.content,
    answer_key = EXCLUDED.answer_key,
    sort_order = EXCLUDED.sort_order;
