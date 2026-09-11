import { publicFormRecordSchema } from "@/types/api";
import { QUESTION_TYPES, formQuestionSchema } from "@/types/forms";
import { z } from "zod";

const getApiUrl = () =>
  typeof window === "undefined"
    ? (process.env.APP_API_URL ?? process.env.NEXT_PUBLIC_APP_API_URL)
    : process.env.NEXT_PUBLIC_APP_API_URL;

export const publicFormSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  slug: z.string(),
  questions: z.array(formQuestionSchema),
});
export type PublicForm = z.infer<typeof publicFormSchema>;

const publicFormPayloadSchema = z.object({ form: publicFormRecordSchema });

export async function getPublicForm(slug: string): Promise<PublicForm> {
  const response = await fetch(
    `${getApiUrl()}/api/public/forms/${encodeURIComponent(slug)}`,
  );
  if (!response.ok) throw new Error("Unable to load form");
  const data = publicFormPayloadSchema.parse(await response.json()).form;
  const publicForm = {
    id: data.form_id,
    title: data.form_title,
    description: data.form_description,
    slug: data.form_slug,
    questions: data.questions.map((question) => {
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
  return publicFormSchema.parse(publicForm);
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
