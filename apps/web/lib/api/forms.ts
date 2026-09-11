import { getAuthToken } from "@/lib/auth";

export interface CreatedForm {
  form_id: string;
  form_title: string;
  form_description: string | null;
  form_slug: string;
  form_is_published: boolean;
  form_published_at?: string | null;
  form_created_at?: string;
  form_updated_at?: string;
  question_count?: number;
}

interface CreateFormResponse {
  form: CreatedForm;
  message?: string;
}

export interface CreateFormInput {
  title: string;
  description: string;
  isPublished: boolean;
}

export type UpdateFormInput = CreateFormInput;

export async function getForms(): Promise<CreatedForm[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/api/forms`,
    {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    },
  );

  const data = (await response.json()) as {
    forms?: CreatedForm[];
    message?: string;
  };
  if (!response.ok) throw new Error(data.message ?? "Unable to fetch forms");

  if (!data.forms)
    throw new Error("The API returned an invalid forms response");

  return data.forms;
}

export async function getForm(formId: string): Promise<CreatedForm> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/api/forms/${formId}`,
    {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    },
  );

  const data = (await response.json()) as {
    form?: CreatedForm;
    message?: string;
  };

  if (!response.ok) throw new Error(data.message ?? "Unable to fetch form");

  if (!data.form) throw new Error("The API returned an invalid form response");

  return data.form;
}

export async function createForm(input: CreateFormInput): Promise<CreatedForm> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/api/forms`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(input),
    },
  );

  const data = (await response.json()) as CreateFormResponse;

  if (!response.ok) throw new Error(data.message ?? "Unable to create form");

  if (!data.form) throw new Error("The API returned an invalid form response");

  return data.form;
}

export async function updateForm(
  formId: string,
  input: UpdateFormInput,
): Promise<CreatedForm> {
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

  const data = (await response.json()) as CreateFormResponse;
  if (!response.ok) throw new Error(data.message ?? "Unable to save form");
  if (!data.form) throw new Error("Unable to save form");
  return data.form;
}

export async function deleteForm(formId: string): Promise<void> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/api/forms/${formId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    },
  );

  const data = (await response.json()) as { message?: string };
  if (!response.ok) throw new Error(data.message ?? "Unable to delete form");
}
