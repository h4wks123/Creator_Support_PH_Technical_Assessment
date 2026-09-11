"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/button";
import toaster from "@/components/toaster";
import {
  getPublicForm,
  submitPublicForm,
  type PublicForm,
} from "@/lib/api/public-forms";
import { validatePublicForm } from "@/utils/utils";
import type { FormQuestion } from "@/types/forms";

const SERVER_ERROR_MESSAGE = "Unable to submit form. Please try again.";
type AnswerValue = string | string[] | number;

export default function PublicForm({ slug }: { slug: string }) {
  const [form, setForm] = useState<PublicForm | null>(null);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const loadedForm = await getPublicForm(slug);
        if (active) setForm(loadedForm);
      } catch {
        if (active)
          toaster(
            404,
            "Unable to load form. Please check the link and try again.",
          );
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [slug]);

  const updateAnswer = (questionId: string, value: AnswerValue) => {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    setErrors((current) => ({ ...current, [questionId]: "" }));
  };

  const validate = () => {
    return validatePublicForm(email, form?.questions ?? [], answers);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toaster(400, "Please check your answers and try again.");
      return;
    }
    setSubmitting(true);
    try {
      await submitPublicForm(
        slug,
        email.trim(),
        (form?.questions ?? []).map((question) => ({
          questionId: question.id,
          value: answers[question.id] ?? null,
        })),
      );
      setSubmitted(true);
    } catch {
      toaster(500, SERVER_ERROR_MESSAGE);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <main className="mx-auto max-w-3xl px-5 py-16 text-sm text-slate-500">
        Loading form...
      </main>
    );
  if (!form) return <main className="mx-auto max-w-3xl px-5 py-16" />;
  if (submitted)
    return (
      <main className="mx-auto max-w-3xl px-5 py-16">
        <section className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Response submitted
          </p>
          <h1 className="mt-3 font-[Poppins] text-2xl font-semibold">
            Thank you for your response.
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Your answers have been recorded.
          </p>
        </section>
      </main>
    );

  return (
    <main className="min-h-[calc(100dvh-57px)] bg-[#f7f8fa] px-5 py-10 text-secondary">
      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-4">
        <header className="rounded-xl border-t-4 border-primary bg-white p-7 shadow-sm">
          <h1 className="font-[Poppins] text-3xl font-semibold">
            {form.title}
          </h1>
          {form.description ? (
            <p className="mt-3 whitespace-pre-wrap text-sm text-slate-500">
              {form.description}
            </p>
          ) : null}
        </header>
        <FieldError message={errors.email}>
          <label
            className="block text-sm font-medium"
            htmlFor="respondent-email"
          >
            Email address <span className="text-primary">*</span>
          </label>
          <input
            id="respondent-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </FieldError>
        {form.questions.map((question) => (
          <QuestionInput
            key={question.id}
            question={question}
            value={answers[question.id]}
            error={errors[question.id]}
            onChange={(value) => updateAnswer(question.id, value)}
          />
        ))}
        <Button type="submit" disabled={submitting} className="text-white">
          {submitting ? "Submitting..." : "Submit response"}
        </Button>
      </form>
    </main>
  );
}

function FieldError({
  message,
  children,
}: {
  message?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-xl border bg-white p-6 shadow-sm ${message ? "border-delete" : "border-slate-200"}`}
    >
      {children}
      {message ? <p className="mt-2 text-xs text-delete">{message}</p> : null}
    </section>
  );
}

function QuestionInput({
  question,
  value,
  error,
  onChange,
}: {
  question: FormQuestion;
  value?: AnswerValue;
  error?: string;
  onChange: (value: AnswerValue) => void;
}) {
  const inputClass = `mt-2 w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-primary ${error ? "border-delete" : "border-slate-200"}`;
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
          className={`${inputClass} min-h-28 resize-y`}
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
          className={`${inputClass} min-h-28`}
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
            <output
              htmlFor={question.id}
              className="min-w-10 rounded-md bg-primary px-2 py-1 text-center text-sm font-semibold text-white"
            >
              {typeof value === "number" ? value : scale.min}
            </output>
            <span className="text-right text-xs text-slate-500">
              {scale.maxLabel}
            </span>
          </div>
          <input
            id={question.id}
            name={question.id}
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
