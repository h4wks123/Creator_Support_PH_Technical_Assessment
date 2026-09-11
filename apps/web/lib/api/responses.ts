import { getAuthToken } from "@/lib/auth";

export interface FormResponseAnswer {
  questionId: string | null;
  label: string;
  type: number;
  order: number;
  value: unknown;
}

export interface FormResponse {
  response_id: string;
  response_respondent_email: string;
  response_submitted_at: string;
  answers: FormResponseAnswer[];
}

export async function getFormResponses(formId: string): Promise<FormResponse[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/api/forms/${formId}/responses`,
    { headers: { Authorization: `Bearer ${getAuthToken()}` } },
  );
  const data = (await response.json()) as { responses?: FormResponse[] };
  if (!response.ok) throw new Error("Unable to load responses");
  if (!data.responses) throw new Error("Unable to load responses");
  return data.responses;
}

export async function getFormResponse(
  formId: string,
  responseId: string,
): Promise<FormResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/api/forms/${formId}/responses/${responseId}`,
    { headers: { Authorization: `Bearer ${getAuthToken()}` } },
  );
  const data = (await response.json()) as { response?: FormResponse };
  if (!response.ok || !data.response) throw new Error("Unable to load response");
  return data.response;
}
