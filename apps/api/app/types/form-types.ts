export interface CreateFormBody {
  title?: unknown;
  description?: unknown;
  isPublished?: unknown;
}

export interface CreateFormInput {
  title: string;
  description: string | null;
  isPublished: boolean;
}

export interface UpdateFormInput {
  title: string;
  description: string | null;
}

export interface UpdateFormStatusInput {
  isPublished: boolean;
}

export interface FormRecord {
  form_id: string;
  form_owner_id: string;
  form_title: string;
  form_description: string | null;
  form_slug: string;
  form_is_published: boolean;
  form_published_at: string | null;
  form_created_at: string;
  form_updated_at: string;
}
