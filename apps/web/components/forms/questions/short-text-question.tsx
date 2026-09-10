"use client";
import { QuestionComponentProps, QuestionEditor } from "./question-editor";
export default function ShortTextQuestion(props: QuestionComponentProps) {
  return <QuestionEditor {...props} />;
}
