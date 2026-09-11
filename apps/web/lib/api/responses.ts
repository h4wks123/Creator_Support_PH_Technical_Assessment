import { getAuthToken } from "@/lib/auth";
import { z } from "zod";

const formResponseAnswerSchema = z.object({
  questionId: z.string().nullable(),
  label: z.string(),
  type: z.number(),
  order: z.number(),
  value: z.unknown(),
});

const formResponseSchema = z.object({
  response_id: z.string(),
  response_respondent_email: z.string(),
  response_submitted_at: z.string(),
  answers: z.array(formResponseAnswerSchema),
});

const formResponsesPayloadSchema = z.object({
  responses: z.array(formResponseSchema),
});

const formResponsePayloadSchema = z.object({
  response: formResponseSchema,
});

export type FormResponse = z.infer<typeof formResponseSchema>;

export async function getFormResponses(
  formId: string,
  authToken?: string,
): Promise<FormResponse[]> {
  const token = authToken ?? getAuthToken();
  const response = await fetch(
    `${process.env.APP_API_URL}/api/forms/${formId}/responses`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const data = formResponsesPayloadSchema.safeParse(await response.json());
  if (!response.ok) throw new Error("Unable to load responses");
  if (!data.success) throw new Error("Unable to load responses");
  return data.data.responses;
}

export async function getFormResponse(
  formId: string,
  responseId: string,
  authToken = getAuthToken(),
): Promise<FormResponse> {
  const response = await fetch(
    `${process.env.APP_API_URL}/api/forms/${formId}/responses/${responseId}`,
    { headers: { Authorization: `Bearer ${authToken}` } },
  );
  const data = formResponsePayloadSchema.safeParse(await response.json());
  if (!response.ok || !data.success) throw new Error("Unable to load response");
  return data.data.response;
}
