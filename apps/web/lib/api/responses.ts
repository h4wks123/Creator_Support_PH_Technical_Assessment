import { getAuthToken } from "@/lib/auth";
import {
  formResponsePayloadSchema,
  formResponsesPayloadSchema,
  type ResponseRecord,
} from "@/types/api";

export type FormResponse = ResponseRecord;

export async function getFormResponses(
  formId: string,
  authToken?: string,
): Promise<FormResponse[]> {
  const token = authToken ?? getAuthToken();
  const response = await fetch(
    `${process.env.APP_API_URL}/api/forms/${formId}/responses`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!response.ok) throw new Error("Unable to load responses");
  return formResponsesPayloadSchema.parse(await response.json()).responses;
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
  if (!response.ok) throw new Error("Unable to load response");
  return formResponsePayloadSchema.parse(await response.json()).response;
}
