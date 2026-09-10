"use client";
import { Button } from "@/components/button";
import { getLoggedInEmail } from "@/lib/auth";
import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { getForms } from "@/lib/api/forms";
import { useEffect, useState } from "react";
import toaster from "@/components/toaster";

const subscribe = () => () => {};
export default function FormsDashboard() {
  const email = useSyncExternalStore(
    subscribe,
    getLoggedInEmail,
    () => "ada@example.com",
  );
  const router = useRouter();
  const [forms, setForms] = useState<Awaited<ReturnType<typeof getForms>>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadForms() {
      try {
        const loadedForms = await getForms();

        if (!isActive) return;

        setForms(loadedForms);

        setIsLoading(false);
      } catch (requestError) {
        if (!isActive) return;

        toaster(500, "Unable to load forms");

        setIsLoading(false);
      }
    }

    void loadForms();
    return () => {
      isActive = false;
    };
  }, []);

  return (
    <main className="min-h-[calc(100dvh-57px)] bg-[#f7f8fa] text-secondary">
      <div className="mx-auto w-full max-w-360 px-5 py-10">
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <h1 className="font-[Poppins] text-3xl font-semibold tracking-tight sm:text-4xl">
            Your forms
          </h1>
          <Button
            size="small"
            className="text-white"
            onClick={() => router.push("/form/new")}
          >
            New form
          </Button>
        </div>
        <div aria-label={`Forms owned by ${email}`}>
          {isLoading ? (
            <p className="py-12 text-center text-sm text-slate-500">
              Loading forms...
            </p>
          ) : null}
          {!isLoading && forms.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">
              No forms yet. Create your first form to get started.
            </p>
          ) : null}
          {forms.map((form) => (
            <div
              key={form.form_id}
              className="flex flex-col gap-4 border-b border-slate-200 py-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h2 className="font-[Poppins] text-2xl font-semibold tracking-tight">
                  {form.form_title}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {form.form_is_published ? "Published" : "Draft"} ·{" "}
                  {form.question_count ?? 0}{" "}
                  {form.question_count === 1 ? "question" : "questions"}
                </p>
              </div>
              <button
                type="button"
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm hover:border-primary hover:text-primary"
                onClick={() => router.push(`/form/${form.form_id}`)}
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
