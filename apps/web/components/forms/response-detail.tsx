"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toaster from "@/components/toaster";
import { getForms } from "@/lib/api/forms";
import { getFormResponse, type FormResponse } from "@/lib/api/responses";

const formatValue = (value: unknown) => {
  if (value == null || value === "") return "No answer";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const formatDate = (value: string) => new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export default function ResponseDetail({ slug, responseId }: { slug: string; responseId: string }) {
  const router = useRouter();
  const [formId, setFormId] = useState<string | null>(null);
  const [response, setResponse] = useState<FormResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const form = (await getForms()).find((item) => item.form_slug === slug);
        if (!form) {
          router.replace("/");
          return;
        }
        const loadedResponse = await getFormResponse(form.form_id, responseId);
        if (!active) return;
        setFormId(form.form_id);
        setResponse(loadedResponse);
      } catch {
        if (active) {
          toaster(500, "Unable to load response. Please try again.");
          router.replace("/");
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [responseId, router, slug]);

  if (loading) return <main className="mx-auto max-w-3xl px-5 py-12 text-sm text-slate-500">Loading response...</main>;
  if (!response) return <main className="mx-auto max-w-3xl px-5 py-12" />;
  return <main className="min-h-[calc(100dvh-57px)] bg-[#f7f8fa] px-5 py-8 text-secondary"><div className="mx-auto max-w-3xl"><div className="mb-6 flex items-center gap-3"><Link href={`/f/${slug}/responses`} className="text-sm text-slate-500 hover:text-primary">← All responses</Link>{formId ? <Link href={`/form/${formId}`} className="ml-auto text-sm text-slate-500 hover:text-primary">Builder</Link> : null}</div><article className="rounded-xl border border-slate-200 bg-white shadow-sm"><header className="border-b border-slate-200 p-7"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Response details</p><h1 className="mt-2 break-all font-[Poppins] text-2xl font-semibold">{response.response_respondent_email}</h1><p className="mt-2 text-sm text-slate-500">Submitted {formatDate(response.response_submitted_at)}</p></header><div className="space-y-6 p-7">{response.answers.length ? response.answers.map((answer, index) => <section key={`${answer.questionId ?? answer.label}-${index}`} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0"><h2 className="text-sm font-semibold">{answer.label}</h2><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">{formatValue(answer.value)}</p></section>) : <p className="text-sm text-slate-500">This response has no answers.</p>}</div></article></div></main>;
}
