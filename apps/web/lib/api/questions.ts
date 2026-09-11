import { getAuthToken } from "@/lib/auth";
import {
  apiQuestionRecordSchema,
  messageResponseSchema,
  questionIdResponseSchema,
  questionIdsResponseSchema,
} from "@/types/api";
import { QUESTION_TYPES, type FormQuestion, type QuestionType } from "@/types/forms";
import { z } from "zod";

const getApiUrl = () =>
  typeof window === "undefined"
    ? (process.env.APP_API_URL ?? process.env.NEXT_PUBLIC_APP_API_URL)
    : process.env.NEXT_PUBLIC_APP_API_URL;

const QUESTION_TYPE_IDS: Record<QuestionType, number> = {
  short_text: 1,
  long_text: 2,
  date: 3,
  dropdown: 4,
  multi_select: 5,
  multiple_choice: 6,
  checkboxes: 7,
  linear_scale: 8,
};

const questionsPayloadSchema = z.object({ questions: z.array(apiQuestionRecordSchema) });
const questionPayloadSchema = z.object({ question: apiQuestionRecordSchema });

export async function getQuestions(
  formId: string,
  authToken?: string,
): Promise<FormQuestion[]> {
  const token = authToken ?? getAuthToken();
  const response = await fetch(`${getApiUrl()}/api/forms/${formId}/questions`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Unable to fetch questions");

  return questionsPayloadSchema.parse(await response.json()).questions.map((question) => {
    const config = question.question_config;
    return {
      id: question.question_id,
      label: question.question_label,
      type: QUESTION_TYPES[question.question_type - 1] ?? "short_text",
      order: question.question_order,
      required: question.question_is_required,
      options: Array.isArray(config.options)
        ? config.options.filter(
            (option): option is string => typeof option === "string",
          )
        : ["Option 1", "Option 2"],
      linearScale:
        question.question_type === 8
          ? {
              min: typeof config.min === "number" ? config.min : 1,
              max: typeof config.max === "number" ? config.max : 10,
              minLabel:
                typeof config.minLabel === "string"
                  ? config.minLabel
                  : "Not likely",
              maxLabel:
                typeof config.maxLabel === "string"
                  ? config.maxLabel
                  : "Very likely",
            }
          : undefined,
    };
  });
}

function getConfig(question: FormQuestion): Record<string, unknown> {
  if (
    ["dropdown", "multi_select", "multiple_choice", "checkboxes"].includes(
      question.type,
    )
  ) {
    return { options: question.options };
  }
  if (question.type === "linear_scale" && question.linearScale)
    return { ...question.linearScale };
  return {};
}

export async function createQuestion(formId: string, question: FormQuestion) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/api/forms/${formId}/questions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        label: question.label,
        type: QUESTION_TYPE_IDS[question.type],
        required: question.required,
        config: getConfig(question),
      }),
    },
  );

  if (!response.ok) throw new Error("Unable to create question");
  return questionPayloadSchema.parse(await response.json()).question;
}

export async function updateQuestion(formId: string, question: FormQuestion) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/api/forms/${formId}/questions/${question.id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        label: question.label,
        type: QUESTION_TYPE_IDS[question.type],
        order: question.order,
        required: question.required,
        config: getConfig(question),
      }),
    },
  );

  if (!response.ok) throw new Error("Unable to save question");
  return questionPayloadSchema.parse(await response.json()).question;
}

export async function reorderQuestions(formId: string, questionIds: string[]) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/api/forms/${formId}/questions/reorder`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ questionIds }),
    },
  );

  if (!response.ok) {
    const data = messageResponseSchema.safeParse(await response.json());
    throw new Error(data.success ? data.data.message : "Unable to reorder questions");
  }
  questionIdsResponseSchema.parse(await response.json());
}

export async function deleteQuestion(formId: string, questionId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/api/forms/${formId}/questions/${questionId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    },
  );

  if (!response.ok) {
    const data = messageResponseSchema.safeParse(await response.json());
    throw new Error(data.success ? data.data.message : "Unable to delete question");
  }
  questionIdResponseSchema.parse(await response.json());
}

export async function createQuestions(
  formId: string,
  questions: FormQuestion[],
) {
  for (const question of questions) await createQuestion(formId, question);
}
