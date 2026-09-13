import { z } from "zod";

export const createFormSchema = z.object({
  title: z.string().trim().min(1).max(255).default("Untitled form"),
  description: z.string().trim().max(5000).nullable().default(null),
  isPublished: z.boolean().default(false),
});
export type CreateFormBody = z.input<typeof createFormSchema>;
export type CreateFormInput = z.infer<typeof createFormSchema>;

export const updateFormSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(5000).nullable(),
});
export type UpdateFormInput = z.infer<typeof updateFormSchema>;

export const updateFormStatusSchema = z.object({
  isPublished: z.boolean(),
});
export type UpdateFormStatusInput = z.infer<typeof updateFormStatusSchema>;

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
export type FormRecord = z.infer<typeof formRecordSchema>;
