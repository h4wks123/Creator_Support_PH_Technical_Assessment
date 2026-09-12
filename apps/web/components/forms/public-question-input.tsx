import type { FormQuestion } from "@/types/forms";
import { cn } from "@/utils/utils";

export function FieldError({
  message,
  children,
}: {
  message?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border bg-white p-6 shadow-sm",
        message ? "border-delete" : "border-slate-200",
      )}
    >
      {children}
      {message ? <p className="mt-2 text-xs text-delete">{message}</p> : null}
    </section>
  );
}

export function QuestionInput({
  question,
  value,
  error,
  onChange,
}: {
  question: FormQuestion;
  value?: string | string[] | number;
  error?: string;
  onChange: (value: string | string[] | number) => void;
}) {
  const inputClass = cn(
    "mt-2 w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-primary",
    error ? "border-delete" : "border-slate-200",
  );
  const options = question.options.length
    ? question.options
    : ["No options configured"];
  const toggle = (option: string) => {
    const current = Array.isArray(value) ? value : [];
    onChange(
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option],
    );
  };
  let input: React.ReactNode;

  switch (question.type) {
    case "long_text":
      input = (
        <textarea
          className={cn(inputClass, "min-h-28 resize-y")}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
        />
      );
      break;
    case "date":
      input = (
        <input
          className={inputClass}
          type="date"
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
        />
      );
      break;
    case "dropdown":
      input = (
        <select
          className={inputClass}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      );
      break;
    case "multi_select":
      input = (
        <select
          multiple
          className={cn(inputClass, "min-h-28")}
          value={Array.isArray(value) ? value : []}
          onChange={(event) =>
            onChange(
              Array.from(
                event.target.selectedOptions,
                (option) => option.value,
              ),
            )
          }
        >
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      );
      break;
    case "multiple_choice":
      input = (
        <div className="mt-3 space-y-2">
          {options.map((option) => (
            <label key={option} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={question.id}
                checked={value === option}
                onChange={() => onChange(option)}
              />
              {option}
            </label>
          ))}
        </div>
      );
      break;
    case "checkboxes":
      input = (
        <div className="mt-3 space-y-2">
          {options.map((option) => (
            <label key={option} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Array.isArray(value) && value.includes(option)}
                onChange={() => toggle(option)}
              />
              {option}
            </label>
          ))}
        </div>
      );
      break;
    case "linear_scale": {
      const scale = question.linearScale ?? {
        min: 1,
        max: 10,
        minLabel: "",
        maxLabel: "",
      };
      input = (
        <div className="mt-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-slate-500">{scale.minLabel}</span>
            <output className="min-w-10 rounded-md bg-primary px-2 py-1 text-center text-sm font-semibold text-white">
              {typeof value === "number" ? value : scale.min}
            </output>
            <span className="text-right text-xs text-slate-500">
              {scale.maxLabel}
            </span>
          </div>
          <input
            type="range"
            min={scale.min}
            max={scale.max}
            step={1}
            value={typeof value === "number" ? value : scale.min}
            onChange={(event) => onChange(Number(event.target.value))}
            aria-label={`${question.label} scale`}
            className="mt-4 h-2 w-full cursor-pointer accent-primary"
          />
          <div className="mt-1 flex justify-between text-xs font-medium text-slate-400">
            <span>{scale.min}</span>
            <span>{scale.max}</span>
          </div>
        </div>
      );
      break;
    }
    default:
      input = (
        <input
          className={inputClass}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
        />
      );
  }

  return (
    <FieldError message={error}>
      <label className="block text-sm font-medium">
        {question.label}{" "}
        {question.required ? <span className="text-primary">*</span> : null}
      </label>
      {input}
    </FieldError>
  );
}
