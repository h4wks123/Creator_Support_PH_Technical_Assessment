import { Router } from "express";
import { pool } from "../config/psql-db.ts";
import { logger } from "../utils/logger.ts";
import { parseSubmitResponse, validateSubmission } from "../utils/util.ts";
import {
  webhookConnectionSchema,
  type WebhookDeliveryInput,
} from "../types/webhook-types.ts";

const publicFormRoutes = Router();
const FORM_ERROR_MESSAGE = "Unable to process public form request";
const deliveryTimeoutMs = 10_000;

export const deliverWebhook = async (input: WebhookDeliveryInput) => {
  const configResult = await pool.query(
    `SELECT webhook_url, webhook_secret
     FROM webhooks
     WHERE webhook_form_id = $1 AND webhook_is_enabled = true`,
    [input.formId],
  );
  if (configResult.rowCount !== 1) return;

  const config = webhookConnectionSchema.parse(configResult.rows[0]);
  const deliveryId = crypto.randomUUID();
  let statusCode: number | null = null;
  let errorMessage: string | null = null;

  const payload = {
    form: { id: input.formId, title: input.formTitle },
    response: {
      id: input.responseId,
      email: input.email,
      submittedAt: input.submittedAt,
      answers: input.answers,
    },
  };

  try {
    const response = await fetch(config.webhook_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": config.webhook_secret,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(deliveryTimeoutMs),
    });
    statusCode = response.status;
    if (!response.ok) errorMessage = `Webhook returned HTTP ${response.status}`;
  } catch (err) {
    errorMessage =
      err instanceof Error ? err.message : "Webhook request failed";
  }

  try {
    await pool.query(
      `INSERT INTO webhook_deliveries (
         webhook_delivery_id, webhook_delivery_form_id,
         webhook_delivery_response_id, webhook_delivery_status_code,
         webhook_delivery_error_message
       ) VALUES ($1, $2, $3, $4, $5)`,
      [deliveryId, input.formId, input.responseId, statusCode, errorMessage],
    );
    logger.info(
      {
        formId: input.formId,
        responseId: input.responseId,
        statusCode,
        errorMessage,
      },
      "Webhook delivery logged",
    );
  } catch (err) {
    logger.error(
      { error: err, formId: input.formId, responseId: input.responseId },
      "Webhook delivery log write failed",
    );
  }
};

publicFormRoutes.get("/:slug", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.form_id, f.form_title, f.form_description, f.form_slug,
              q.question_id, q.question_label, q.question_type,
              q.question_order, q.question_is_required, q.question_config
       FROM forms f
       LEFT JOIN questions q
         ON q.question_form_id = f.form_id
        AND q.question_deleted_at IS NULL
       WHERE f.form_slug = $1 AND f.form_is_published = true
       ORDER BY q.question_order ASC`,
      [req.params.slug],
    );

    if (result.rowCount === 0) {
      logger.warn({ slug: req.params.slug }, "Published form was not found");
      return res.status(404).json({ message: FORM_ERROR_MESSAGE });
    }

    const first = result.rows[0];
    logger.info(
      {
        formId: first.form_id,
        slug: req.params.slug,
        questionCount: result.rows.filter((row) => row.question_id !== null)
          .length,
      },
      "Public form fetched",
    );
    return res.status(200).json({
      form: {
        form_id: first.form_id,
        form_title: first.form_title,
        form_description: first.form_description,
        form_slug: first.form_slug,
        questions: result.rows
          .filter((row) => row.question_id !== null)
          .map((row) => ({
            question_id: row.question_id,
            question_label: row.question_label,
            question_type: row.question_type,
            question_order: row.question_order,
            question_is_required: row.question_is_required,
            question_config: row.question_config,
          })),
      },
    });
  } catch (err) {
    logger.error(
      { error: err, slug: req.params.slug },
      "Public form fetch failed",
    );
    return res.status(500).json({ message: FORM_ERROR_MESSAGE });
  }
});

publicFormRoutes.post("/:slug/responses", async (req, res) => {
  const input = parseSubmitResponse(req.body);
  if (!input) {
    logger.warn(
      { slug: req.params.slug },
      "Response rejected because the submission payload is invalid",
    );
    return res.status(400).json({ message: FORM_ERROR_MESSAGE });
  }

  try {
    const formResult = await pool.query(
      `SELECT f.form_id, f.form_title, f.form_slug,
              q.question_id, q.question_label, q.question_type,
              q.question_order, q.question_is_required, q.question_config
       FROM forms f
       LEFT JOIN questions q
         ON q.question_form_id = f.form_id
        AND q.question_deleted_at IS NULL
       WHERE f.form_slug = $1 AND f.form_is_published = true
       ORDER BY q.question_order ASC`,
      [req.params.slug],
    );
    if (formResult.rowCount === 0) {
      logger.warn(
        { slug: req.params.slug },
        "Response rejected because the form is unpublished or unavailable",
      );
      return res.status(404).json({ message: FORM_ERROR_MESSAGE });
    }

    const questions = formResult.rows.filter((row) => row.question_id !== null);
    const validationFailure = validateSubmission(input, questions);
    if (validationFailure) {
      logger.warn(
        {
          formId: formResult.rows[0].form_id,
          questionId: validationFailure.questionId,
          reason: validationFailure.reason,
        },
        "Response rejected during answer validation",
      );
      return res.status(400).json({ message: FORM_ERROR_MESSAGE });
    }

    const answersById = new Map(
      input.answers.map((answer) => [answer.questionId, answer.value]),
    );

    const responseId = crypto.randomUUID();
    const answerSnapshots = questions.map((question) => ({
      answer_id: crypto.randomUUID(),
      answer_question_id: question.question_id,
      answer_question_order: question.question_order,
      answer_question_label: question.question_label,
      answer_question_type: question.question_type,
      answer_question_config: question.question_config,
      answer_value: answersById.get(question.question_id) ?? null,
    }));

    const responseResult = await pool.query(
      `WITH inserted_response AS (
         INSERT INTO responses (
           response_id, response_form_id, response_respondent_email
         )
         SELECT $1, form_id, $3
         FROM forms
         WHERE form_id = $2 AND form_is_published = true
         RETURNING response_id, response_form_id, response_respondent_email,
                   response_submitted_at
       ), inserted_answers AS (
         INSERT INTO answers (
           answer_id, answer_response_id, answer_question_id, answer_question_order,
           answer_question_label, answer_question_type, answer_question_config, answer_value
         )
         SELECT answer.answer_id, inserted_response.response_id,
                answer.answer_question_id, answer.answer_question_order,
                answer.answer_question_label, answer.answer_question_type,
                answer.answer_question_config, answer.answer_value
         FROM inserted_response
         CROSS JOIN jsonb_to_recordset($4::jsonb) AS answer(
           answer_id text,
           answer_question_id text,
           answer_question_order integer,
           answer_question_label text,
           answer_question_type smallint,
           answer_question_config jsonb,
           answer_value jsonb
         )
       )
       SELECT response_id, response_submitted_at
       FROM inserted_response`,
      [
        responseId,
        formResult.rows[0].form_id,
        input.email,
        JSON.stringify(answerSnapshots),
      ],
    );

    if (responseResult.rowCount !== 1) {
      return res.status(404).json({ message: FORM_ERROR_MESSAGE });
    }

    logger.info(
      { formId: formResult.rows[0].form_id, responseId },
      "Response submitted",
    );

    void deliverWebhook({
      formId: formResult.rows[0].form_id,
      formTitle: formResult.rows[0].form_title,
      responseId,
      email: input.email,
      submittedAt: responseResult.rows[0].response_submitted_at,
      answers: questions.map((question) => ({
        questionId: question.question_id,
        label: question.question_label,
        type:
          [
            "short_text",
            "long_text",
            "date",
            "dropdown",
            "multi_select",
            "multiple_choice",
            "checkboxes",
            "linear_scale",
          ][question.question_type - 1] ?? "unknown",
        value: answersById.get(question.question_id) ?? null,
      })),
    }).catch((err) => {
      logger.error(
        { error: err, formId: formResult.rows[0].form_id, responseId },
        "Webhook delivery failed before it could be logged",
      );
    });

    return res.status(201).send();
  } catch (err) {
    logger.error(
      { error: err, slug: req.params.slug },
      "Response submission failed",
    );
    return res.status(500).json({ message: FORM_ERROR_MESSAGE });
  }
});

export default publicFormRoutes;
