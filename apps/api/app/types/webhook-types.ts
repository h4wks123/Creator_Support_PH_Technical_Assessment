import { z } from "zod";

const webhookUrlSchema = z.url();
const webhookSecretSchema = z.string().trim().min(1).max(500);

export const parseWebhookConfig = (body: unknown) => {
  const result = z
    .object({
      url: webhookUrlSchema,
      secret: webhookSecretSchema,
    })
    .safeParse(body);
  return result.success ? result.data : null;
};

export const parseWebhookUpdate = (body: unknown) => {
  const result = z
    .object({
      url: webhookUrlSchema,
      secret: webhookSecretSchema.optional(),
    })
    .safeParse(body);
  return result.success ? result.data : null;
};
