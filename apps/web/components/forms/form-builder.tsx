"use client";

import { Button } from "@/components/button";
import QuestionCard from "@/components/forms/question-card";
import {
  createQuestion,
  FormDraft,
  FormQuestion,
  QUESTION_TYPES,
  QUESTION_TYPE_LABELS,
  QuestionType,
} from "@/types/forms";
import { useState } from "react";
import Link from "next/link";
import { createForm } from "@/lib/api/forms";
import { createQuestions } from "@/lib/api/questions";
import toaster from "@/components/toaster";

const initialDraft: FormDraft = {
  title: "Untitled form",
  description: "",
  questions: [],
  published: false,
};

export default function FormBuilder({ formId }: { formId: string }) {
  const [draft, setDraft] = useState<FormDraft>(initialDraft);
  const [hasSaved, setHasSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const updateQuestions = (questions: FormQuestion[]) =>
    setDraft((current) => ({
      ...current,
      questions: questions.map((question, index) => ({
        ...question,
        order: index + 1,
      })),
    }));
  const addQuestion = (type: QuestionType) =>
    updateQuestions([
      ...draft.questions,
      createQuestion(type, draft.questions.length + 1),
    ]);
  const moveQuestion = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= draft.questions.length) return;
    const questions = [...draft.questions];
    [questions[index], questions[target]] = [
      questions[target],
      questions[index],
    ];
    updateQuestions(questions);
  };
  const publishForm = async () => {
    if (formId !== "new" || isSaving) return;

    setIsSaving(true);
    try {
      const form = await createForm({
        title: draft.title,
        description: draft.description,
        isPublished: true,
      });
      await createQuestions(form.form_id, draft.questions);
      setDraft((current) => ({ ...current, published: true }));
      setHasSaved(true);
      toaster(200, "Form created");
    } catch (error) {
      toaster(
        500,
        error instanceof Error ? error.message : "Unable to create form",
      );
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div
      data-form-id={formId}
      className="min-h-[calc(100dvh-57px)] bg-[#f7f8fa] text-secondary"
    >
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-360 px-5">
          <div className="flex h-12 items-center gap-3 text-sm">
            <Link href="/form" className="text-slate-500">
              ← All forms
            </Link>
            <span className="text-slate-300">|</span>
            <strong className="text-lg">{draft.title}</strong>
            <div className="ml-auto flex items-center gap-3">
              <span className="text-xs text-slate-500">
                {draft.published ? "Published" : "Draft"}
              </span>
              <Button
                size="small"
                className="h-8 w-auto px-4 text-white"
                onClick={publishForm}
                disabled={isSaving || formId !== "new"}
              >
                {isSaving
                  ? "Saving..."
                  : draft.published
                    ? "Published"
                    : "Publish"}
              </Button>
            </div>
          </div>
          <div className="flex gap-5 text-xs">
            <button
              type="button"
              className="border-b-2 border-primary pb-3 pt-1"
            >
              Build
            </button>
            <button type="button" className="pb-3 pt-1 text-slate-400">
              Responses (0)
            </button>
            <button type="button" className="pb-3 pt-1 text-slate-400">
              Webhook
            </button>
          </div>
        </div>
      </div>
      <div className="mx-auto w-full max-w-360 px-5 py-8">
        {formId !== "new" ? (
          <div role="status" className="mb-4 text-xs text-slate-500">
            Editing an existing form is not available yet because the backend
            currently exposes form creation only.
          </div>
        ) : null}
        {hasSaved ? (
          <div role="status" className="mb-4 text-xs text-green-700">
            Form and questions were saved.
          </div>
        ) : null}
        <section className="border-b border-slate-200 pb-6">
          <input
            aria-label="Form title"
            className="w-full bg-transparent font-[Poppins] text-2xl font-semibold outline-none"
            value={draft.title}
            onChange={(event) =>
              setDraft({ ...draft, title: event.target.value })
            }
          />
          <textarea
            aria-label="Form description"
            className="mt-4 min-h-12 w-full resize-y bg-transparent text-sm text-slate-500 outline-none"
            value={draft.description}
            onChange={(event) =>
              setDraft({ ...draft, description: event.target.value })
            }
            placeholder="Description (optional)"
          />
        </section>
        <section className="pt-3">
          <p className="mb-4 text-xs text-slate-500">
            Email address — always collected, always required.
          </p>
          <div className="space-y-0">
            {draft.questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                total={draft.questions.length}
                onChange={(updated) =>
                  updateQuestions(
                    draft.questions.map((current) =>
                      current.id === updated.id ? updated : current,
                    ),
                  )
                }
                onDelete={() =>
                  updateQuestions(
                    draft.questions.filter(
                      (current) => current.id !== question.id,
                    ),
                  )
                }
                onMove={(direction) => moveQuestion(index, direction)}
              />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs text-slate-500">Add question:</span>
            {QUESTION_TYPES.map((type) => (
              <button
                type="button"
                key={type}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs hover:border-primary hover:text-primary"
                onClick={() => addQuestion(type)}
              >
                {QUESTION_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
