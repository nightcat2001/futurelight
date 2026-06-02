CREATE TABLE parent_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_account_id uuid NOT NULL REFERENCES parent_accounts(id) ON DELETE CASCADE,
    token_hash text NOT NULL UNIQUE,
    expires_at timestamptz NOT NULL,
    revoked_at timestamptz,
    last_used_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX parent_sessions_parent_account_id_idx ON parent_sessions(parent_account_id);
CREATE INDEX parent_sessions_token_hash_idx ON parent_sessions(token_hash);
CREATE INDEX parent_sessions_expires_at_idx ON parent_sessions(expires_at);
