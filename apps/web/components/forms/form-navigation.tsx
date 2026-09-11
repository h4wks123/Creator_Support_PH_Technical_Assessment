"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/button";
import { getForm, updateForm, type CreatedForm } from "@/lib/api/forms";
import toaster from "@/components/toaster";

export default function FormNavigation({ formId }: { formId: string }) {
  const pathname = usePathname();
  const [form, setForm] = useState<CreatedForm | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;
    void getForm(formId)
      .then((loadedForm) => {
        if (active) setForm(loadedForm);
      })
      .catch(() => {
        if (active) toaster(500, "Unable to load form");
      });

    return () => {
      active = false;
    };
  }, [formId]);

  const togglePublished = async () => {
    if (!form) return;
    setIsSaving(true);
    try {
      const updatedForm = await updateForm(formId, {
        title: form.form_title,
        description: form.form_description ?? "",
        isPublished: !form.form_is_published,
      });
      setForm(updatedForm);
    } catch (error) {
      toaster(
        500,
        error instanceof Error ? error.message : "Unable to save form",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const isBuildRoute = pathname === `/forms/${formId}`;
  const isResponsesRoute = pathname.startsWith(`/forms/${formId}/responses`);
  const tabClass = (active: boolean) =>
    active
      ? "border-b-2 border-primary pb-3 pt-1"
      : "pb-3 pt-1 text-slate-400 hover:text-primary";

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-360 px-5">
        <div className="flex h-12 items-center gap-3 text-sm">
          <Link href="/" className="text-slate-500">
            ← All forms
          </Link>
          <span className="text-slate-300">|</span>
          <strong className="text-lg">{form?.form_title ?? "Loading form..."}</strong>
          <div className="ml-auto flex items-center gap-3">
            {form ? (
              <span className="text-xs text-slate-500">
                {form.form_is_published ? "Published" : "Draft"}
              </span>
            ) : null}
            <Button
              size="small"
              className="h-8 w-auto px-4 text-white"
              onClick={() => void togglePublished()}
              disabled={!form || isSaving}
            >
              {isSaving
                ? "Saving..."
                : form?.form_is_published
                  ? "Unpublish"
                  : "Publish"}
            </Button>
            {form?.form_is_published ? (
              <Link
                href={`/f/${form.form_slug}`}
                className="text-xs text-primary hover:underline"
              >
                View form
              </Link>
            ) : null}
          </div>
        </div>
        <div className="flex gap-5 text-xs">
          <Link href={`/forms/${formId}`} className={tabClass(isBuildRoute)}>
            Build
          </Link>
          <Link
            href={`/forms/${formId}/responses`}
            className={tabClass(isResponsesRoute)}
          >
            Responses
          </Link>
          <button type="button" className="pb-3 pt-1 text-slate-400">
            Webhook
          </button>
        </div>
      </div>
    </div>
  );
}
