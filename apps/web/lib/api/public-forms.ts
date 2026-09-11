import type { FormQuestion, QuestionType } from "@/types/forms";

const getApiUrl = () =>
  typeof window === "undefined"
    ? (process.env.APP_API_URL ?? process.env.NEXT_PUBLIC_APP_API_URL)
    : process.env.NEXT_PUBLIC_APP_API_URL;

export interface PublicForm {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  questions: FormQuestion[];
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

export async function getPublicForm(slug: string): Promise<PublicForm> {
  const response = await fetch(
    `${getApiUrl()}/api/public/forms/${encodeURIComponent(slug)}`,
  );
  const data = (await response.json()) as {
    form?: {
      form_id: string;
      form_title: string;
      form_description: string | null;
      form_slug: string;
      questions: Array<{
        question_id: string;
        question_label: string;
        question_type: number;
        question_order: number;
        question_is_required: boolean;
        question_config: Record<string, unknown>;
      }>;
    };
  };
  if (!response.ok || !data.form) throw new Error("Unable to load form");
  return {
    id: data.form.form_id,
    title: data.form.form_title,
    description: data.form.form_description,
    slug: data.form.form_slug,
    questions: data.form.questions.map((question) => {
      const config = question.question_config ?? {};
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
          : [],
        linearScale:
          question.question_type === 8
            ? {
                min: typeof config.min === "number" ? config.min : 1,
                max: typeof config.max === "number" ? config.max : 10,
                minLabel:
                  typeof config.minLabel === "string" ? config.minLabel : "",
                maxLabel:
                  typeof config.maxLabel === "string" ? config.maxLabel : "",
              }
            : undefined,
      };
    }),
  };
}

export async function submitPublicForm(
  slug: string,
  email: string,
  answers: Array<{ questionId: string; value: unknown }>,
) {
  const response = await fetch(
    `${getApiUrl()}/api/public/forms/${encodeURIComponent(slug)}/responses`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, answers }),
    },
  );
  if (!response.ok) throw new Error("Unable to submit form");
}
