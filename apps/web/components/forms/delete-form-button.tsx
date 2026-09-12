"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import toaster from "@/components/toaster";
import { Button } from "@/components/button";
import { deleteForm } from "@/lib/api/forms";

export default function DeleteFormButton({ formId }: { formId: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteForm(formId);
        toaster(200, "Form deleted.");
        setIsOpen(false);
        router.refresh();
      } catch {
        toaster(500, "Unable to delete form");
      }
    });
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <Button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={isPending}
        variant="ghost"
        size="ghost"
        interaction="ghost"
        className="px-3 py-2 text-delete hover:underline"
      >
        Delete
      </Button>
      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-form-title"
          >
            <h2
              id="delete-form-title"
              className="font-[Poppins] text-xl font-semibold text-secondary"
            >
              Delete this form?
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              This action cannot be undone. All questions and responses will be
              deleted.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                size="ghost"
                interaction="ghost"
                className="h-10 px-4"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="delete"
                size="ghost"
                className="h-10 px-4 text-white"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? "Deleting..." : "Delete form"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
