CREATE TABLE IF NOT EXISTS users (
    user_id text NOT NULL PRIMARY KEY,
    user_name text NOT NULL DEFAULT '',
    user_email text NOT NULL UNIQUE,
    user_password_hash text NOT NULL DEFAULT '',
    user_created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS forms (
    form_id text NOT NULL PRIMARY KEY,
    form_owner_id text NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
    form_title text NOT NULL DEFAULT 'Untitled form',
    form_description text,
    form_slug text NOT NULL UNIQUE,
    form_is_published boolean NOT NULL DEFAULT false,
    form_published_at timestamptz,
    form_created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    form_updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT forms_title_not_blank CHECK (length(btrim(form_title)) > 0),
    CONSTRAINT forms_published_at_consistent CHECK (
        (form_is_published AND form_published_at IS NOT NULL)
        OR (NOT form_is_published AND form_published_at IS NULL)
    )
);

CREATE TABLE IF NOT EXISTS questions (
    question_id text NOT NULL PRIMARY KEY,
    question_form_id text NOT NULL REFERENCES forms (form_id) ON DELETE CASCADE,
    question_label text NOT NULL,
    -- 1 short_text, 2 long_text, 3 date, 4 dropdown,
    -- 5 multi_select, 6 multiple_choice, 7 checkboxes, 8 linear_scale.
    question_type smallint NOT NULL,
    question_order integer NOT NULL,
    question_is_required boolean NOT NULL DEFAULT false,
    -- Extra settings that varies by question type
    question_config jsonb NOT NULL DEFAULT '{}'::jsonb,
    question_deleted_at timestamptz,
    question_created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    question_updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT questions_label_not_blank CHECK (length(btrim(question_label)) > 0),
    CONSTRAINT questions_order_positive CHECK (question_order > 0),
    CONSTRAINT questions_type_supported CHECK (question_type BETWEEN 1 AND 8),
    CONSTRAINT questions_config_object CHECK (jsonb_typeof(question_config) = 'object')
);


CREATE TABLE IF NOT EXISTS responses (
    response_id text NOT NULL PRIMARY KEY,
    response_form_id text NOT NULL REFERENCES forms (form_id) ON DELETE CASCADE,
    response_respondent_email text NOT NULL,
    response_submitted_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT responses_email_not_blank CHECK (length(btrim(response_respondent_email)) > 0)
);

CREATE TABLE IF NOT EXISTS answers (
    answer_id text NOT NULL PRIMARY KEY,
    answer_response_id text NOT NULL REFERENCES responses (response_id) ON DELETE CASCADE,
    answer_question_id text REFERENCES questions (question_id) ON DELETE SET NULL,
    answer_question_order integer NOT NULL,
    answer_question_label text NOT NULL,
    -- 1 short_text, 2 long_text, 3 date, 4 dropdown,
    -- 5 multi_select, 6 multiple_choice, 7 checkboxes, 8 linear_scale.
    answer_question_type smallint NOT NULL,
    -- Extra settings that varies by question type
    answer_question_config jsonb NOT NULL DEFAULT '{}'::jsonb,
    answer_value jsonb,
    CONSTRAINT answers_order_positive CHECK (answer_question_order > 0),
    CONSTRAINT answers_type_supported CHECK (answer_question_type BETWEEN 1 AND 8),
    CONSTRAINT answers_config_object CHECK (jsonb_typeof(answer_question_config) = 'object'),
    CONSTRAINT answers_label_not_blank CHECK (length(btrim(answer_question_label)) > 0),
    CONSTRAINT answers_response_question_unique UNIQUE (answer_response_id, answer_question_id)
);

CREATE INDEX IF NOT EXISTS forms_owner_id_idx ON forms (form_owner_id);
CREATE INDEX IF NOT EXISTS responses_form_submitted_idx
    ON responses (response_form_id, response_submitted_at DESC);
CREATE INDEX IF NOT EXISTS answers_response_order_idx
    ON answers (answer_response_id, answer_question_order);
