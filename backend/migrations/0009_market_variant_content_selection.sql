ALTER TABLE courses
ADD COLUMN IF NOT EXISTS market_regions text[] NOT NULL DEFAULT ARRAY['DE', 'UK', 'US', 'TW', 'OTHER'];

ALTER TABLE courses
ADD COLUMN IF NOT EXISTS english_variants text[] NOT NULL DEFAULT ARRAY['american', 'british'];

ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS market_regions text[] NOT NULL DEFAULT ARRAY['DE', 'UK', 'US', 'TW', 'OTHER'];

ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS english_variants text[] NOT NULL DEFAULT ARRAY['american', 'british'];

ALTER TABLE activities
ADD COLUMN IF NOT EXISTS market_regions text[] NOT NULL DEFAULT ARRAY['DE', 'UK', 'US', 'TW', 'OTHER'];

ALTER TABLE activities
ADD COLUMN IF NOT EXISTS english_variants text[] NOT NULL DEFAULT ARRAY['american', 'british'];

ALTER TABLE activities
ADD COLUMN IF NOT EXISTS variant_overrides jsonb NOT NULL DEFAULT '{}'::jsonb;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'courses_market_regions_check'
    ) THEN
        ALTER TABLE courses
        ADD CONSTRAINT courses_market_regions_check
        CHECK (
            cardinality(market_regions) > 0
            AND market_regions <@ ARRAY['DE', 'UK', 'US', 'TW', 'OTHER']::text[]
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'courses_english_variants_check'
    ) THEN
        ALTER TABLE courses
        ADD CONSTRAINT courses_english_variants_check
        CHECK (
            cardinality(english_variants) > 0
            AND english_variants <@ ARRAY['american', 'british']::text[]
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'lessons_market_regions_check'
    ) THEN
        ALTER TABLE lessons
        ADD CONSTRAINT lessons_market_regions_check
        CHECK (
            cardinality(market_regions) > 0
            AND market_regions <@ ARRAY['DE', 'UK', 'US', 'TW', 'OTHER']::text[]
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'lessons_english_variants_check'
    ) THEN
        ALTER TABLE lessons
        ADD CONSTRAINT lessons_english_variants_check
        CHECK (
            cardinality(english_variants) > 0
            AND english_variants <@ ARRAY['american', 'british']::text[]
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'activities_market_regions_check'
    ) THEN
        ALTER TABLE activities
        ADD CONSTRAINT activities_market_regions_check
        CHECK (
            cardinality(market_regions) > 0
            AND market_regions <@ ARRAY['DE', 'UK', 'US', 'TW', 'OTHER']::text[]
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'activities_english_variants_check'
    ) THEN
        ALTER TABLE activities
        ADD CONSTRAINT activities_english_variants_check
        CHECK (
            cardinality(english_variants) > 0
            AND english_variants <@ ARRAY['american', 'british']::text[]
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'activities_variant_overrides_check'
    ) THEN
        ALTER TABLE activities
        ADD CONSTRAINT activities_variant_overrides_check
        CHECK (jsonb_typeof(variant_overrides) = 'object');
    END IF;
END
$$;

CREATE INDEX IF NOT EXISTS courses_market_regions_idx ON courses USING gin (market_regions);
CREATE INDEX IF NOT EXISTS courses_english_variants_idx ON courses USING gin (english_variants);
CREATE INDEX IF NOT EXISTS lessons_market_regions_idx ON lessons USING gin (market_regions);
CREATE INDEX IF NOT EXISTS lessons_english_variants_idx ON lessons USING gin (english_variants);
CREATE INDEX IF NOT EXISTS activities_market_regions_idx ON activities USING gin (market_regions);
CREATE INDEX IF NOT EXISTS activities_english_variants_idx ON activities USING gin (english_variants);

UPDATE activities
SET market_regions = ARRAY['UK', 'US', 'TW', 'OTHER']
FROM lessons
INNER JOIN courses ON courses.id = lessons.course_id
WHERE activities.lesson_id = lessons.id
    AND courses.slug = 'daily-greetings-english'
    AND lessons.slug = 'hello-goodbye'
    AND activities.slug = 'please-word';

UPDATE activities
SET variant_overrides = '{
    "american": {
        "prompt": {
            "instruction": "Look and say the color"
        },
        "content": {
            "example": "A blue kite is a bright color.",
            "spelling_word": "color",
            "variant_note": "American English uses color."
        }
    },
    "british": {
        "prompt": {
            "instruction": "Look and say the colour"
        },
        "content": {
            "example": "A blue kite is a bright colour.",
            "spelling_word": "colour",
            "variant_note": "British English uses colour."
        }
    }
}'::jsonb
FROM lessons
INNER JOIN courses ON courses.id = lessons.course_id
WHERE activities.lesson_id = lessons.id
    AND courses.slug = 'color-english-words'
    AND lessons.slug = 'bright-colors'
    AND activities.slug = 'blue-word';
