import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import type { FormQuestion, QuestionType } from "@/types/forms";

export const FORM_TITLE_MAX_LENGTH = 255;
export const FORM_DESCRIPTION_MAX_LENGTH = 5000;
export const QUESTION_LABEL_MAX_LENGTH = 255;
export const QUESTION_OPTION_MAX_LENGTH = 255;
export const SHORT_TEXT_MAX_LENGTH = 255;
export const LONG_TEXT_MAX_LENGTH = 5000;

export interface QuestionValidationErrors {
  label?: string;
  options?: string;
  optionErrors?: Record<number, string>;
  linearScale?: {
    min?: string;
    max?: string;
    minLabel?: string;
    maxLabel?: string;
  };
  server?: string;
}

export interface FormValidationErrors {
  title?: string;
  description?: string;
  server?: string;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const optionQuestionTypes: QuestionType[] = [
  "dropdown",
  "multi_select",
  "multiple_choice",
  "checkboxes",
];

export function validateQuestion(
  question: FormQuestion,
): QuestionValidationErrors {
  const errors: QuestionValidationErrors = {};
  const label = question.label.trim();

  if (!label) errors.label = "Question title is required.";
  else if (label.length > QUESTION_LABEL_MAX_LENGTH) {
    errors.label = `Question title must be ${QUESTION_LABEL_MAX_LENGTH} characters or fewer.`;
  }

  if (optionQuestionTypes.includes(question.type)) {
    const optionErrors: Record<number, string> = {};
    const seen = new Set<string>();

    question.options.forEach((option, index) => {
      const trimmedOption = option.trim();
      if (!trimmedOption) optionErrors[index] = "Option cannot be empty.";
      else if (trimmedOption.length > QUESTION_OPTION_MAX_LENGTH) {
        optionErrors[index] =
          `Option must be ${QUESTION_OPTION_MAX_LENGTH} characters or fewer.`;
      } else if (seen.has(trimmedOption)) {
        optionErrors[index] = "Options must be unique.";
      }
      seen.add(trimmedOption);
    });

    if (!question.options.length) errors.options = "Add at least one option.";
    if (Object.keys(optionErrors).length) errors.optionErrors = optionErrors;
  }

  if (question.type === "linear_scale") {
    const scale = question.linearScale;
    const linearScale = {} as NonNullable<
      QuestionValidationErrors["linearScale"]
    >;

    if (!scale || !Number.isInteger(scale.min)) {
      linearScale.min = "Minimum must be an integer.";
    }
    if (!scale || !Number.isInteger(scale.max)) {
      linearScale.max = "Maximum must be an integer.";
    }
    if (
      scale &&
      Number.isInteger(scale.min) &&
      Number.isInteger(scale.max) &&
      scale.min > scale.max
    ) {
      linearScale.min = "Minimum cannot be greater than maximum.";
      linearScale.max = "Maximum must be at least the minimum.";
    }
    if (!scale?.minLabel.trim())
      linearScale.minLabel = "Minimum label is required.";
    else if (scale.minLabel.trim().length > QUESTION_OPTION_MAX_LENGTH) {
      linearScale.minLabel = `Label must be ${QUESTION_OPTION_MAX_LENGTH} characters or fewer.`;
    }
    if (!scale?.maxLabel.trim())
      linearScale.maxLabel = "Maximum label is required.";
    else if (scale.maxLabel.trim().length > QUESTION_OPTION_MAX_LENGTH) {
      linearScale.maxLabel = `Label must be ${QUESTION_OPTION_MAX_LENGTH} characters or fewer.`;
    }

    if (Object.keys(linearScale).length) errors.linearScale = linearScale;
  }

  return errors;
}

export function validateForm(
  title: string,
  description: string,
): FormValidationErrors {
  const errors: FormValidationErrors = {};
  if (!title.trim()) errors.title = "Form title is required.";
  else if (title.trim().length > FORM_TITLE_MAX_LENGTH) {
    errors.title = `Form title must be ${FORM_TITLE_MAX_LENGTH} characters or fewer.`;
  }
  if (description.length > FORM_DESCRIPTION_MAX_LENGTH) {
    errors.description = `Description must be ${FORM_DESCRIPTION_MAX_LENGTH} characters or fewer.`;
  }
  return errors;
}

export function formatValue(value: unknown) {
  if (value == null || value === "") return "No answer";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const emailSchema = z.email();
const passwordSchema = z
  .string()
  .min(8)
  .regex(/[a-z]/)
  .regex(/[A-Z]/)
  .regex(/\d/)
  .regex(/[^A-Za-z\d]/);

export const validateEmail = (email: string) =>
  emailSchema.safeParse(email).success;
export const validatePassword = (password: string) =>
  passwordSchema.safeParse(password).success;

const isEmptyAnswer = (value: unknown) =>
  value == null ||
  (typeof value === "string" && value.trim() === "") ||
  (Array.isArray(value) && value.length === 0);

export function validatePublicForm(
  email: string,
  questions: FormQuestion[],
  answers: Record<string, unknown>,
) {
  const errors: Record<string, string> = {};
  if (!validateEmail(email)) errors.email = "Enter a valid email address.";
  for (const question of questions) {
    const value = answers[question.id];
    if (question.required && isEmptyAnswer(value)) {
      errors[question.id] = "This question is required.";
      continue;
    }
    if (isEmptyAnswer(value)) continue;
    const result = (() => {
      switch (question.type) {
        case "short_text":
          return z
            .string()
            .trim()
            .min(1)
            .max(SHORT_TEXT_MAX_LENGTH)
            .safeParse(value);
        case "long_text":
          return z
            .string()
            .trim()
            .min(1)
            .max(LONG_TEXT_MAX_LENGTH)
            .safeParse(value);
        case "date":
          return z.iso.date().safeParse(value);
        case "dropdown":
        case "multiple_choice":
          return z
            .string()
            .refine((answer) => question.options.includes(answer))
            .safeParse(value);
        case "multi_select":
        case "checkboxes":
          return z
            .array(z.string())
            .refine((selected) =>
              selected.every((answer) => question.options.includes(answer)),
            )
            .safeParse(value);
        case "linear_scale": {
          const scale = question.linearScale ?? { min: 1, max: 10 };
          return z
            .number()
            .int()
            .min(scale.min)
            .max(scale.max)
            .safeParse(value);
        }
      }
    })();
    if (!result.success)
      errors[question.id] =
        question.type === "short_text"
          ? `Answer must be ${SHORT_TEXT_MAX_LENGTH} characters or fewer.`
          : question.type === "long_text"
            ? `Answer must be ${LONG_TEXT_MAX_LENGTH} characters or fewer.`
            : question.type === "linear_scale"
              ? "Choose a value within the scale range."
              : "Enter a valid answer.";
  }
  return errors;
}
