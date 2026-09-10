"use client";
import OptionList from "./option-list";
import { QuestionComponentProps, QuestionEditor } from "./question-editor";
export default function DropdownQuestion({
  question,
  onChange,
  ...props
}: QuestionComponentProps) {
  return (
    <QuestionEditor question={question} onChange={onChange} {...props}>
      <OptionList
        options={question.options}
        onChange={(options) => onChange({ ...question, options })}
      />
    </QuestionEditor>
  );
}
