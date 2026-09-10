"use client";

import { Button } from "@/components/button";
import {
  FormQuestion,
  QUESTION_TYPES,
  QUESTION_TYPE_LABELS,
  QuestionType,
} from "@/types/forms";

const fieldClassName =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-secondary outline-none focus:border-primary";
const optionTypes: QuestionType[] = [
  "dropdown",
  "multi_select",
  "multiple_choice",
  "checkboxes",
];

interface Props {
  question: FormQuestion;
  index: number;
  total: number;
  onChange: (question: FormQuestion) => void;
  onDelete: () => void;
  onMove: (direction: -1 | 1) => void;
}

export default function QuestionCard({
  question,
  index,
  total,
  onChange,
  onDelete,
  onMove,
}: Props) {
  const update = (changes: Partial<FormQuestion>) =>
    onChange({ ...question, ...changes });
  const scale = question.linearScale ?? {
    min: 1,
    max: 10,
    minLabel: "Not likely",
    maxLabel: "Very likely",
  };

  return (
    <article className="border-b border-slate-200 bg-white p-5 first:border-t sm:px-6">
      <div className="flex gap-4">
        <span className="w-7 shrink-0 pt-1 text-center text-xs text-slate-400">
          {index + 1}
        </span>
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

          {optionTypes.includes(question.type) && (
            <div className="mt-4 max-w-80">
              <p className="mb-2 text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400">
                Options
              </p>
              {question.options.map((option, optionIndex) => (
                <div className="mb-2 flex items-center gap-2" key={optionIndex}>
                  <input
                    className={fieldClassName}
                    value={option}
                    onChange={(event) =>
                      update({
                        options: question.options.map(
                          (current, currentIndex) =>
                            currentIndex === optionIndex
                              ? event.target.value
                              : current,
                        ),
                      })
                    }
                  />
                  <button
                    type="button"
                    aria-label={`Remove option ${optionIndex + 1}`}
                    disabled={question.options.length <= 1}
                    onClick={() =>
                      update({
                        options: question.options.filter(
                          (_, currentIndex) => currentIndex !== optionIndex,
                        ),
                      })
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="ml-3 text-xs text-secondary hover:text-primary"
                onClick={() =>
                  update({
                    options: [
                      ...question.options,
                      `Option ${question.options.length + 1}`,
                    ],
                  })
                }
              >
                Add option
              </button>
            </div>
          )}

          {question.type === "linear_scale" && (
            <div className="mt-4 grid max-w-2xl gap-2 sm:grid-cols-4">
              <input
                aria-label="Minimum scale"
                className={fieldClassName}
                type="number"
                value={scale.min}
                onChange={(event) =>
                  update({
                    linearScale: { ...scale, min: Number(event.target.value) },
                  })
                }
              />
              <input
                aria-label="Maximum scale"
                className={fieldClassName}
                type="number"
                value={scale.max}
                onChange={(event) =>
                  update({
                    linearScale: { ...scale, max: Number(event.target.value) },
                  })
                }
              />
              <input
                aria-label="Minimum label"
                className={fieldClassName}
                placeholder="Min label"
                value={scale.minLabel}
                onChange={(event) =>
                  update({
                    linearScale: { ...scale, minLabel: event.target.value },
                  })
                }
              />
              <input
                aria-label="Maximum label"
                className={fieldClassName}
                placeholder="Max label"
                value={scale.maxLabel}
                onChange={(event) =>
                  update({
                    linearScale: { ...scale, maxLabel: event.target.value },
                  })
                }
              />
            </div>
          )}

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
