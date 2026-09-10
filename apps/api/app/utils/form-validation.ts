import {
  type CreateFormBody,
  type CreateFormInput,
} from "../types/form-types.ts";
import {
  QUESTION_TYPE_MAX,
  QUESTION_TYPE_MIN,
  type CreateQuestionBody,
  type CreateQuestionInput,
} from "../types/question-types.ts";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const parseCreateForm = (body: unknown): CreateFormInput | null => {
  if (!isRecord(body)) return null;

  const input = body as CreateFormBody;
  const title =
    typeof input.title === "string" ? input.title.trim() : "Untitled form";
  const description =
    input.description === undefined || input.description === null
      ? null
      : typeof input.description === "string"
        ? input.description.trim()
        : null;
  const isPublished =
    input.isPublished === undefined ? false : input.isPublished;

  if (!title || typeof isPublished !== "boolean") return null;
  return { title, description, isPublished };
};

export const parseCreateQuestion = (
  body: unknown,
): CreateQuestionInput | null => {
  if (!isRecord(body)) return null;

  const input = body as CreateQuestionBody;
  const label = typeof input.label === "string" ? input.label.trim() : "";
  const type = input.type;
  const required = input.required === undefined ? false : input.required;
  const config = input.config === undefined ? {} : input.config;
  const order = input.order;

  const validType =
    typeof type === "number" &&
    Number.isInteger(type) &&
    type >= QUESTION_TYPE_MIN &&
    type <= QUESTION_TYPE_MAX;
  const validOrder =
    order === undefined ||
    (typeof order === "number" && Number.isInteger(order) && order > 0);

  if (
    !label ||
    !validType ||
    typeof required !== "boolean" ||
    !isRecord(config) ||
    !validOrder
  ) {
    return null;
  }

  return { label, type, order, required, config };
};
