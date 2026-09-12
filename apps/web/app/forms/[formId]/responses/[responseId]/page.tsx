import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import LocalDate from "@/components/local-date";
import { getFormResponse } from "@/lib/api/responses";
import { formatValue } from "@/utils/utils";

type ResponseDetailPageProps = {
  params: Promise<{ formId: string; responseId: string }>;
};

export default async function ResponseDetailPage({
  params,
}: ResponseDetailPageProps) {
  const { formId, responseId } = await params;
  const authToken = (await cookies()).get("auth_token")?.value;
  const response = await getFormResponse(formId, responseId, authToken).catch(
    () => redirect("/?error=response"),
  );

  return (
    <main className="min-h-[calc(100dvh-140px)] bg-foreground px-5 py-8 text-secondary">
      <section className="max-w-360 px-5 mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href={`/forms/${formId}/responses`}
            className="text-sm text-slate-500 hover:text-primary"
          >
            ← All responses
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
              Submitted <LocalDate value={response.response_submitted_at} />
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
      </section>
    </main>
  );
}
