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

export default questionRoutes;
