import { getAuthToken } from "@/lib/auth";
import type { FormQuestion, QuestionType } from "@/types/forms";

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

interface CreateQuestionResponse {
  question: { question_id: string; question_form_id: string };
  message?: string;
}

interface QuestionRecord {
  question_id: string;
  question_label: string;
  question_type: number;
  question_order: number;
  question_is_required: boolean;
  question_config: Record<string, unknown>;
}

const QUESTION_TYPES: QuestionType[] = [
  "short_text",
  "long_text",
  "date",
  "dropdown",
  "multi_select",
  "multiple_choice",
  "checkboxes",
  "linear_scale",
];

export async function getQuestions(
  formId: string,
  authToken?: string,
): Promise<FormQuestion[]> {
  const token = authToken ?? getAuthToken();
  const response = await fetch(`${getApiUrl()}/api/forms/${formId}/questions`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = (await response.json()) as {
    questions?: QuestionRecord[];
    message?: string;
  };
  if (!response.ok)
    throw new Error(data.message ?? "Unable to fetch questions");

  return (data.questions ?? []).map((question) => {
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

  const data = (await response.json()) as CreateQuestionResponse;
  if (!response.ok)
    throw new Error(data.message ?? "Unable to create question");
  if (!data.question)
    throw new Error("The API returned an invalid question response");
  return data.question;
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

  const data = (await response.json()) as CreateQuestionResponse;
  if (!response.ok) throw new Error(data.message ?? "Unable to save question");
  if (!data.question) throw new Error("Unable to save question");
  return data.question;
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

  const data = (await response.json()) as { message?: string };
  if (!response.ok)
    throw new Error(data.message ?? "Unable to reorder questions");
}

export async function deleteQuestion(formId: string, questionId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/api/forms/${formId}/questions/${questionId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    },
  );

  const data = (await response.json()) as { message?: string };
  if (!response.ok)
    throw new Error(data.message ?? "Unable to delete question");
}

export async function createQuestions(
  formId: string,
  questions: FormQuestion[],
) {
  for (const question of questions) await createQuestion(formId, question);
}
