\set ON_ERROR_STOP on
\if :{?seed_webhook_secret}
\else
\set seed_webhook_secret 'development-secret'
\endif

BEGIN;

-- Both seed users can sign in with: SeedPass1!
INSERT INTO users (
    user_id,
    user_name,
    user_email,
    user_password_hash,
    user_created_at,
    user_updated_at
)
VALUES
    (
        'seed-user-alex',
        'Alex Rivera',
        'alex.seed@forms-app.test',
        '$2b$10$OvMko14yvWBJNgt4Bxw/DODjXYEAAwDsp9JgWr.FaX4YvPwRnony2',
        '2026-09-01T08:00:00Z',
        '2026-09-01T08:00:00Z'
    ),
    (
        'seed-user-sam',
        'Sam Chen',
        'sam.seed@forms-app.test',
        '$2b$10$vz5eZi8IFNLF54xtNfYXv.VPdh1POhMEvYcvxB5V4RClzTAS/Xg5i',
        '2026-09-01T08:05:00Z',
        '2026-09-01T08:05:00Z'
    )
ON CONFLICT (user_id) DO UPDATE SET
    user_name = EXCLUDED.user_name,
    user_email = EXCLUDED.user_email,
    user_password_hash = EXCLUDED.user_password_hash,
    user_updated_at = EXCLUDED.user_updated_at;

INSERT INTO forms (
    form_id,
    form_owner_id,
    form_title,
    form_description,
    form_slug,
    form_is_published,
    form_published_at,
    form_created_at,
    form_updated_at
)
VALUES
    (
        'seed-form-onboarding',
        'seed-user-alex',
        'Creator Onboarding Survey',
        'A published form demonstrating every supported question type.',
        'seed-creator-onboarding',
        true,
        '2026-09-02T09:00:00Z',
        '2026-09-01T09:00:00Z',
        '2026-09-02T09:00:00Z'
    ),
    (
        'seed-form-application',
        'seed-user-alex',
        'Creator Program Application',
        'Draft application for the next creator cohort.',
        'seed-creator-application',
        false,
        NULL,
        '2026-09-02T10:00:00Z',
        '2026-09-02T10:00:00Z'
    ),
    (
        'seed-form-event-feedback',
        'seed-user-sam',
        'Community Event Feedback',
        'Post-event feedback from community attendees.',
        'seed-community-feedback',
        true,
        '2026-09-04T12:00:00Z',
        '2026-09-03T12:00:00Z',
        '2026-09-04T12:00:00Z'
    ),
    (
        'seed-form-research',
        'seed-user-sam',
        'Creator Research Intake',
        NULL,
        'seed-creator-research',
        false,
        NULL,
        '2026-09-05T13:00:00Z',
        '2026-09-05T13:00:00Z'
    )
ON CONFLICT (form_id) DO UPDATE SET
    form_owner_id = EXCLUDED.form_owner_id,
    form_title = EXCLUDED.form_title,
    form_description = EXCLUDED.form_description,
    form_slug = EXCLUDED.form_slug,
    form_is_published = EXCLUDED.form_is_published,
    form_published_at = EXCLUDED.form_published_at,
    form_updated_at = EXCLUDED.form_updated_at;

INSERT INTO questions (
    question_id,
    question_form_id,
    question_label,
    question_type,
    question_order,
    question_is_required,
    question_config,
    question_deleted_at,
    question_created_at,
    question_updated_at
)
VALUES
    (
        'seed-question-name',
        'seed-form-onboarding',
        'Display name',
        1,
        1,
        true,
        '{}'::jsonb,
        NULL,
        '2026-09-01T09:10:00Z',
        '2026-09-01T09:10:00Z'
    ),
    (
        'seed-question-bio',
        'seed-form-onboarding',
        'Tell us about your creative work',
        2,
        2,
        false,
        '{}'::jsonb,
        NULL,
        '2026-09-01T09:11:00Z',
        '2026-09-01T09:11:00Z'
    ),
    (
        'seed-question-start-date',
        'seed-form-onboarding',
        'Preferred start date',
        3,
        3,
        true,
        '{}'::jsonb,
        NULL,
        '2026-09-01T09:12:00Z',
        '2026-09-01T09:12:00Z'
    ),
    (
        'seed-question-role',
        'seed-form-onboarding',
        'Primary role',
        4,
        4,
        true,
        '{"options":["Creator","Designer","Engineer","Community Manager"]}'::jsonb,
        NULL,
        '2026-09-01T09:13:00Z',
        '2026-09-01T09:13:00Z'
    ),
    (
        'seed-question-tools',
        'seed-form-onboarding',
        'Tools you use',
        5,
        5,
        false,
        '{"options":["Canva","Figma","Notion","Adobe Creative Cloud"]}'::jsonb,
        NULL,
        '2026-09-01T09:14:00Z',
        '2026-09-01T09:14:00Z'
    ),
    (
        'seed-question-work-style',
        'seed-form-onboarding',
        'Preferred work arrangement',
        6,
        6,
        true,
        '{"options":["Remote","Hybrid","On-site"]}'::jsonb,
        NULL,
        '2026-09-01T09:15:00Z',
        '2026-09-01T09:15:00Z'
    ),
    (
        'seed-question-interests',
        'seed-form-onboarding',
        'Topics you are interested in',
        7,
        7,
        false,
        '{"options":["Brand partnerships","Community building","Content strategy","Analytics"]}'::jsonb,
        NULL,
        '2026-09-01T09:16:00Z',
        '2026-09-01T09:16:00Z'
    ),
    (
        'seed-question-confidence',
        'seed-form-onboarding',
        'How confident are you about joining?',
        8,
        8,
        true,
        '{"min":1,"max":10,"minLabel":"Not confident","maxLabel":"Very confident"}'::jsonb,
        NULL,
        '2026-09-01T09:17:00Z',
        '2026-09-01T09:17:00Z'
    ),
    (
        'seed-question-portfolio',
        'seed-form-application',
        'Portfolio URL',
        1,
        1,
        true,
        '{}'::jsonb,
        NULL,
        '2026-09-02T10:10:00Z',
        '2026-09-02T10:10:00Z'
    ),
    (
        'seed-question-experience',
        'seed-form-application',
        'Years of creator experience',
        4,
        2,
        true,
        '{"options":["Less than 1 year","1-3 years","4-6 years","7+ years"]}'::jsonb,
        NULL,
        '2026-09-02T10:11:00Z',
        '2026-09-02T10:11:00Z'
    ),
    (
        'seed-question-event-rating',
        'seed-form-event-feedback',
        'Overall event rating',
        8,
        1,
        true,
        '{"min":1,"max":5,"minLabel":"Poor","maxLabel":"Excellent"}'::jsonb,
        NULL,
        '2026-09-03T12:10:00Z',
        '2026-09-03T12:10:00Z'
    ),
    (
        'seed-question-event-comments',
        'seed-form-event-feedback',
        'What should we improve?',
        2,
        2,
        false,
        '{}'::jsonb,
        NULL,
        '2026-09-03T12:11:00Z',
        '2026-09-03T12:11:00Z'
    ),
    (
        'seed-question-research-consent',
        'seed-form-research',
        'May we contact you for an interview?',
        6,
        1,
        true,
        '{"options":["Yes","No"]}'::jsonb,
        NULL,
        '2026-09-05T13:10:00Z',
        '2026-09-05T13:10:00Z'
    )
ON CONFLICT (question_id) DO UPDATE SET
    question_form_id = EXCLUDED.question_form_id,
    question_label = EXCLUDED.question_label,
    question_type = EXCLUDED.question_type,
    question_order = EXCLUDED.question_order,
    question_is_required = EXCLUDED.question_is_required,
    question_config = EXCLUDED.question_config,
    question_deleted_at = NULL,
    question_updated_at = EXCLUDED.question_updated_at;

INSERT INTO responses (
    response_id,
    response_form_id,
    response_respondent_email,
    response_submitted_at
)
VALUES
    (
        'seed-response-1',
        'seed-form-onboarding',
        'jamie@example.com',
        '2026-09-06T01:15:00Z'
    ),
    (
        'seed-response-2',
        'seed-form-onboarding',
        'mika@example.com',
        '2026-09-06T02:30:00Z'
    ),
    (
        'seed-response-3',
        'seed-form-onboarding',
        'priya@example.com',
        '2026-09-07T04:45:00Z'
    ),
    (
        'seed-response-4',
        'seed-form-onboarding',
        'jamie@example.com',
        '2026-09-08T06:00:00Z'
    )
ON CONFLICT (response_id) DO UPDATE SET
    response_form_id = EXCLUDED.response_form_id,
    response_respondent_email = EXCLUDED.response_respondent_email,
    response_submitted_at = EXCLUDED.response_submitted_at;

WITH seeded_answers (
    answer_id,
    response_id,
    question_id,
    answer_value
) AS (
    VALUES
        ('seed-answer-1-name', 'seed-response-1', 'seed-question-name', to_jsonb('Jamie Cruz'::text)),
        ('seed-answer-1-bio', 'seed-response-1', 'seed-question-bio', to_jsonb('I create educational videos for first-time freelancers.'::text)),
        ('seed-answer-1-date', 'seed-response-1', 'seed-question-start-date', to_jsonb('2026-10-01'::text)),
        ('seed-answer-1-role', 'seed-response-1', 'seed-question-role', to_jsonb('Creator'::text)),
        ('seed-answer-1-tools', 'seed-response-1', 'seed-question-tools', to_jsonb(ARRAY['Canva', 'Notion']::text[])),
        ('seed-answer-1-work', 'seed-response-1', 'seed-question-work-style', to_jsonb('Remote'::text)),
        ('seed-answer-1-interests', 'seed-response-1', 'seed-question-interests', to_jsonb(ARRAY['Brand partnerships', 'Analytics']::text[])),
        ('seed-answer-1-confidence', 'seed-response-1', 'seed-question-confidence', to_jsonb(9)),

        ('seed-answer-2-name', 'seed-response-2', 'seed-question-name', to_jsonb('Mika Santos'::text)),
        ('seed-answer-2-bio', 'seed-response-2', 'seed-question-bio', 'null'::jsonb),
        ('seed-answer-2-date', 'seed-response-2', 'seed-question-start-date', to_jsonb('2026-10-15'::text)),
        ('seed-answer-2-role', 'seed-response-2', 'seed-question-role', to_jsonb('Designer'::text)),
        ('seed-answer-2-tools', 'seed-response-2', 'seed-question-tools', to_jsonb(ARRAY['Figma', 'Adobe Creative Cloud']::text[])),
        ('seed-answer-2-work', 'seed-response-2', 'seed-question-work-style', to_jsonb('Hybrid'::text)),
        ('seed-answer-2-interests', 'seed-response-2', 'seed-question-interests', to_jsonb(ARRAY[]::text[])),
        ('seed-answer-2-confidence', 'seed-response-2', 'seed-question-confidence', to_jsonb(8)),

        ('seed-answer-3-name', 'seed-response-3', 'seed-question-name', to_jsonb('Priya Nair'::text)),
        ('seed-answer-3-bio', 'seed-response-3', 'seed-question-bio', to_jsonb('Community manager focused on sustainable creator communities.'::text)),
        ('seed-answer-3-date', 'seed-response-3', 'seed-question-start-date', to_jsonb('2026-11-01'::text)),
        ('seed-answer-3-role', 'seed-response-3', 'seed-question-role', to_jsonb('Community Manager'::text)),
        ('seed-answer-3-tools', 'seed-response-3', 'seed-question-tools', to_jsonb(ARRAY['Notion']::text[])),
        ('seed-answer-3-work', 'seed-response-3', 'seed-question-work-style', to_jsonb('Remote'::text)),
        ('seed-answer-3-interests', 'seed-response-3', 'seed-question-interests', to_jsonb(ARRAY['Community building', 'Content strategy']::text[])),
        ('seed-answer-3-confidence', 'seed-response-3', 'seed-question-confidence', to_jsonb(10)),

        ('seed-answer-4-name', 'seed-response-4', 'seed-question-name', to_jsonb('Jamie Cruz'::text)),
        ('seed-answer-4-bio', 'seed-response-4', 'seed-question-bio', to_jsonb('Following up with an updated availability date.'::text)),
        ('seed-answer-4-date', 'seed-response-4', 'seed-question-start-date', to_jsonb('2026-11-15'::text)),
        ('seed-answer-4-role', 'seed-response-4', 'seed-question-role', to_jsonb('Creator'::text)),
        ('seed-answer-4-tools', 'seed-response-4', 'seed-question-tools', to_jsonb(ARRAY['Canva', 'Figma', 'Notion']::text[])),
        ('seed-answer-4-work', 'seed-response-4', 'seed-question-work-style', to_jsonb('On-site'::text)),
        ('seed-answer-4-interests', 'seed-response-4', 'seed-question-interests', to_jsonb(ARRAY['Content strategy']::text[])),
        ('seed-answer-4-confidence', 'seed-response-4', 'seed-question-confidence', to_jsonb(7))
)
INSERT INTO answers (
    answer_id,
    answer_response_id,
    answer_question_id,
    answer_question_order,
    answer_question_label,
    answer_question_type,
    answer_question_config,
    answer_value
)
SELECT
    seeded_answers.answer_id,
    seeded_answers.response_id,
    questions.question_id,
    questions.question_order,
    questions.question_label,
    questions.question_type,
    questions.question_config,
    seeded_answers.answer_value
FROM seeded_answers
INNER JOIN questions
    ON questions.question_id = seeded_answers.question_id
ON CONFLICT (answer_id) DO UPDATE SET
    answer_response_id = EXCLUDED.answer_response_id,
    answer_question_id = EXCLUDED.answer_question_id,
    answer_question_order = EXCLUDED.answer_question_order,
    answer_question_label = EXCLUDED.answer_question_label,
    answer_question_type = EXCLUDED.answer_question_type,
    answer_question_config = EXCLUDED.answer_question_config,
    answer_value = EXCLUDED.answer_value;

INSERT INTO webhooks (
    webhook_id,
    webhook_form_id,
    webhook_url,
    webhook_secret,
    webhook_is_enabled,
    webhook_created_at,
    webhook_updated_at
)
VALUES (
    'seed-webhook-onboarding',
    'seed-form-onboarding',
    'http://webhook-consumer:4000/webhook',
    :'seed_webhook_secret',
    true,
    '2026-09-02T09:05:00Z',
    '2026-09-02T09:05:00Z'
)
ON CONFLICT (webhook_form_id) DO UPDATE SET
    webhook_url = EXCLUDED.webhook_url,
    webhook_secret = EXCLUDED.webhook_secret,
    webhook_is_enabled = EXCLUDED.webhook_is_enabled,
    webhook_updated_at = EXCLUDED.webhook_updated_at;

COMMIT;
