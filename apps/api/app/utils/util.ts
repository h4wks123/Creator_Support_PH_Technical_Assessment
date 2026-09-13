import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import {
  createFormSchema,
  updateFormSchema,
  updateFormStatusSchema,
  type CreateFormInput,
  type UpdateFormInput,
  type UpdateFormStatusInput,
} from "../types/form-types.ts";
import {
  createQuestionSchema,
  linearScaleConfigSchema,
  questionOptionsSchema,
  type CreateQuestionInput,
} from "../types/question-types.ts";
import {
  submitResponseSchema,
  type QuestionForResponseValidation,
  type ResponseValidationFailure,
  type SubmitResponseInput,
} from "../types/response-types.ts";

config({
  path: fileURLToPath(new URL("../../../../.env", import.meta.url)),
  quiet: true,
});

const required = (name: string) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

const port = (name: string) => {
  const value = Number(required(name));
  if (!Number.isInteger(value) || value < 1 || value > 65_535) {
    throw new Error(`${name} must be an integer between 1 and 65535`);
  }
  return value;
};

const origin = (name: string) => {
  const value = required(name);
  const parsed = new URL(value);
  if (
    !["http:", "https:"].includes(parsed.protocol) ||
    parsed.origin !== value
  ) {
    throw new Error(`${name} must be an HTTP(S) origin without a path`);
  }
  return value;
};

export const env = {
  apiPort: port("API_PORT"),
  corsOrigin: origin("CORS_ORIGIN"),
  dbHost: required("DB_HOST"),
  dbPort: port("DB_PORT"),
  dbName: required("DB_NAME"),
  dbUser: required("DB_USER"),
  dbPassword: required("DB_PASS"),
  jwtSecret: required("JWT_SECRET"),
};

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

export const parseCreateForm = (body: unknown): CreateFormInput | null => {
  const result = createFormSchema.safeParse(body);
  return result.success ? result.data : null;
};

export const parseUpdateForm = (body: unknown): UpdateFormInput | null => {
  const result = updateFormSchema.safeParse(body);
  return result.success ? result.data : null;
};

export const parseUpdateFormStatus = (
  body: unknown,
): UpdateFormStatusInput | null => {
  const result = updateFormStatusSchema.safeParse(body);
  return result.success ? result.data : null;
};

export const parseCreateQuestion = (
  body: unknown,
): CreateQuestionInput | null => {
  const result = createQuestionSchema.safeParse(body);
  if (!result.success) return null;

  if ([4, 5, 6, 7].includes(result.data.type)) {
    const options = questionOptionsSchema.safeParse(result.data.config);
    return options.success ? { ...result.data, config: options.data } : null;
  }

  if (result.data.type === 8) {
    const linearScale = linearScaleConfigSchema.safeParse(result.data.config);
    return linearScale.success
      ? { ...result.data, config: linearScale.data }
      : null;
  }

  return result.data;
};

export const createSlug = () => crypto.randomUUID();

export const parseSubmitResponse = (
  body: unknown,
): SubmitResponseInput | null => {
  const result = submitResponseSchema.safeParse(body);
  return result.success ? result.data : null;
};

export const isEmptyAnswer = (value: unknown) =>
  value == null ||
  (typeof value === "string" && value.trim() === "") ||
  (Array.isArray(value) && value.length === 0);

const dateSchema = z.iso.date();
const optionsSchema = z
  .array(z.string().trim().min(1).max(255))
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
  const result = parseAnswer(type, config, value);
  return result.success ? null : result.error;
};

const parseAnswer = (
  type: number,
  config: Record<string, unknown>,
  value: unknown,
): { success: true; data: unknown } | { success: false; error: string } => {
  if (isEmptyAnswer(value)) return { success: true, data: null };
  switch (type) {
    case 1: {
      const result = z.string().trim().min(1).max(255).safeParse(value);
      return result.success
        ? result
        : {
            success: false,
            error: "must be a string of 255 characters or fewer",
          };
    }
    case 2: {
      const result = z.string().trim().min(1).max(5000).safeParse(value);
      return result.success
        ? result
        : {
            success: false,
            error: "must be a string of 5000 characters or fewer",
          };
    }
    case 3: {
      const result = dateSchema.safeParse(value);
      return result.success
        ? result
        : { success: false, error: "must be a valid date (YYYY-MM-DD)" };
    }
    case 4:
    case 6: {
      const options = getOptions(config);
      if (!options)
        return {
          success: false,
          error: "must match one of the configured options",
        };
      const result = z
        .string()
        .trim()
        .refine((answer) => options.includes(answer))
        .safeParse(value);
      return result.success
        ? result
        : {
            success: false,
            error: "must match one of the configured options",
          };
    }
    case 5:
    case 7: {
      const options = getOptions(config);
      if (!options)
        return {
          success: false,
          error: "must contain only configured options",
        };
      const answerSchema = z
        .array(z.string().trim().min(1))
        .refine(
          (answers) =>
            answers.every((answer) => options.includes(answer)) &&
            new Set(answers).size === answers.length,
        );
      const result = answerSchema.safeParse(value);
      return result.success
        ? result
        : {
            success: false,
            error: "must contain only configured options",
          };
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
        ? { success: true, data: answer.data }
        : {
            success: false,
            error: "must be an integer within the configured range",
          };
    }
    default:
      return { success: false, error: "has an unsupported question type" };
  }
};

export const normalizeSubmission = (
  input: SubmitResponseInput,
  questions: QuestionForResponseValidation[],
): SubmitResponseInput => {
  const questionsById = new Map(
    questions.map((question) => [question.question_id, question]),
  );
  return {
    ...input,
    answers: input.answers.map((answer) => {
      const question = questionsById.get(answer.questionId);
      if (!question) return answer;
      const result = parseAnswer(
        question.question_type,
        question.question_config,
        answer.value,
      );
      return result.success ? { ...answer, value: result.data } : answer;
    }),
  };
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
