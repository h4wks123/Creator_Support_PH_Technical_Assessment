import { getAuthToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL ?? "http://localhost:5000";

export interface CreatedForm {
  form_id: string;
  form_title: string;
  form_description: string | null;
  form_slug: string;
  form_is_published: boolean;
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

export async function createForm(input: CreateFormInput): Promise<CreatedForm> {
  const response = await fetch(`${API_URL}/api/forms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as CreateFormResponse;
  if (!response.ok) throw new Error(data.message ?? "Unable to create form");
  return data.form;
}
