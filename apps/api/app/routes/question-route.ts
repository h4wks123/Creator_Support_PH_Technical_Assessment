import { Router } from "express";
import type { Response } from "express";
import { pool } from "../config/psql-db.ts";
import { verifyJWT } from "../middleware/auth-middleware.ts";
import type { AuthenticatedUser } from "../types/auth-types.ts";
import { parseCreateQuestion } from "../utils/form-validation.ts";
import { logger } from "../utils/logger.ts";

const questionRoutes = Router();
const QUESTION_ERROR_MESSAGE = "Unable to process question request";

const getUser = (res: Response) => res.locals.user as AuthenticatedUser;
questionRoutes.use(verifyJWT);

questionRoutes.get("/:formId/questions", async (req, res) => {
  const { formId } = req.params;

  try {
    const result = await pool.query(
      `SELECT q.question_id, q.question_form_id, q.question_label,
              q.question_type, q.question_order, q.question_is_required,
              q.question_config, q.question_deleted_at,
              q.question_created_at, q.question_updated_at
       FROM questions q
       INNER JOIN forms f ON f.form_id = q.question_form_id
       WHERE q.question_form_id = $1
         AND f.form_owner_id = $2
         AND q.question_deleted_at IS NULL
       ORDER BY q.question_order ASC`,
      [formId, getUser(res).userId],
    );

    const form = await pool.query(
      "SELECT form_id FROM forms WHERE form_id = $1 AND form_owner_id = $2",
      [formId, getUser(res).userId],
    );

    if (form.rowCount !== 1) {
      logger.warn(
        { userId: getUser(res).userId, formId },
        "Questions requested for an unavailable form",
      );
      return res.status(404).json({ message: QUESTION_ERROR_MESSAGE });
    }

    logger.info(
      { userId: getUser(res).userId, formId, questionCount: result.rowCount },
      "Questions fetched",
    );

    return res.status(200).json({ questions: result.rows });
  } catch (err) {
    logger.error(
      { error: err, userId: getUser(res).userId, formId },
      "Questions fetch failed",
    );
    return res.status(500).json({ message: QUESTION_ERROR_MESSAGE });
  }
});

questionRoutes.post("/:formId/questions", async (req, res) => {
  const { formId } = req.params;
  const question = parseCreateQuestion(req.body);

  if (!formId || !question) {
    logger.error(
      { userId: getUser(res).userId, formId },
      "Invalid question creation payload",
    );
    return res.status(400).json({ message: QUESTION_ERROR_MESSAGE });
  }

  try {
    const ownership = await pool.query(
      "SELECT form_id FROM forms WHERE form_id = $1 AND form_owner_id = $2",
      [formId, getUser(res).userId],
    );
    if (ownership.rowCount !== 1) {
      logger.error(
        { userId: getUser(res).userId, formId },
        "Form ownership check failed",
      );
      return res.status(404).json({ message: QUESTION_ERROR_MESSAGE });
    }

    const nextOrder =
      question.order === undefined
        ? Number(
            (
              await pool.query(
                `SELECT COALESCE(MAX(question_order), 0) + 1 AS next_order
                 FROM questions
                 WHERE question_form_id = $1 AND question_deleted_at IS NULL`,
                [formId],
              )
            ).rows[0].next_order,
          )
        : question.order;

    const result = await pool.query(
      `INSERT INTO questions (
         question_id, question_form_id, question_label, question_type,
         question_order, question_is_required, question_config
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING question_id, question_form_id, question_label, question_type,
                 question_order, question_is_required, question_config,
                 question_deleted_at, question_created_at, question_updated_at`,
      [
        crypto.randomUUID(),
        formId,
        question.label,
        question.type,
        nextOrder,
        question.required,
        question.config,
      ],
    );

    logger.info(
      {
        userId: getUser(res).userId,
        formId,
        questionId: result.rows[0].question_id,
      },
      "Question created",
    );
    return res.status(201).json({ question: result.rows[0] });
  } catch (err) {
    logger.error(
      { error: err, userId: getUser(res).userId, formId },
      "Question creation failed",
    );
    return res.status(500).json({ message: QUESTION_ERROR_MESSAGE });
  }
});

questionRoutes.patch("/:formId/questions/reorder", async (req, res) => {
  const { formId } = req.params;
  const questionIds = req.body?.questionIds;

  if (
    !Array.isArray(questionIds) ||
    questionIds.length === 0 ||
    questionIds.some((questionId) => typeof questionId !== "string") ||
    new Set(questionIds).size !== questionIds.length
  ) {
    return res.status(400).json({ message: QUESTION_ERROR_MESSAGE });
  }

  try {
    const reordered = await pool.query(
      `WITH requested AS (
         SELECT question_id, question_order
         FROM unnest($1::text[]) WITH ORDINALITY
           AS requested(question_id, question_order)
       ),
       active_questions AS (
         SELECT q.question_id
         FROM questions q
         INNER JOIN forms f ON f.form_id = q.question_form_id
         WHERE q.question_form_id = $2
           AND q.question_deleted_at IS NULL
           AND f.form_owner_id = $3
       ),
       valid_request AS (
         SELECT
           (SELECT COUNT(*) FROM requested) =
             (SELECT COUNT(*) FROM active_questions)
           AND NOT EXISTS (
             SELECT 1
             FROM requested r
             WHERE NOT EXISTS (
               SELECT 1
               FROM active_questions a
               WHERE a.question_id = r.question_id
             )
           ) AS is_valid
       )
       UPDATE questions q
       SET question_order = requested.question_order,
           question_updated_at = CURRENT_TIMESTAMP
       FROM requested, valid_request
       WHERE valid_request.is_valid
         AND q.question_id = requested.question_id
         AND q.question_form_id = $2
         AND q.question_deleted_at IS NULL
       RETURNING q.question_id`,
      [questionIds, formId, getUser(res).userId],
    );

    if (reordered.rowCount !== questionIds.length) {
      logger.warn(
        { userId: getUser(res).userId, formId },
        "Invalid question reorder request",
      );
      return res.status(400).json({ message: QUESTION_ERROR_MESSAGE });
    }

    logger.info(
      {
        userId: getUser(res).userId,
        formId,
        questionCount: questionIds.length,
      },
      "Questions reordered",
    );
    return res.status(200).json({ questionIds });
  } catch (err) {
    logger.error(
      { error: err, userId: getUser(res).userId, formId },
      "Question reorder failed",
    );
    return res.status(500).json({ message: QUESTION_ERROR_MESSAGE });
  }
});

questionRoutes.patch("/:formId/questions/:questionId", async (req, res) => {
  const { formId, questionId } = req.params;
  const question = parseCreateQuestion(req.body);

  if (!question) {
    logger.warn(
      { userId: getUser(res).userId, formId, questionId },
      "Invalid question update payload",
    );
    return res.status(400).json({ message: QUESTION_ERROR_MESSAGE });
  }

  try {
    const result = await pool.query(
      `UPDATE questions q
       SET question_label = $1,
           question_type = $2,
           question_order = $3,
           question_is_required = $4,
           question_config = $5,
           question_updated_at = CURRENT_TIMESTAMP
       FROM forms f
       WHERE q.question_id = $6
         AND q.question_form_id = $7
         AND q.question_form_id = f.form_id
         AND f.form_owner_id = $8
         AND q.question_deleted_at IS NULL
       RETURNING q.question_id, q.question_form_id, q.question_label,
                 q.question_type, q.question_order, q.question_is_required,
                 q.question_config, q.question_deleted_at,
                 q.question_created_at, q.question_updated_at`,
      [
        question.label,
        question.type,
        question.order,
        question.required,
        question.config,
        questionId,
        formId,
        getUser(res).userId,
      ],
    );

    if (result.rowCount !== 1) {
      logger.warn(
        { userId: getUser(res).userId, formId, questionId },
        "Question update requested for an unavailable question",
      );
      return res.status(404).json({ message: QUESTION_ERROR_MESSAGE });
    }

    logger.info(
      { userId: getUser(res).userId, formId, questionId },
      "Question updated",
    );
    return res.status(200).json({ question: result.rows[0] });
  } catch (err) {
    logger.error(
      { error: err, userId: getUser(res).userId, formId, questionId },
      "Question update failed",
    );
    return res.status(500).json({ message: QUESTION_ERROR_MESSAGE });
  }
});

questionRoutes.delete("/:formId/questions/:questionId", async (req, res) => {
  const { formId, questionId } = req.params;

  try {
    const result = await pool.query(
      `UPDATE questions q
       SET question_deleted_at = CURRENT_TIMESTAMP,
           question_updated_at = CURRENT_TIMESTAMP
       FROM forms f
       WHERE q.question_id = $1
         AND q.question_form_id = $2
         AND q.question_form_id = f.form_id
         AND f.form_owner_id = $3
         AND q.question_deleted_at IS NULL
       RETURNING q.question_id`,
      [questionId, formId, getUser(res).userId],
    );

    if (result.rowCount !== 1) {
      logger.warn(
        { userId: getUser(res).userId, formId, questionId },
        "Question delete requested for an unavailable question",
      );
      return res.status(404).json({ message: QUESTION_ERROR_MESSAGE });
    }

    logger.info(
      { userId: getUser(res).userId, formId, questionId },
      "Question deleted",
    );
    return res.status(200).json({ questionId });
  } catch (err) {
    logger.error(
      { error: err, userId: getUser(res).userId, formId, questionId },
      "Question deletion failed",
    );
    return res.status(500).json({ message: QUESTION_ERROR_MESSAGE });
  }
});

export default questionRoutes;
