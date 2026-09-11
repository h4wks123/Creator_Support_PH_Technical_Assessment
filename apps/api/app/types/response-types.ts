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