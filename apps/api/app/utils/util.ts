import { z } from "zod";
import type { CreateFormInput } from "../types/form-types.ts";
import {
  QUESTION_TYPE_MAX,
  QUESTION_TYPE_MIN,
  type CreateQuestionInput,
} from "../types/question-types.ts";
import type {
  QuestionForResponseValidation,
  ResponseValidationFailure,
  SubmitResponseInput,
} from "../types/response-types.ts";

const emailSchema = z.email();
const passwordSchema = z
  .string()
  .min(8)
  .refine((password) => {
    const characters = [...password];
    const hasLowercase = characters.some(
      (character) => character >= "a" && character <= "z",
    );
    const hasUppercase = characters.some(
      (character) => character >= "A" && character <= "Z",
    );
    const hasNumber = characters.some(
      (character) => character >= "0" && character <= "9",
    );
    const hasSpecial = characters.some(
      (character) =>
        !(character >= "a" && character <= "z") &&
        !(character >= "A" && character <= "Z") &&
        !(character >= "0" && character <= "9"),
    );
    return hasLowercase && hasUppercase && hasNumber && hasSpecial;
  });
export const validateEmail = (email: string) =>
  emailSchema.safeParse(email).success;
export const validatePassword = (password: string) =>
  passwordSchema.safeParse(password).success;

const recordSchema = z.record(z.string(), z.unknown());
const formSchema = z.object({
  title: z.string().trim().min(1).default("Untitled form"),
  description: z.string().trim().nullable().default(null),
  isPublished: z.boolean().default(false),
});
const updateFormSchema = formSchema.extend({
  title: z.string().trim().min(1),
  isPublished: z.boolean(),
});
const questionSchema = z.object({
  label: z.string().trim().min(1),
  type: z.number().int().min(QUESTION_TYPE_MIN).max(QUESTION_TYPE_MAX),
  order: z.number().int().positive().optional(),
  required: z.boolean().default(false),
  config: recordSchema.default({}),
});
const responseSchema = z.object({
  email: emailSchema,
  answers: z.array(z.object({ questionId: z.string(), value: z.unknown() })),
});

export const parseCreateForm = (body: unknown): CreateFormInput | null => {
  const result = formSchema.safeParse(body);
  return result.success ? result.data : null;
};

export const parseUpdateForm = (body: unknown): CreateFormInput | null => {
  const result = updateFormSchema.safeParse(body);
  return result.success ? result.data : null;
};

export const parseCreateQuestion = (
  body: unknown,
): CreateQuestionInput | null => {
  const result = questionSchema.safeParse(body);
  return result.success ? result.data : null;
};

export const createSlug = (title: string) => {
  const normalizedTitle = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${normalizedTitle || "form"}-${crypto.randomUUID().slice(0, 8)}`;
};

export const parseSubmitResponse = (
  body: unknown,
): SubmitResponseInput | null => {
  const result = responseSchema.safeParse(body);
  return result.success ? result.data : null;
};

export const isEmptyAnswer = (value: unknown) =>
  value == null ||
  (typeof value === "string" && value.trim() === "") ||
  (Array.isArray(value) && value.length === 0);

const dateSchema = z.iso.date();
const optionsSchema = z
  .array(z.string().trim().min(1))
  .refine((options) => new Set(options).size === options.length);

const getOptions = (config: Record<string, unknown>) => {
  const result = optionsSchema.safeParse(config.options);
  return result.success ? result.data : null;
};

export const validateAnswer = (
  type: number,
  config: Record<string, unknown>,
  value: unknown,
): string | null => {
  if (isEmptyAnswer(value)) return null;
  switch (type) {
    case 1:
    case 2:
      return z.string().trim().min(1).safeParse(value).success
        ? null
        : "must be a string";
    case 3:
      return dateSchema.safeParse(value).success
        ? null
        : "must be a valid date (YYYY-MM-DD)";
    case 4:
    case 6: {
      const options = getOptions(config);
      return options &&
        z
          .string()
          .refine((answer) => options.includes(answer.trim()))
          .safeParse(value).success
        ? null
        : "must match one of the configured options";
    }
    case 5:
    case 7: {
      const options = getOptions(config);
      const answerSchema = z
        .array(z.string().trim().min(1))
        .refine(
          (answers) =>
            answers.every((answer) => options?.includes(answer)) &&
            new Set(answers).size === answers.length,
        );
      return options && answerSchema.safeParse(value).success
        ? null
        : "must contain only configured options";
    }
    case 8: {
      const scale = z
        .object({ min: z.number().int(), max: z.number().int() })
        .refine(({ min, max }) => min <= max)
        .safeParse(config);
      const answer = z.number().int().safeParse(value);
      const numericValue = answer.success ? answer.data : null;
      return scale.success &&
        numericValue !== null &&
        numericValue >= scale.data.min &&
        numericValue <= scale.data.max
        ? null
        : "must be an integer within the configured range";
    }
    default:
      return "has an unsupported question type";
  }
};

export const validateSubmission = (
  input: SubmitResponseInput,
  questions: QuestionForResponseValidation[],
): ResponseValidationFailure | null => {
  const questionsById = new Map(
    questions.map((question) => [question.question_id, question]),
  );
  const answersById = new Map(
    input.answers.map((answer) => [answer.questionId, answer.value]),
  );
  if (answersById.size !== input.answers.length)
    return { reason: "submission contains duplicate question IDs" };

  for (const answer of input.answers) {
    const question = questionsById.get(answer.questionId);
    if (!question)
      return {
        questionId: answer.questionId,
        reason: "question does not belong to the form",
      };
    if (isEmptyAnswer(answer.value)) {
      if (question.question_is_required)
        return {
          questionId: question.question_id,
          reason: "required question is unanswered",
        };
      continue;
    }
    const reason = validateAnswer(
      question.question_type,
      question.question_config,
      answer.value,
    );
    if (reason) return { questionId: question.question_id, reason };
  }
  for (const question of questions) {
    if (
      question.question_is_required &&
      isEmptyAnswer(answersById.get(question.question_id))
    ) {
      return {
        questionId: question.question_id,
        reason: "required question is unanswered",
      };
    }
  }
  return null;
};
