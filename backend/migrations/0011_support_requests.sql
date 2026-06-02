CREATE TABLE support_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_account_id uuid NOT NULL REFERENCES parent_accounts(id) ON DELETE CASCADE,
    child_id uuid REFERENCES children(id) ON DELETE SET NULL,
    request_type text NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    status text NOT NULL DEFAULT 'open',
    region text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    resolved_at timestamptz,
    CONSTRAINT support_requests_type_check CHECK (
        request_type IN (
            'data_export',
            'child_data_deletion',
            'consent',
            'content_error',
            'parent_question',
            'store_review',
            'account_access'
        )
    ),
    CONSTRAINT support_requests_status_check CHECK (
        status IN ('open', 'in_review', 'resolved', 'closed')
    ),
    CONSTRAINT support_requests_subject_length CHECK (
        char_length(subject) BETWEEN 3 AND 120
    ),
    CONSTRAINT support_requests_message_length CHECK (
        char_length(message) BETWEEN 10 AND 2000
    )
);

CREATE INDEX support_requests_parent_created_idx
ON support_requests(parent_account_id, created_at DESC);

CREATE INDEX support_requests_status_created_idx
ON support_requests(status, created_at DESC);

CREATE TRIGGER support_requests_set_updated_at
BEFORE UPDATE ON support_requests
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
