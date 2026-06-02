ALTER TABLE parent_accounts
ADD COLUMN IF NOT EXISTS is_content_admin boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS content_versions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    action text NOT NULL,
    actor_parent_account_id uuid REFERENCES parent_accounts(id) ON DELETE SET NULL,
    snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT content_versions_entity_type_check CHECK (
        entity_type IN ('course', 'lesson', 'activity', 'asset')
    ),
    CONSTRAINT content_versions_action_check CHECK (
        action IN ('create', 'update', 'archive', 'delete', 'publish_check', 'publish')
    )
);

CREATE INDEX IF NOT EXISTS content_versions_entity_idx
ON content_versions(entity_type, entity_id, created_at DESC);

CREATE INDEX IF NOT EXISTS content_versions_actor_idx
ON content_versions(actor_parent_account_id, created_at DESC);
