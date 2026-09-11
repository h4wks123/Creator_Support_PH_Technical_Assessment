import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getFormResponse } from "@/lib/api/responses";
import { formatDate, formatValue } from "@/utils/utils";

export default async function ResponseDetailPage({
  params,
}: {
  params: Promise<{ formId: string; responseId: string }>;
}) {
  const { formId, responseId } = await params;
  const authToken = (await cookies()).get("auth_token")?.value ?? "";
  const response = await getFormResponse(formId, responseId, authToken).catch(
    () => redirect("/"),
  );

  return (
    <main className="min-h-[calc(100dvh-57px)] bg-[#f7f8fa] px-5 py-8 text-secondary">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href={`/forms/${formId}/responses`}
            className="text-sm text-slate-500 hover:text-primary"
          >
            ← All responses
          </Link>
          <Link
            href={`/forms/${formId}`}
            className="ml-auto text-sm text-slate-500 hover:text-primary"
          >
            Builder
          </Link>
        </div>
        <article className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-200 p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Response details
            </p>
            <h1 className="mt-2 break-all font-[Poppins] text-2xl font-semibold">
              {response.response_respondent_email}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Submitted {formatDate(response.response_submitted_at)}
            </p>
          </header>
          <div className="space-y-6 p-7">
            {response.answers.length ? (
              response.answers.map((answer, index) => (
                <section
                  key={`${answer.questionId ?? answer.label}-${index}`}
                  className="border-b border-slate-100 pb-6 last:border-0 last:pb-0"
                >
                  <h2 className="text-sm font-semibold">{answer.label}</h2>
                  <p className="mt-2 whitespace-pre-wrap wrap-break-word text-sm leading-6 text-slate-600">
                    {formatValue(answer.value)}
                  </p>
                </section>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                This response has no answers.
              </p>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}
