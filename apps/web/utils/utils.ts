import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import type { FormQuestion } from "@/types/forms";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
        case "long_text":
          return z.string().trim().min(1).safeParse(value);
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
        question.type === "linear_scale"
          ? "Choose a value within the scale range."
          : "Enter a valid answer.";
  }
  return errors;
}
