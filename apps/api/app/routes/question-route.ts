import { Router } from "express";
import type { Response } from "express";
import type { PoolClient } from "pg";
import { pool } from "../config/psql-db.ts";
import { verifyJWT } from "../middleware/auth-middleware.ts";
import type { AuthenticatedUser } from "../types/auth-types.ts";
import { logger } from "../utils/logger.ts";
import { parseCreateQuestion } from "../utils/util.ts";

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

  let client: PoolClient | null = null;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const ownership = await client.query(
      "SELECT form_id FROM forms WHERE form_id = $1 AND form_owner_id = $2 FOR UPDATE",
      [formId, getUser(res).userId],
    );
    if (ownership.rowCount !== 1) {
      await client.query("ROLLBACK");
      logger.error(
        { userId: getUser(res).userId, formId },
        "Form ownership check failed",
      );
      return res.status(404).json({ message: QUESTION_ERROR_MESSAGE });
    }

    const nextOrder = Number(
      (
        await client.query(
          `SELECT COALESCE(MAX(question_order), 0) + 1 AS next_order
           FROM questions
           WHERE question_form_id = $1 AND question_deleted_at IS NULL`,
          [formId],
        )
      ).rows[0].next_order,
    );

    const result = await client.query(
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
    await client.query("COMMIT");

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
    await client?.query("ROLLBACK").catch(() => undefined);
    logger.error(
      { error: err, userId: getUser(res).userId, formId },
      "Question creation failed",
    );
    return res.status(500).json({ message: QUESTION_ERROR_MESSAGE });
  } finally {
    client?.release();
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

  let client: PoolClient | null = null;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const ownership = await client.query(
      "SELECT form_id FROM forms WHERE form_id = $1 AND form_owner_id = $2 FOR UPDATE",
      [formId, getUser(res).userId],
    );
    if (ownership.rowCount !== 1) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: QUESTION_ERROR_MESSAGE });
    }

    const activeQuestions = await client.query(
      `SELECT question_id
       FROM questions
       WHERE question_form_id = $1 AND question_deleted_at IS NULL`,
      [formId],
    );
    const activeQuestionIds = new Set(
      activeQuestions.rows.map((question) => question.question_id),
    );
    const requestIsValid =
      questionIds.length === activeQuestionIds.size &&
      questionIds.every((questionId) => activeQuestionIds.has(questionId));

    if (!requestIsValid) {
      await client.query("ROLLBACK");
      logger.warn(
        { userId: getUser(res).userId, formId },
        "Invalid question reorder request",
      );
      return res.status(400).json({ message: QUESTION_ERROR_MESSAGE });
    }

    const maxOrderResult = await client.query(
      `SELECT COALESCE(MAX(question_order), 0) AS max_order
       FROM questions
       WHERE question_form_id = $1 AND question_deleted_at IS NULL`,
      [formId],
    );
    const orderOffset = Number(maxOrderResult.rows[0].max_order) + 1;

    await client.query(
      `UPDATE questions
       SET question_order = question_order + $2,
           question_updated_at = CURRENT_TIMESTAMP
       WHERE question_form_id = $1 AND question_deleted_at IS NULL`,
      [formId, orderOffset],
    );

    const reordered = await client.query(
      `WITH requested AS (
         SELECT question_id, question_order
         FROM unnest($1::text[]) WITH ORDINALITY
           AS requested(question_id, question_order)
       )
       UPDATE questions q
       SET question_order = requested.question_order,
           question_updated_at = CURRENT_TIMESTAMP
       FROM requested
       WHERE q.question_id = requested.question_id
         AND q.question_form_id = $2
         AND q.question_deleted_at IS NULL
       RETURNING q.question_id`,
      [questionIds, formId],
    );

    if (reordered.rowCount !== questionIds.length) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: QUESTION_ERROR_MESSAGE });
    }
    await client.query("COMMIT");

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
    await client?.query("ROLLBACK").catch(() => undefined);
    logger.error(
      { error: err, userId: getUser(res).userId, formId },
      "Question reorder failed",
    );
    return res.status(500).json({ message: QUESTION_ERROR_MESSAGE });
  } finally {
    client?.release();
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
           question_is_required = $3,
           question_config = $4,
           question_updated_at = CURRENT_TIMESTAMP
       FROM forms f
       WHERE q.question_id = $5
         AND q.question_form_id = $6
         AND q.question_form_id = f.form_id
         AND f.form_owner_id = $7
         AND q.question_deleted_at IS NULL
       RETURNING q.question_id, q.question_form_id, q.question_label,
                 q.question_type, q.question_order, q.question_is_required,
                 q.question_config, q.question_deleted_at,
                 q.question_created_at, q.question_updated_at`,
      [
        question.label,
        question.type,
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
