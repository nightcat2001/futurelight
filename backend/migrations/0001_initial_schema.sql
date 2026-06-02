CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TABLE parent_accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    display_name text NOT NULL,
    locale text NOT NULL DEFAULT 'en',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER parent_accounts_set_updated_at
BEFORE UPDATE ON parent_accounts
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE assets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_key text NOT NULL UNIQUE,
    asset_type text NOT NULL,
    path text,
    status text NOT NULL DEFAULT 'planned',
    source text,
    prompt_summary text,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT assets_status_check CHECK (status IN ('planned', 'draft', 'review', 'approved', 'published', 'blocked', 'archived'))
);

CREATE TRIGGER assets_set_updated_at
BEFORE UPDATE ON assets
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE children (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_account_id uuid NOT NULL REFERENCES parent_accounts(id) ON DELETE CASCADE,
    display_name text NOT NULL,
    age_band text NOT NULL,
    market_region text NOT NULL,
    english_variant text NOT NULL,
    avatar_asset_id uuid REFERENCES assets(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT children_age_band_check CHECK (age_band IN ('3-5', '6-8', '9-11')),
    CONSTRAINT children_market_region_check CHECK (market_region IN ('DE', 'UK', 'US', 'TW', 'OTHER')),
    CONSTRAINT children_english_variant_check CHECK (english_variant IN ('american', 'british'))
);

CREATE INDEX children_parent_account_id_idx ON children(parent_account_id);

CREATE TRIGGER children_set_updated_at
BEFORE UPDATE ON children
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE courses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text NOT NULL UNIQUE,
    status text NOT NULL DEFAULT 'draft',
    title text NOT NULL,
    target_language text NOT NULL,
    level text NOT NULL,
    cover_asset_id uuid REFERENCES assets(id) ON DELETE SET NULL,
    sort_order integer NOT NULL DEFAULT 0,
    published_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT courses_status_check CHECK (status IN ('draft', 'review', 'published', 'archived'))
);

CREATE INDEX courses_status_sort_order_idx ON courses(status, sort_order);

CREATE TRIGGER courses_set_updated_at
BEFORE UPDATE ON courses
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE lessons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    slug text NOT NULL,
    title text NOT NULL,
    learning_objectives jsonb NOT NULL DEFAULT '[]'::jsonb,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(course_id, slug)
);

CREATE INDEX lessons_course_id_sort_order_idx ON lessons(course_id, sort_order);

CREATE TRIGGER lessons_set_updated_at
BEFORE UPDATE ON lessons
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE activities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    slug text NOT NULL,
    activity_type text NOT NULL,
    prompt jsonb NOT NULL DEFAULT '{}'::jsonb,
    content jsonb NOT NULL DEFAULT '{}'::jsonb,
    answer_key jsonb NOT NULL DEFAULT '{}'::jsonb,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(lesson_id, slug)
);

CREATE INDEX activities_lesson_id_sort_order_idx ON activities(lesson_id, sort_order);

CREATE TRIGGER activities_set_updated_at
BEFORE UPDATE ON activities
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE learning_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id uuid REFERENCES lessons(id) ON DELETE SET NULL,
    started_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX learning_sessions_child_id_started_at_idx ON learning_sessions(child_id, started_at DESC);

CREATE TABLE attempts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    activity_id uuid NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    session_id uuid REFERENCES learning_sessions(id) ON DELETE SET NULL,
    answer jsonb NOT NULL DEFAULT '{}'::jsonb,
    is_correct boolean NOT NULL DEFAULT false,
    score numeric(5, 2) NOT NULL DEFAULT 0,
    duration_ms integer,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX attempts_child_id_created_at_idx ON attempts(child_id, created_at DESC);
CREATE INDEX attempts_activity_id_idx ON attempts(activity_id);

CREATE TABLE progress_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
    activity_id uuid REFERENCES activities(id) ON DELETE CASCADE,
    mastery_score numeric(5, 2) NOT NULL DEFAULT 0,
    attempts_count integer NOT NULL DEFAULT 0,
    last_attempt_at timestamptz,
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX progress_records_child_id_idx ON progress_records(child_id);
CREATE INDEX progress_records_course_id_idx ON progress_records(course_id);

CREATE TABLE rewards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    reward_type text NOT NULL,
    reward_key text NOT NULL,
    source_activity_id uuid REFERENCES activities(id) ON DELETE SET NULL,
    awarded_at timestamptz NOT NULL DEFAULT now(),
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    UNIQUE(child_id, reward_type, reward_key)
);

CREATE INDEX rewards_child_id_awarded_at_idx ON rewards(child_id, awarded_at DESC);

CREATE TABLE consents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_account_id uuid NOT NULL REFERENCES parent_accounts(id) ON DELETE CASCADE,
    child_id uuid REFERENCES children(id) ON DELETE CASCADE,
    consent_type text NOT NULL,
    status text NOT NULL,
    granted_at timestamptz,
    revoked_at timestamptz,
    evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT consents_status_check CHECK (status IN ('granted', 'revoked', 'expired'))
);

CREATE INDEX consents_parent_account_id_idx ON consents(parent_account_id);
CREATE INDEX consents_child_id_idx ON consents(child_id);

CREATE TRIGGER consents_set_updated_at
BEFORE UPDATE ON consents
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_parent_account_id uuid REFERENCES parent_accounts(id) ON DELETE SET NULL,
    child_id uuid REFERENCES children(id) ON DELETE SET NULL,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_logs_actor_parent_account_id_idx ON audit_logs(actor_parent_account_id);
CREATE INDEX audit_logs_child_id_created_at_idx ON audit_logs(child_id, created_at DESC);
CREATE INDEX audit_logs_entity_idx ON audit_logs(entity_type, entity_id);
