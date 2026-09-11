"use client";

import { Button } from "@/components/button";
import QuestionCard from "@/components/forms/question-card";
import {
  createQuestion as createLocalQuestion,
  FormDraft,
  FormQuestion,
  QUESTION_TYPES,
  QUESTION_TYPE_LABELS,
  QuestionType,
} from "@/types/forms";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createForm, getForm, updateForm } from "@/lib/api/forms";
import { getAuthToken } from "@/lib/auth";
import {
  createQuestion,
  deleteQuestion,
  getQuestions,
  reorderQuestions,
  updateQuestion,
} from "@/lib/api/questions";
import toaster from "@/components/toaster";

const initialDraft: FormDraft = {
  title: "Untitled form",
  description: "",
  questions: [],
  published: false,
};
const FORM_SAVE_DEBOUNCE_MS = 500;

export default function FormBuilder({ formId }: { formId: string }) {
  const router = useRouter();
  const [draft, setDraft] = useState<FormDraft>(initialDraft);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const createDraftRequest = useRef<ReturnType<typeof createForm> | null>(null);
  const saveFormTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadForm() {
      try {
        if (formId === "new") {
          if (!createDraftRequest.current) {
            createDraftRequest.current = createForm({
              title: initialDraft.title,
              description: initialDraft.description,
              isPublished: false,
            });
          }
          const form = await createDraftRequest.current;
          if (isActive) router.replace(`/form/${form.form_id}`);
          return;
        }

        const [form, questions] = await Promise.all([
          getForm(formId),
          getQuestions(formId),
        ]);
        if (!isActive) return;
        setDraft({
          title: form.form_title,
          description: form.form_description ?? "",
          published: form.form_is_published,
          questions,
        });
        setIsLoading(false);
      } catch {
        if (!isActive) return;
        router.replace(getAuthToken() ? "/" : "/login");
      }
    }

    void loadForm();
    return () => {
      isActive = false;
      if (saveFormTimeout.current) {
        clearTimeout(saveFormTimeout.current);
        saveFormTimeout.current = null;
      }
    };
  }, [formId, router]);

  const saveForm = async (nextDraft: FormDraft) => {
    if (formId === "new") return;
    setIsSaving(true);
    try {
      await updateForm(formId, {
        title: nextDraft.title,
        description: nextDraft.description,
        isPublished: nextDraft.published,
      });
    } catch (error) {
      toaster(
        500,
        error instanceof Error ? error.message : "Unable to save form",
      );
    }
    setIsSaving(false);
  };

  const updateDraft = (changes: Partial<FormDraft>) => {
    const nextDraft = { ...draft, ...changes };
    setDraft(nextDraft);
    if (saveFormTimeout.current) clearTimeout(saveFormTimeout.current);
    saveFormTimeout.current = setTimeout(() => {
      saveFormTimeout.current = null;
      void saveForm(nextDraft);
    }, FORM_SAVE_DEBOUNCE_MS);
  };

  const updateQuestions = (questions: FormQuestion[]) => {
    setDraft((current) => ({
      ...current,
      questions: questions.map((question, index) => ({
        ...question,
        order: index + 1,
      })),
    }));
  };

  const addQuestion = async (type: QuestionType) => {
    try {
      const latestQuestions = await getQuestions(formId);
      setDraft((current) => ({ ...current, questions: latestQuestions }));

      const question = createLocalQuestion(type, latestQuestions.length + 1);
      await createQuestion(formId, question);
      const savedQuestions = await getQuestions(formId);
      setDraft((current) => ({ ...current, questions: savedQuestions }));
    } catch {
      toaster(500, "Unable to save question");
    }
  };

  const moveQuestion = async (index: number, direction: -1 | 1) => {
    const questionId = draft.questions[index]?.id;
    if (!questionId || questionId.startsWith("question-")) return;

    try {
      const latestQuestions = await getQuestions(formId);
      const latestIndex = latestQuestions.findIndex(
        (question) => question.id === questionId,
      );
      const target = latestIndex + direction;
      if (latestIndex < 0 || target < 0 || target >= latestQuestions.length) {
        setDraft((current) => ({ ...current, questions: latestQuestions }));
        return;
      }

      const reorderedQuestions = [...latestQuestions];
      [reorderedQuestions[latestIndex], reorderedQuestions[target]] = [
        reorderedQuestions[target],
        reorderedQuestions[latestIndex],
      ];
      setDraft((current) => ({ ...current, questions: reorderedQuestions }));
      await reorderQuestions(
        formId,
        reorderedQuestions.map((question) => question.id),
      );
    } catch {
      const latestQuestions = await getQuestions(formId).catch(() => null);
      if (latestQuestions) {
        setDraft((current) => ({ ...current, questions: latestQuestions }));
      }
      toaster(500, "Unable to save question order");
    }
  };

  const updateDraftQuestion = (question: FormQuestion) => {
    updateQuestions(
      draft.questions.map((current) =>
        current.id === question.id ? question : current,
      ),
    );
    void updateQuestion(formId, question).catch(() =>
      toaster(500, "Unable to save question"),
    );
  };

  const removeQuestion = async (question: FormQuestion) => {
    updateQuestions(
      draft.questions.filter((current) => current.id !== question.id),
    );
    try {
      await deleteQuestion(formId, question.id);
    } catch {
      toaster(500, "Unable to delete question");
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
            <Link href="/" className="text-slate-500">
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
                onClick={() => updateDraft({ published: !draft.published })}
                disabled={isSaving || isLoading}
              >
                {isSaving
                  ? "Saving..."
                  : draft.published
                    ? "Unpublish"
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
        {isLoading ? (
          <div role="status" className="mb-4 text-xs text-slate-500">
            Saving or loading form...
          </div>
        ) : null}
        <section className="border-b border-slate-200 pb-6">
          <input
            aria-label="Form title"
            className="w-full bg-transparent font-[Poppins] text-2xl font-semibold outline-none"
            value={draft.title}
            onChange={(event) => updateDraft({ title: event.target.value })}
            disabled={isLoading || formId === "new"}
          />
          <textarea
            aria-label="Form description"
            className="mt-4 min-h-12 w-full resize-y bg-transparent text-sm text-slate-500 outline-none"
            value={draft.description}
            onChange={(event) =>
              updateDraft({ description: event.target.value })
            }
            placeholder="Description (optional)"
            disabled={isLoading || formId === "new"}
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
                onChange={updateDraftQuestion}
                onDelete={() => void removeQuestion(question)}
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
                onClick={() => void addQuestion(type)}
                disabled={isLoading || formId === "new"}
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
