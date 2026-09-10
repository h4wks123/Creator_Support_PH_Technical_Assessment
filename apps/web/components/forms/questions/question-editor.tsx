"use client";

import { Button } from "@/components/button";
import {
  FormQuestion,
  QUESTION_TYPES,
  QUESTION_TYPE_LABELS,
  QuestionType,
} from "@/types/forms";

export const fieldClassName =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-secondary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10";

export interface QuestionComponentProps {
  question: FormQuestion;
  index: number;
  total: number;
  onChange: (question: FormQuestion) => void;
  onDelete: () => void;
  onMove: (direction: -1 | 1) => void;
}

export function QuestionEditor({
  question,
  index,
  total,
  onChange,
  onDelete,
  onMove,
  children,
}: QuestionComponentProps & { children?: React.ReactNode }) {
  const update = (changes: Partial<FormQuestion>) =>
    onChange({ ...question, ...changes });
  return (
    <article className="border-b border-slate-200 bg-white p-5 first:border-t sm:px-6">
      <div className="flex gap-4">
        <div className="flex w-7 shrink-0 flex-col items-center gap-2 pt-1 text-xs text-slate-400">
          <span>{index + 1}</span>
          <span
            aria-hidden="true"
            className="cursor-grab leading-1.25 tracking-widest"
          >
            ⋮<br />⋮
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              aria-label="Question label"
              className={`${fieldClassName} flex-1`}
              placeholder="Question label"
              value={
                question.label === "Untitled question" ? "" : question.label
              }
              onChange={(event) =>
                update({ label: event.target.value || "Untitled question" })
              }
            />
            <select
              aria-label="Question type"
              className={`${fieldClassName} sm:max-w-44`}
              value={question.type}
              onChange={(event) =>
                update({ type: event.target.value as QuestionType })
              }
            >
              {QUESTION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {QUESTION_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>
          {children}
          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
            <label className="flex items-center gap-2 text-xs text-secondary">
              <input
                type="checkbox"
                className="h-4 w-4 accent-primary"
                checked={question.required}
                onChange={(event) => update({ required: event.target.checked })}
              />
              Required
            </label>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="ghost"
                className="h-7 w-7 p-0 text-slate-400"
                disabled={index === 0}
                onClick={() => onMove(-1)}
                aria-label="Move question up"
              >
                ↑
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="ghost"
                className="h-7 w-7 p-0 text-slate-400"
                disabled={index === total - 1}
                onClick={() => onMove(1)}
                aria-label="Move question down"
              >
                ↓
              </Button>
              <button
                type="button"
                className="px-2 text-xs text-secondary hover:text-delete"
                onClick={onDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
