"use client";

import { useState } from "react";
import toaster from "@/components/toaster";
import { submitPublicForm, type PublicForm } from "@/lib/api/public-forms";
import { validatePublicForm } from "@/utils/utils";
import {
  FieldError,
  QuestionInput,
} from "@/components/forms/public-question-input";
import { Button } from "@/components/button";

type AnswerValue = string | string[] | number;

export default function PublicFormFields({ form }: { form: PublicForm }) {
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const updateAnswer = (id: string, value: AnswerValue) => {
    setAnswers((current) => ({ ...current, [id]: value }));
    setErrors((current) => ({ ...current, [id]: "" }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validatePublicForm(email, form.questions, answers);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toaster(400, "Please check your answers and try again.");
      return;
    }
    setSubmitting(true);
    try {
      await submitPublicForm(
        form.slug,
        email.trim(),
        form.questions.map((question) => ({
          questionId: question.id,
          value: answers[question.id] ?? null,
        })),
      );
      setSubmitted(true);
    } catch {
      toaster(500, "Unable to submit form. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
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
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-4">
      <FieldError message={errors.email}>
        <label className="block text-sm font-medium" htmlFor="respondent-email">
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
      <Button
        type="submit"
        disabled={submitting}
        size="ghost"
        className="h-10 w-auto px-6 text-white"
      >
        {submitting ? "Submitting..." : "Submit response"}
      </Button>
    </form>
  );
}
