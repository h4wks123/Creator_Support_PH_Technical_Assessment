import { getAuthToken } from "@/lib/auth";
import type { FormQuestion, QuestionType } from "@/types/forms";

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL ?? "http://localhost:5000";

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

function getConfig(question: FormQuestion): Record<string, unknown> {
  if (["dropdown", "multi_select", "multiple_choice", "checkboxes"].includes(question.type)) {
    return { options: question.options };
  }
  if (question.type === "linear_scale" && question.linearScale) return { ...question.linearScale };
  return {};
}

export async function createQuestion(formId: string, question: FormQuestion) {
  const response = await fetch(`${API_URL}/api/forms/${formId}/questions`, {
    method: "POST",
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
  });

  const data = (await response.json()) as CreateQuestionResponse;
  if (!response.ok) throw new Error(data.message ?? "Unable to create question");
  return data.question;
}

export async function createQuestions(formId: string, questions: FormQuestion[]) {
  for (const question of questions) await createQuestion(formId, question);
}
