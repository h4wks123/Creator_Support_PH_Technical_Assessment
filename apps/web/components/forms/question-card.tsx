"use client";
import { QuestionComponentProps } from "./questions/question-editor";
import ShortTextQuestion from "./questions/short-text-question";
import LongTextQuestion from "./questions/long-text-question";
import DateQuestion from "./questions/date-question";
import DropdownQuestion from "./questions/dropdown-question";
import MultiSelectQuestion from "./questions/multi-select-question";
import MultipleChoiceQuestion from "./questions/multiple-choice-question";
import CheckboxesQuestion from "./questions/checkboxes-question";
import LinearScaleQuestion from "./questions/linear-scale-question";

const questionComponents = {
  short_text: ShortTextQuestion,
  long_text: LongTextQuestion,
  date: DateQuestion,
  dropdown: DropdownQuestion,
  multi_select: MultiSelectQuestion,
  multiple_choice: MultipleChoiceQuestion,
  checkboxes: CheckboxesQuestion,
  linear_scale: LinearScaleQuestion,
} as const;
export default function QuestionCard(props: QuestionComponentProps) {
  const Component = questionComponents[
    props.question.type
  ] as React.ComponentType<QuestionComponentProps>;
  return <Component {...props} />;
}