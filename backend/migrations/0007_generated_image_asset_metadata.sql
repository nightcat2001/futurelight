UPDATE assets
SET metadata = metadata || jsonb_build_object(
    'model', 'built-in image_gen',
    'generated_at', '2026-06-01',
    'license_status', 'project-generated-review-required-before-store',
    'reviewer', 'codex visual check',
    'use', CASE asset_key
        WHEN 'course_cover_color_english_words' THEN 'Color words course cover'
        WHEN 'word_card_apple' THEN 'Food course apple word card'
        WHEN 'badge_activity_mastery' THEN 'Activity mastery reward badge'
        WHEN 'guide_happy' THEN 'Guide character happy expression'
        WHEN 'guide_thinking' THEN 'Guide character thinking expression'
        ELSE asset_type
    END
)
WHERE asset_key IN (
    'course_cover_color_english_words',
    'word_card_apple',
    'badge_activity_mastery',
    'guide_happy',
    'guide_thinking'
);
