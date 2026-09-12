"use client";

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
import { updateForm } from "@/lib/api/forms";
import {
  createQuestion,
  deleteQuestion,
  getQuestions,
  reorderQuestions,
  updateQuestion,
} from "@/lib/api/questions";
import toaster from "@/components/toaster";
import { Button } from "@/components/button";
import {
  type FormValidationErrors,
  type QuestionValidationErrors,
  validateForm,
  validateQuestion,
} from "@/utils/utils";

const FORM_SAVE_DEBOUNCE_MS = 500;

export default function FormBuilder({
  formId,
  initialDraft,
}: {
  formId: string;
  initialDraft: FormDraft;
}) {
  const [draft, setDraft] = useState<FormDraft>(initialDraft);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<FormValidationErrors>({});
  const [questionErrors, setQuestionErrors] = useState<
    Record<string, QuestionValidationErrors>
  >({});
  const saveFormTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (saveFormTimeout.current) clearTimeout(saveFormTimeout.current);
    },
    [],
  );

  const saveForm = async (nextDraft: FormDraft) => {
    setIsSaving(true);
    try {
      await updateForm(formId, {
        title: nextDraft.title,
        description: nextDraft.description,
        isPublished: nextDraft.published,
      });
    } catch (error) {
      setFormErrors({
        server: error instanceof Error ? error.message : "Unable to save form",
      });
    }
    setIsSaving(false);
  };

  const updateDraft = (changes: Partial<FormDraft>) => {
    const nextDraft = { ...draft, ...changes };
    const errors = validateForm(nextDraft.title, nextDraft.description);
    setDraft(nextDraft);
    setFormErrors(errors);
    if (saveFormTimeout.current) clearTimeout(saveFormTimeout.current);
    if (Object.keys(errors).length) return;
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
    const errors = validateQuestion(question);
    setQuestionErrors((current) => ({ ...current, [question.id]: errors }));
    updateQuestions(
      draft.questions.map((current) =>
        current.id === question.id ? question : current,
      ),
    );
    if (Object.keys(errors).length) return;
    void updateQuestion(formId, question).catch((error) =>
      setQuestionErrors((current) => ({
        ...current,
        [question.id]: {
          ...current[question.id],
          server:
            error instanceof Error ? error.message : "Unable to save question",
        },
      })),
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
    <>
      <section className="border-b border-slate-200 pb-6">
        <input
          aria-label="Form title"
          className="w-full bg-transparent font-[Poppins] text-2xl font-semibold outline-none"
          value={draft.title}
          onChange={(event) => updateDraft({ title: event.target.value })}
        />
        {formErrors.title ? (
          <p className="mt-1 text-xs text-delete">{formErrors.title}</p>
        ) : null}
        <textarea
          aria-label="Form description"
          className="mt-4 min-h-12 w-full resize-y bg-transparent text-sm text-slate-500 outline-none"
          value={draft.description}
          onChange={(event) => updateDraft({ description: event.target.value })}
          placeholder="Description (optional)"
        />
        {formErrors.description ? (
          <p className="mt-1 text-xs text-delete">{formErrors.description}</p>
        ) : null}
        {formErrors.server ? (
          <p className="mt-2 text-xs text-delete">{formErrors.server}</p>
        ) : null}
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
              errors={questionErrors[question.id]}
              onDelete={() => void removeQuestion(question)}
              onMove={(direction) => moveQuestion(index, direction)}
            />
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs text-slate-500">Add question:</span>
          {QUESTION_TYPES.map((type) => (
            <Button
              type="button"
              key={type}
              variant="outline"
              size="ghost"
              text="small"
              interaction="ghost"
              className="rounded-md border-slate-300 bg-white px-3 py-1.5 text-xs hover:border-primary hover:text-primary"
              onClick={() => void addQuestion(type)}
              disabled={isSaving}
            >
              {QUESTION_TYPE_LABELS[type]}
            </Button>
          ))}
        </div>
      </section>
    </>
  );
}
