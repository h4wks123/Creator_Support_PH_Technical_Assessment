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
