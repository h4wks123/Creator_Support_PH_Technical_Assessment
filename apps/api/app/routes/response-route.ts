import { Router, type Request, type Response } from "express";
import { pool } from "../config/psql-db.ts";
import { verifyJWT } from "../middleware/auth-middleware.ts";
import type { AuthenticatedUser } from "../types/auth-types.ts";
import { logger } from "../utils/logger.ts";
import * as XLSX from "xlsx";

const responseRoutes = Router();
const RESPONSE_ERROR_MESSAGE = "Unable to process response request";

responseRoutes.use(verifyJWT);

responseRoutes.get("/:formId/responses/export", exportResponses);

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

async function exportResponses(req: Request, res: Response) {
  const user = res.locals.user as AuthenticatedUser;
  const { formId } = req.params;

  try {
    const formResult = await pool.query(
      `SELECT form_id, form_slug
       FROM forms
       WHERE form_id = $1 AND form_owner_id = $2`,
      [formId, user.userId],
    );

    if (formResult.rowCount !== 1) {
      return res.status(404).json({ message: RESPONSE_ERROR_MESSAGE });
    }

    const [questionsResult, responsesResult] = await Promise.all([
      pool.query(
        `SELECT question_id, question_label, question_order
         FROM questions
         WHERE question_form_id = $1
         ORDER BY question_order`,
        [formId],
      ),
      pool.query(
        `SELECT r.response_id,
                r.response_respondent_email,
                r.response_submitted_at,
                a.answer_question_id,
                a.answer_question_label,
                a.answer_question_order,
                a.answer_value
         FROM responses r
         LEFT JOIN answers a ON a.answer_response_id = r.response_id
         WHERE r.response_form_id = $1
         ORDER BY r.response_submitted_at DESC, a.answer_question_order`,
        [formId],
      ),
    ]);

    const questions = questionsResult.rows as Array<{
      question_id: string;
      question_label: string;
      question_order: number;
    }>;
    const questionColumns = new Map(
      questions.map((question) => [question.question_id, question.question_label]),
    );
    const responseRows = new Map<
      string,
      { email: string; submittedAt: string; answers: Map<string, unknown> }
    >();

    for (const row of responsesResult.rows) {
      const responseKey = row.response_id;
      const response = responseRows.get(responseKey) ?? {
        email: row.response_respondent_email,
        submittedAt: row.response_submitted_at,
        answers: new Map<string, unknown>(),
      };

      if (row.answer_question_id) {
        response.answers.set(row.answer_question_id, row.answer_value);
      }
      responseRows.set(responseKey, response);
    }

    const rows = Array.from(responseRows.values()).map((response) => {
      const row: Record<string, unknown> = {
        email: response.email,
        "submitted-at": response.submittedAt,
      };

      for (const [questionId, label] of questionColumns) {
        const value = response.answers.get(questionId);
        row[label] = Array.isArray(value) ? value.join(", ") : (value ?? "");
      }
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows, {
      header: [
        "email",
        "submitted-at",
        ...questions.map((question) => question.question_label),
      ],
    });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Responses");
    const file = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    res.status(200);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${formResult.rows[0].form_slug}-responses.xlsx"`,
    );
    logger.info(
      { userId: user.userId, formId, responseCount: responseRows.size },
      "Form responses exported",
    );
    return res.end(file);
  } catch (err) {
    logger.error(
      { error: err, userId: user.userId, formId },
      "Form responses export failed",
    );
    return res.status(500).json({ message: RESPONSE_ERROR_MESSAGE });
  }
}

export default responseRoutes;
