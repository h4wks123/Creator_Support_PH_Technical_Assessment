import { z } from "zod";

export const credentialsSchema = z.object({
  email: z.email(),
  password: z.string(),
});
export type Credentials = z.infer<typeof credentialsSchema>;

export const messageResponseSchema = z.object({ message: z.string().optional() });
export const loginResponseSchema = z.object({ token: z.string() });
export type LoginResponse = z.infer<typeof loginResponseSchema>;

export const registeredUserSchema = z.object({
  user_id: z.string(),
  user_name: z.string(),
  user_email: z.string(),
  user_created_at: z.string(),
});
export type RegisteredUser = z.infer<typeof registeredUserSchema>;

export const registerResponseSchema = z.object({
  token: z.string(),
  user: registeredUserSchema,
});
export type RegisterResponse = z.infer<typeof registerResponseSchema>;

export const formRecordSchema = z.object({
  form_id: z.string(),
  form_owner_id: z.string(),
  form_title: z.string(),
  form_description: z.string().nullable(),
  form_slug: z.string(),
  form_is_published: z.boolean(),
  form_published_at: z.string().nullable(),
  form_created_at: z.string(),
  form_updated_at: z.string(),
});
export const formListRecordSchema = z.object({
  form_id: z.string(),
  form_title: z.string(),
  form_description: z.string().nullable(),
  form_slug: z.string(),
  form_is_published: z.boolean(),
  form_published_at: z.string().nullable(),
  form_created_at: z.string(),
  form_updated_at: z.string(),
  question_count: z.number().int(),
});
export type FormRecord = z.infer<typeof formRecordSchema>;
export type FormListRecord = z.infer<typeof formListRecordSchema>;

export const apiQuestionRecordSchema = z.object({
  question_id: z.string(),
  question_form_id: z.string(),
  question_label: z.string(),
  question_type: z.number().int().min(1).max(8),
  question_order: z.number().int().positive(),
  question_is_required: z.boolean(),
  question_config: z.record(z.string(), z.unknown()),
  question_deleted_at: z.string().nullable(),
  question_created_at: z.string(),
  question_updated_at: z.string(),
});
export type ApiQuestionRecord = z.infer<typeof apiQuestionRecordSchema>;

export const publicFormRecordSchema = z.object({
  form_id: z.string(),
  form_title: z.string(),
  form_description: z.string().nullable(),
  form_slug: z.string(),
  questions: z.array(apiQuestionRecordSchema.pick({
    question_id: true,
    question_label: true,
    question_type: true,
    question_order: true,
    question_is_required: true,
    question_config: true,
  })),
});

export const responseAnswerSchema = z.object({
  questionId: z.string().nullable(),
  label: z.string(),
  type: z.number().int().min(1).max(8),
  order: z.number().int().positive(),
  value: z.unknown(),
});
export const responseRecordSchema = z.object({
  response_id: z.string(),
  response_respondent_email: z.string(),
  response_submitted_at: z.string(),
  answers: z.array(responseAnswerSchema),
});
export type ResponseRecord = z.infer<typeof responseRecordSchema>;

export const questionIdsResponseSchema = z.object({
  questionIds: z.array(z.string()),
});
export const questionIdResponseSchema = z.object({ questionId: z.string() });

export const formResponsePayloadSchema = z.object({ response: responseRecordSchema });
export const formResponsesPayloadSchema = z.object({ responses: z.array(responseRecordSchema) });

export const webhookRecordSchema = z.object({
  webhook_id: z.string(),
  webhook_form_id: z.string(),
  webhook_url: z.string(),
  webhook_created_at: z.string(),
  webhook_updated_at: z.string(),
  webhook_has_secret: z.boolean(),
});
export type WebhookRecord = z.infer<typeof webhookRecordSchema>;
export const webhookPayloadSchema = z.object({
  webhook: webhookRecordSchema.nullable(),
});
export const webhookDeliverySchema = z.object({
  webhook_delivery_id: z.string(),
  webhook_delivery_form_id: z.string(),
  webhook_delivery_response_id: z.string(),
  webhook_delivery_attempted_at: z.string(),
  webhook_delivery_status_code: z.number().int().nullable(),
});
export type WebhookDeliveryRecord = z.infer<typeof webhookDeliverySchema>;
export const webhookDeliveriesPayloadSchema = z.object({
  deliveries: z.array(webhookDeliverySchema),
});
