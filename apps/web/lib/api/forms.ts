import { getAuthToken } from "@/lib/auth";
import { z } from "zod";
import {
  formListRecordSchema,
  formRecordSchema,
  type FormListRecord,
  type FormRecord,
} from "@/types/api";

const getApiUrl = () =>
  typeof window === "undefined"
    ? (process.env.APP_API_URL ?? process.env.NEXT_PUBLIC_APP_API_URL)
    : process.env.NEXT_PUBLIC_APP_API_URL;

export type CreatedForm = FormRecord;
export const FORM_UPDATED_EVENT = "form-updated";

const formPayloadSchema = z.object({ form: formRecordSchema });
const formsPayloadSchema = z.object({ forms: z.array(formListRecordSchema) });
const deleteFormResponseSchema = z.object({ formId: z.string() });

const createFormInputSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().max(5000),
  isPublished: z.boolean(),
});
export type CreateFormInput = z.infer<typeof createFormInputSchema>;

export type UpdateFormInput = CreateFormInput;

export async function getForms(authToken?: string): Promise<FormListRecord[]> {
  const token = authToken ?? getAuthToken();
  const response = await fetch(
    `${process.env.APP_API_URL ?? process.env.NEXT_PUBLIC_APP_API_URL}/api/forms`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!response.ok) throw new Error("Unable to fetch forms");
  return formsPayloadSchema.parse(await response.json()).forms;
}

export async function getForm(
  formId: string,
  authToken?: string,
): Promise<CreatedForm> {
  const token = authToken ?? getAuthToken();
  const response = await fetch(`${getApiUrl()}/api/forms/${formId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Unable to fetch form");
  return formPayloadSchema.parse(await response.json()).form;
}

export async function createForm(
  input: CreateFormInput,
  authToken?: string,
): Promise<CreatedForm> {
  createFormInputSchema.parse(input);
  const token = authToken ?? getAuthToken();
  const response = await fetch(`${getApiUrl()}/api/forms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) throw new Error("Unable to create form");
  return formPayloadSchema.parse(await response.json()).form;
}

export async function updateForm(
  formId: string,
  input: UpdateFormInput,
): Promise<CreatedForm> {
  createFormInputSchema.parse(input);
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/api/forms/${formId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) throw new Error("Unable to save form");
  return formPayloadSchema.parse(await response.json()).form;
}

export async function deleteForm(
  formId: string,
  authToken?: string,
): Promise<void> {
  const token = authToken ?? getAuthToken();
  const response = await fetch(
    `${process.env.APP_API_URL ?? process.env.NEXT_PUBLIC_APP_API_URL}/api/forms/${formId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!response.ok) throw new Error("Unable to delete form");
  deleteFormResponseSchema.parse(await response.json());
}
