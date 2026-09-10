"use client";
import {
  fieldClassName,
  QuestionComponentProps,
  QuestionEditor,
} from "./question-editor";
export default function LinearScaleQuestion({
  question,
  onChange,
  ...props
}: QuestionComponentProps) {
  const scale = question.linearScale!;
  const update = (changes: Partial<typeof scale>) =>
    onChange({ ...question, linearScale: { ...scale, ...changes } });
  return (
    <QuestionEditor question={question} onChange={onChange} {...props}>
      <div className="mt-4 grid max-w-2xl gap-2 sm:grid-cols-4">
        <input
          aria-label="Minimum scale"
          className={fieldClassName}
          type="number"
          value={scale.min}
          onChange={(event) => update({ min: Number(event.target.value) })}
        />
        <input
          aria-label="Maximum scale"
          className={fieldClassName}
          type="number"
          value={scale.max}
          onChange={(event) => update({ max: Number(event.target.value) })}
        />
        <input
          aria-label="Minimum label"
          className={fieldClassName}
          placeholder="Min label"
          value={scale.minLabel}
          onChange={(event) => update({ minLabel: event.target.value })}
        />
        <input
          aria-label="Maximum label"
          className={fieldClassName}
          placeholder="Max label"
          value={scale.maxLabel}
          onChange={(event) => update({ maxLabel: event.target.value })}
        />
      </div>
    </QuestionEditor>
  );
}
