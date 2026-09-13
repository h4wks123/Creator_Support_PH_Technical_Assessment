import { z } from "zod";

export const submittedAnswerSchema = z.object({
  questionId: z.string(),
  value: z.unknown(),
});
export type SubmittedAnswer = z.infer<typeof submittedAnswerSchema>;

export const submitResponseSchema = z.object({
  email: z.email(),
  answers: z.array(submittedAnswerSchema),
});
export type SubmitResponseBody = z.input<typeof submitResponseSchema>;
export type SubmitResponseInput = z.infer<typeof submitResponseSchema>;

export const questionForResponseValidationSchema = z.object({
  question_id: z.string(),
  question_type: z.number(),
  question_is_required: z.boolean(),
  question_config: z.record(z.string(), z.unknown()),
});
export type QuestionForResponseValidation = z.infer<
  typeof questionForResponseValidationSchema
>;

export const responseValidationFailureSchema = z.object({
  reason: z.string(),
  questionId: z.string().optional(),
});
export type ResponseValidationFailure = z.infer<
  typeof responseValidationFailureSchema
>;

export const responseExportQuestionSchema = z.object({
  question_id: z.string(),
  question_label: z.string(),
  question_order: z.number(),
});
export type ResponseExportQuestion = z.infer<
  typeof responseExportQuestionSchema
>;

export const responseExportSchema = z.object({
  email: z.string(),
  submittedAt: z.string(),
  answers: z.map(z.string(), z.unknown()),
});
export type ResponseExport = z.infer<typeof responseExportSchema>;
