import { pool } from "../config/psql-db.ts";
import { logger } from "./logger.ts";

type DeliveryAnswer = {
  questionId: string;
  label: string;
  type: string;
  value: unknown;
};

type DeliveryInput = {
  formId: string;
  formTitle: string;
  responseId: string;
  email: string;
  submittedAt: string;
  answers: DeliveryAnswer[];
};

const deliveryTimeoutMs = 10_000;

export const deliverWebhook = async (input: DeliveryInput) => {
  const configResult = await pool.query(
    `SELECT webhook_url, webhook_secret
     FROM webhooks
     WHERE webhook_form_id = $1`,
    [input.formId],
  );
  if (configResult.rowCount !== 1) return;

  const config = configResult.rows[0] as {
    webhook_url: string;
    webhook_secret: string;
  };
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
