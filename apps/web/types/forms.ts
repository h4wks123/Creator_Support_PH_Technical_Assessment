import { z } from "zod";

export const QUESTION_TYPES = [
  "short_text",
  "long_text",
  "date",
  "dropdown",
  "multi_select",
  "multiple_choice",
  "checkboxes",
  "linear_scale",
] as const;

export const questionTypeSchema = z.enum(QUESTION_TYPES);
export type QuestionType = z.infer<typeof questionTypeSchema>;

export const linearScaleConfigSchema = z
  .object({
    min: z.number().int(),
    max: z.number().int(),
    minLabel: z.string(),
    maxLabel: z.string(),
  })
  .refine(({ min, max }) => min <= max);
export type LinearScaleConfig = z.infer<typeof linearScaleConfigSchema>;

export const formQuestionSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: questionTypeSchema,
  order: z.number().int().positive(),
  required: z.boolean(),
  options: z.array(z.string()),
  linearScale: linearScaleConfigSchema.optional(),
});
export type FormQuestion = z.infer<typeof formQuestionSchema>;

export const formDraftSchema = z.object({
  formSlug: z.string().optional(),
  title: z.string(),
  description: z.string(),
  questions: z.array(formQuestionSchema),
  published: z.boolean(),
});
export type FormDraft = z.infer<typeof formDraftSchema>;

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  short_text: "Short text",
  long_text: "Long text",
  date: "Date",
  dropdown: "Dropdown",
  multi_select: "Multi-select dropdown",
  multiple_choice: "Multiple choice",
  checkboxes: "Checkboxes",
  linear_scale: "Linear scale",
};

export const createQuestion = (
  type: QuestionType = "short_text",
  order = 1,
): FormQuestion => ({
  id: `question-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  label: "Untitled question",
  type,
  order,
  required: false,
  options: ["Option 1", "Option 2"],
  linearScale: { min: 1, max: 10, minLabel: "Not likely", maxLabel: "Very likely" },
});
