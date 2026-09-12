import { Router, type Response } from "express";
import { pool } from "../config/psql-db.ts";
import { verifyJWT } from "../middleware/auth-middleware.ts";
import type { AuthenticatedUser } from "../types/auth-types.ts";
import {
  parseWebhookConfig,
  parseWebhookUpdate,
} from "../types/webhook-types.ts";
import { logger } from "../utils/logger.ts";

const webhookRoutes = Router();
const WEBHOOK_ERROR_MESSAGE = "Unable to process webhook request";

const getUser = (res: Response) => res.locals.user as AuthenticatedUser;

webhookRoutes.use(verifyJWT);

webhookRoutes.get("/:formId/webhook", async (req, res) => {
  const user = getUser(res);
  try {
    const result = await pool.query(
      `SELECT w.webhook_id, w.webhook_form_id, w.webhook_url,
              w.webhook_created_at, w.webhook_updated_at,
              true AS webhook_has_secret
       FROM webhooks w
       INNER JOIN forms f ON f.form_id = w.webhook_form_id
       WHERE w.webhook_form_id = $1 AND f.form_owner_id = $2`,
      [req.params.formId, user.userId],
    );

    return res.status(200).json({ webhook: result.rows[0] ?? null });
  } catch (err) {
    logger.error(
      { error: err, userId: user.userId, formId: req.params.formId },
      "Webhook configuration fetch failed",
    );
    return res.status(500).json({ message: WEBHOOK_ERROR_MESSAGE });
  }
});

webhookRoutes.get("/:formId/webhook/deliveries", async (req, res) => {
  const user = getUser(res);
  try {
    const result = await pool.query(
      `SELECT d.webhook_delivery_id, d.webhook_delivery_attempted_at,
              d.webhook_delivery_status_code, d.webhook_delivery_error_message,
              d.webhook_delivery_response_id
       FROM webhook_deliveries d
       INNER JOIN forms f ON f.form_id = d.webhook_delivery_form_id
       WHERE d.webhook_delivery_form_id = $1 AND f.form_owner_id = $2
       ORDER BY d.webhook_delivery_attempted_at DESC`,
      [req.params.formId, user.userId],
    );

    return res.status(200).json({ deliveries: result.rows });
  } catch (err) {
    logger.error(
      { error: err, userId: user.userId, formId: req.params.formId },
      "Webhook delivery log fetch failed",
    );
    return res.status(500).json({ message: WEBHOOK_ERROR_MESSAGE });
  }
});

webhookRoutes.put("/:formId/webhook", async (req, res) => {
  const user = getUser(res);
  const input = parseWebhookConfig(req.body);
  if (!input) return res.status(400).json({ message: WEBHOOK_ERROR_MESSAGE });

  try {
    const result = await pool.query(
      `INSERT INTO webhooks (
         webhook_id, webhook_form_id, webhook_url, webhook_secret
       )
       SELECT $1, f.form_id, $3, $4
       FROM forms f
       WHERE f.form_id = $2 AND f.form_owner_id = $5
       ON CONFLICT (webhook_form_id) DO UPDATE SET
         webhook_url = EXCLUDED.webhook_url,
         webhook_secret = EXCLUDED.webhook_secret,
         webhook_updated_at = CURRENT_TIMESTAMP
       RETURNING webhook_id, webhook_form_id, webhook_url,
                 webhook_created_at, webhook_updated_at,
                 true AS webhook_has_secret`,
      [
        crypto.randomUUID(),
        req.params.formId,
        input.url,
        input.secret,
        user.userId,
      ],
    );

    if (result.rowCount !== 1)
      return res.status(404).json({ message: WEBHOOK_ERROR_MESSAGE });
    return res.status(200).json({ webhook: result.rows[0] });
  } catch (err) {
    logger.error(
      { error: err, userId: user.userId, formId: req.params.formId },
      "Webhook configuration save failed",
    );
    return res.status(500).json({ message: WEBHOOK_ERROR_MESSAGE });
  }
});

webhookRoutes.patch("/:formId/webhook", async (req, res) => {
  const user = getUser(res);
  const input = parseWebhookUpdate(req.body);
  if (!input) return res.status(400).json({ message: WEBHOOK_ERROR_MESSAGE });

  try {
    const result = await pool.query(
      `UPDATE webhooks w
       SET webhook_url = $1,
           webhook_secret = COALESCE($2, w.webhook_secret),
           webhook_updated_at = CURRENT_TIMESTAMP
       FROM forms f
       WHERE w.webhook_form_id = $3
         AND f.form_id = w.webhook_form_id
         AND f.form_owner_id = $4
       RETURNING w.webhook_id, w.webhook_form_id, w.webhook_url,
                 w.webhook_created_at, w.webhook_updated_at,
                 true AS webhook_has_secret`,
      [input.url, input.secret ?? null, req.params.formId, user.userId],
    );

    if (result.rowCount !== 1)
      return res.status(404).json({ message: WEBHOOK_ERROR_MESSAGE });
    return res.status(200).json({ webhook: result.rows[0] });
  } catch (err) {
    logger.error(
      { error: err, userId: user.userId, formId: req.params.formId },
      "Webhook configuration update failed",
    );
    return res.status(500).json({ message: WEBHOOK_ERROR_MESSAGE });
  }
});

export default webhookRoutes;
