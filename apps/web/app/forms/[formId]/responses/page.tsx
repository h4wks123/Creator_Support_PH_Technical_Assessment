import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getFormResponses } from "@/lib/api/responses";
import LocalDate from "@/components/local-date";

export default async function ResponsesPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;
  const authToken = (await cookies()).get("auth_token")?.value;
  const responses = await getFormResponses(formId, authToken).catch(() =>
    redirect("/"),
  );

  return (
    <main className="min-h-[calc(100dvh-140px)] bg-page px-5 py-8 text-secondary">
      <header className="max-w-360 px-5 mb-8 mx-auto flex flex-wrap items-end gap-3">
        <h1 className="mt-1 font-[Poppins] text-3xl font-semibold text-primary">
          Form responses
        </h1>
      </header>
      {responses.length === 0 ? (
        <section className="max-w-360 px-5 mx-auto rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-slate-500">No responses yet.</p>
        </section>
      ) : (
        <section className="max-w-360 px-5 mx-auto">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">All submissions</h2>
            <span className="text-xs text-slate-500">
              {responses.length} total
            </span>
          </div>
          <div className="space-y-3">
            {responses.map((response, index) => (
              <article
                key={response.response_id}
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {response.response_respondent_email}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Submitted <LocalDate value={response.response_submitted_at} />
                  </p>
                </div>
                <Link
                  href={`/forms/${formId}/responses/${response.response_id}`}
                  className="rounded-md border border-primary px-4 py-2 text-xs font-semibold text-primary hover:bg-primary hover:text-white"
                >
                  View
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
