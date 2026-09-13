import { z } from "zod";

const webhookUrlSchema = z.url();
const webhookSecretSchema = z.string().trim().min(1).max(500);

export const webhookConfigSchema = z.object({
  url: webhookUrlSchema,
  secret: webhookSecretSchema,
});
export type WebhookConfig = z.infer<typeof webhookConfigSchema>;

export const webhookUpdateSchema = z.object({
  url: webhookUrlSchema,
  secret: webhookSecretSchema.optional(),
});
export type WebhookUpdate = z.infer<typeof webhookUpdateSchema>;

export const webhookToggleSchema = z.object({ enabled: z.boolean() });
export type WebhookToggle = z.infer<typeof webhookToggleSchema>;

export const webhookDeliveryAnswerSchema = z.object({
  questionId: z.string(),
  label: z.string(),
  type: z.string(),
  value: z.unknown(),
});

export const webhookDeliveryInputSchema = z.object({
  formId: z.string(),
  formTitle: z.string(),
  responseId: z.string(),
  email: z.email(),
  submittedAt: z.string(),
  answers: z.array(webhookDeliveryAnswerSchema),
});
export type WebhookDeliveryInput = z.infer<typeof webhookDeliveryInputSchema>;

export const webhookConnectionSchema = z.object({
  webhook_url: z.string(),
  webhook_secret: z.string(),
});
export type WebhookConnection = z.infer<typeof webhookConnectionSchema>;

export const parseWebhookConfig = (body: unknown) => {
  const result = webhookConfigSchema.safeParse(body);
  return result.success ? result.data : null;
};

export const parseWebhookToggle = (body: unknown) => {
  const result = webhookToggleSchema.safeParse(body);
  return result.success ? result.data : null;
};

export const parseWebhookUpdate = (body: unknown) => {
  const result = webhookUpdateSchema.safeParse(body);
  return result.success ? result.data : null;
};
