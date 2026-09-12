import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getForms } from "@/lib/api/forms";
import CreateFormButton from "@/components/forms/create-form-button";
import DeleteFormButton from "@/components/forms/delete-form-button";

export default async function HomePage() {
  const authToken = (await cookies()).get("auth_token")?.value;
  const forms = await getForms(authToken).catch(() => redirect("/login"));

  return (
    <main className="min-h-[calc(100dvh-57px)] bg-page text-secondary">
      <div className="mx-auto w-full max-w-360 px-5 py-10">
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <h1 className="font-[Poppins] text-3xl font-semibold tracking-tight sm:text-4xl">
            Your forms
          </h1>
          <CreateFormButton />
        </div>
        <div aria-label="Forms owned by you">
          {forms.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">
              No forms yet. Create your first form to get started.
            </p>
          ) : (
            forms.map((form) => (
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
                <div className="flex items-center gap-2 text-sm">
                  <Link
                    href={`/forms/${form.form_id}`}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 hover:border-primary hover:text-primary"
                  >
                    Edit
                  </Link>
                  <DeleteFormButton formId={form.form_id} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
