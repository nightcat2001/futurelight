CREATE TABLE data_export_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_account_id uuid NOT NULL REFERENCES parent_accounts(id) ON DELETE CASCADE,
    child_id uuid REFERENCES children(id) ON DELETE SET NULL,
    status text NOT NULL,
    scope text NOT NULL,
    requested_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz,
    expires_at timestamptz,
    package_format_version integer,
    download_available boolean NOT NULL DEFAULT false,
    audit_log_id uuid REFERENCES audit_logs(id) ON DELETE SET NULL,
    error_code text,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    CONSTRAINT data_export_requests_status_check CHECK (
        status IN ('queued', 'completed', 'failed', 'expired')
    ),
    CONSTRAINT data_export_requests_scope_check CHECK (scope IN ('parent_account', 'child'))
);

CREATE INDEX data_export_requests_parent_requested_idx
ON data_export_requests(parent_account_id, requested_at DESC);

CREATE INDEX data_export_requests_child_requested_idx
ON data_export_requests(child_id, requested_at DESC);
