export interface SubmitResponseBody {
  email?: unknown;
  answers?: unknown;
}

export interface SubmittedAnswer {
  questionId: string;
  value: unknown;
}

export interface SubmitResponseInput {
  email: string;
  answers: SubmittedAnswer[];
}

export interface QuestionForResponseValidation {
  question_id: string;
  question_type: number;
  question_is_required: boolean;
  question_config: Record<string, unknown>;
}

export interface ResponseValidationFailure {
  reason: string;
  questionId?: string;
}
