import { Router } from "express";
import type { Response } from "express";
import { pool } from "../config/psql-db.ts";
import { verifyJWT } from "../middleware/auth-middleware.ts";
import type { AuthenticatedUser } from "../types/auth-types.ts";
import { parseCreateForm } from "../utils/form-validation.ts";
import { logger } from "../utils/logger.ts";
import { createSlug } from "../utils/slug.ts";

const formRoutes = Router();
const FORM_ERROR_MESSAGE = "Unable to process form request";

const getUser = (res: Response) => res.locals.user as AuthenticatedUser;

formRoutes.use(verifyJWT);

formRoutes.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.form_id, f.form_title, f.form_description, f.form_slug,
              f.form_is_published, f.form_published_at, f.form_created_at,
              f.form_updated_at, COUNT(q.question_id)::int AS question_count
       FROM forms f
       LEFT JOIN questions q
         ON q.question_form_id = f.form_id
        AND q.question_deleted_at IS NULL
       WHERE f.form_owner_id = $1
       GROUP BY f.form_id
       ORDER BY f.form_created_at DESC`,
      [getUser(res).userId],
    );

    logger.info(
      { userId: getUser(res).userId, formCount: result.rowCount },
      "Forms fetched",
    );
    return res.status(200).json({ forms: result.rows });
  } catch (err) {
    logger.error(
      { error: err, userId: getUser(res).userId },
      "Forms fetch failed",
    );
    return res.status(500).json({ message: FORM_ERROR_MESSAGE });
  }
});

formRoutes.get("/:formId", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT form_id, form_owner_id, form_title, form_description, form_slug,
              form_is_published, form_published_at, form_created_at, form_updated_at
       FROM forms
       WHERE form_id = $1 AND form_owner_id = $2`,
      [req.params.formId, getUser(res).userId],
    );

    if (result.rowCount !== 1) {
      logger.warn(
        { userId: getUser(res).userId, formId: req.params.formId },
        "Form not found",
      );
      return res.status(404).json({ message: FORM_ERROR_MESSAGE });
    }

    logger.info(
      { userId: getUser(res).userId, formId: req.params.formId },
      "Form fetched",
    );

    return res.status(200).json({ form: result.rows[0] });
  } catch (err) {
    logger.error(
      { error: err, userId: getUser(res).userId, formId: req.params.formId },
      "Form fetch failed",
    );

    return res.status(500).json({ message: FORM_ERROR_MESSAGE });
  }
});

formRoutes.delete("/:formId", async (req, res) => {
  const { formId } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM forms
       WHERE form_id = $1 AND form_owner_id = $2
       RETURNING form_id`,
      [formId, getUser(res).userId],
    );

    if (result.rowCount !== 1) {
      logger.warn(
        { userId: getUser(res).userId, formId },
        "Form delete requested for an unavailable form",
      );
      return res.status(404).json({ message: FORM_ERROR_MESSAGE });
    }

    logger.info({ userId: getUser(res).userId, formId }, "Form deleted");
    return res.status(200).json({ formId });
  } catch (err) {
    logger.error(
      { error: err, userId: getUser(res).userId, formId },
      "Form deletion failed",
    );
    return res.status(500).json({ message: FORM_ERROR_MESSAGE });
  }
});

formRoutes.post("/", async (req, res) => {
  const form = parseCreateForm(req.body);

  if (!form) {
    logger.error(
      { userId: getUser(res).userId },
      "Invalid form creation payload",
    );
    return res.status(400).json({ message: FORM_ERROR_MESSAGE });
  }

  try {
    const formId = crypto.randomUUID();
    const slug = createSlug(form.title);
    const publishedAt = form.isPublished ? new Date() : null;

    const result = await pool.query(
      `INSERT INTO forms (
         form_id, form_owner_id, form_title, form_description, form_slug,
         form_is_published, form_published_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING form_id, form_owner_id, form_title, form_description, form_slug,
                 form_is_published, form_published_at, form_created_at, form_updated_at`,
      [
        formId,
        getUser(res).userId,
        form.title,
        form.description,
        slug,
        form.isPublished,
        publishedAt,
      ],
    );

    logger.info({ userId: getUser(res).userId, formId }, "Form created");

    return res.status(201).json({ form: result.rows[0] });
  } catch (err) {
    logger.error(
      { error: err, userId: getUser(res).userId },
      "Form creation failed",
    );

    return res.status(500).json({ message: FORM_ERROR_MESSAGE });
  }
});

export default formRoutes;
