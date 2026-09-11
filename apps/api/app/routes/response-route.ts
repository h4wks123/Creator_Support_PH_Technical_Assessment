import { Router } from "express";
import { pool } from "../config/psql-db.ts";
import { verifyJWT } from "../middleware/auth-middleware.ts";
import type { AuthenticatedUser } from "../types/auth-types.ts";
import { logger } from "../utils/logger.ts";

const responseRoutes = Router();
const RESPONSE_ERROR_MESSAGE = "Unable to process response request";

responseRoutes.use(verifyJWT);

responseRoutes.get("/:formId/responses/:responseId", async (req, res) => {
  const user = res.locals.user as AuthenticatedUser;
  const { formId, responseId } = req.params;

  try {
    const result = await pool.query(
      `SELECT r.response_id, r.response_respondent_email,
              r.response_submitted_at,
              COALESCE(
                jsonb_agg(
                  jsonb_build_object(
                    'questionId', a.answer_question_id,
                    'label', a.answer_question_label,
                    'type', a.answer_question_type,
                    'order', a.answer_question_order,
                    'value', a.answer_value
                  ) ORDER BY a.answer_question_order
                ) FILTER (WHERE a.answer_id IS NOT NULL),
                '[]'::jsonb
              ) AS answers
       FROM responses r
       INNER JOIN forms f ON f.form_id = r.response_form_id
       LEFT JOIN answers a ON a.answer_response_id = r.response_id
       WHERE r.response_form_id = $1
         AND r.response_id = $2
         AND f.form_owner_id = $3
       GROUP BY r.response_id`,
      [formId, responseId, user.userId],
    );

    if (result.rowCount !== 1) {
      return res.status(404).json({ message: RESPONSE_ERROR_MESSAGE });
    }

    return res.status(200).json({ response: result.rows[0] });
  } catch (err) {
    logger.error(
      { error: err, userId: user.userId, formId, responseId },
      "Individual form response fetch failed",
    );
    return res.status(500).json({ message: RESPONSE_ERROR_MESSAGE });
  }
});

responseRoutes.get("/:formId/responses", async (req, res) => {
  const user = res.locals.user as AuthenticatedUser;
  const { formId } = req.params;

  try {
    const result = await pool.query(
      `SELECT r.response_id, r.response_respondent_email,
              r.response_submitted_at,
              COALESCE(
                jsonb_agg(
                  jsonb_build_object(
                    'questionId', a.answer_question_id,
                    'label', a.answer_question_label,
                    'type', a.answer_question_type,
                    'order', a.answer_question_order,
                    'value', a.answer_value
                  ) ORDER BY a.answer_question_order
                ) FILTER (WHERE a.answer_id IS NOT NULL),
                '[]'::jsonb
              ) AS answers
       FROM responses r
       INNER JOIN forms f ON f.form_id = r.response_form_id
       LEFT JOIN answers a ON a.answer_response_id = r.response_id
       WHERE r.response_form_id = $1 AND f.form_owner_id = $2
       GROUP BY r.response_id
       ORDER BY r.response_submitted_at DESC`,
      [formId, user.userId],
    );

    logger.info(
      { userId: user.userId, formId, responseCount: result.rowCount },
      "Form responses fetched",
    );
    return res.status(200).json({ responses: result.rows });
  } catch (err) {
    logger.error(
      { error: err, userId: user.userId, formId },
      "Form responses fetch failed",
    );
    return res.status(500).json({ message: RESPONSE_ERROR_MESSAGE });
  }
});

export default responseRoutes;
