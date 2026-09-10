export const QUESTION_TYPES = [
  "short_text",
  "long_text",
  "date",
  "dropdown",
  "multi_select",
  "multiple_choice",
  "checkboxes",
  "linear_scale",
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

export interface LinearScaleConfig {
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
}

export interface FormQuestion {
  id: string;
  label: string;
  type: QuestionType;
  order: number;
  required: boolean;
  options: string[];
  linearScale?: LinearScaleConfig;
}

export interface FormDraft {
  title: string;
  description: string;
  questions: FormQuestion[];
  published: boolean;
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  short_text: "Short text",
  long_text: "Long text",
  date: "Date",
  dropdown: "Dropdown",
  multi_select: "Multi-select dropdown",
  multiple_choice: "Multiple choice",
  checkboxes: "Checkboxes",
  linear_scale: "Linear scale",
};

export const createQuestion = (
  type: QuestionType = "short_text",
  order = 1,
): FormQuestion => ({
  id: `question-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  label: "Untitled question",
  type,
  order,
  required: false,
  options: ["Option 1", "Option 2"],
  linearScale: { min: 1, max: 10, minLabel: "Not likely", maxLabel: "Very likely" },
});
