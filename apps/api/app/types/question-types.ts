export const QUESTION_TYPE_MIN = 1;
export const QUESTION_TYPE_MAX = 8;

export interface CreateQuestionBody {
  label?: unknown;
  type?: unknown;
  order?: unknown;
  required?: unknown;
  config?: unknown;
}

export interface CreateQuestionInput {
  label: string;
  type: number;
  order?: number;
  required: boolean;
  config: Record<string, unknown>;
}

export interface QuestionRecord {
  question_id: string;
  question_form_id: string;
  question_label: string;
  question_type: number;
  question_order: number;
  question_is_required: boolean;
  question_config: Record<string, unknown>;
  question_deleted_at: string | null;
  question_created_at: string;
  question_updated_at: string;
}
