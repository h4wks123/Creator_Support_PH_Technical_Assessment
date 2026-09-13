import { z } from "zod";

export const QUESTION_TYPE_MIN = 1;
export const QUESTION_TYPE_MAX = 8;

export const questionOptionsSchema = z
  .object({
    options: z
      .array(z.string().trim().min(1).max(255))
      .min(1)
      .refine((options) => new Set(options).size === options.length),
  })
  .loose();

export const linearScaleConfigSchema = z
  .object({
    min: z.number().int(),
    max: z.number().int(),
    minLabel: z.string().trim().max(255).default(""),
    maxLabel: z.string().trim().max(255).default(""),
  })
  .refine(({ min, max }) => min <= max);

export const createQuestionSchema = z.object({
  label: z.string().trim().min(1).max(255),
  type: z.number().int().min(QUESTION_TYPE_MIN).max(QUESTION_TYPE_MAX),
  order: z.number().int().positive().optional(),
  required: z.boolean().default(false),
  config: z.record(z.string(), z.unknown()).default({}),
});
export type CreateQuestionBody = z.input<typeof createQuestionSchema>;
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;

export const questionRecordSchema = z.object({
  question_id: z.string(),
  question_form_id: z.string(),
  question_label: z.string(),
  question_type: z.number(),
  question_order: z.number(),
  question_is_required: z.boolean(),
  question_config: z.record(z.string(), z.unknown()),
  question_deleted_at: z.string().nullable(),
  question_created_at: z.string(),
  question_updated_at: z.string(),
});
export type QuestionRecord = z.infer<typeof questionRecordSchema>;
