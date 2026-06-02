ALTER TABLE parent_accounts
ADD COLUMN IF NOT EXISTS sound_enabled boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS voice_volume integer NOT NULL DEFAULT 100,
ADD COLUMN IF NOT EXISTS effect_volume integer NOT NULL DEFAULT 60,
ADD COLUMN IF NOT EXISTS auto_play_voice boolean NOT NULL DEFAULT true;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'parent_accounts_voice_volume_check'
    ) THEN
        ALTER TABLE parent_accounts
        ADD CONSTRAINT parent_accounts_voice_volume_check
        CHECK (voice_volume BETWEEN 0 AND 100);
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'parent_accounts_effect_volume_check'
    ) THEN
        ALTER TABLE parent_accounts
        ADD CONSTRAINT parent_accounts_effect_volume_check
        CHECK (effect_volume BETWEEN 0 AND 100);
    END IF;
END;
$$;
