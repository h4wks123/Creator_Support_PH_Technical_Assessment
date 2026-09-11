"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toaster from "@/components/toaster";
import { getForms } from "@/lib/api/forms";
import { getFormResponses, type FormResponse } from "@/lib/api/responses";

const formatDate = (value: string) =>
  new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export default function ResponsesList({ slug }: { slug: string }) {
  const router = useRouter();
  const [formId, setFormId] = useState<string | null>(null);
  const [title, setTitle] = useState("Form responses");
  const [responses, setResponses] = useState<FormResponse[]>([]);
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
        const loadedResponses = await getFormResponses(form.form_id);
        if (!active) return;
        setFormId(form.form_id);
        setTitle(form.form_title);
        setResponses(loadedResponses);
      } catch {
        if (active) {
          toaster(500, "Unable to load responses. Please try again.");
          router.replace("/");
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [router, slug]);

  return (
    <main className="min-h-[calc(100dvh-57px)] bg-[#f7f8fa] px-5 py-8 text-secondary">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex flex-wrap items-end gap-3">
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Responses</p><h1 className="mt-1 font-[Poppins] text-3xl font-semibold">{title}</h1></div>
          {formId ? <Link href={`/form/${formId}`} className="ml-auto text-sm text-slate-500 hover:text-primary">← Back to builder</Link> : null}
        </header>
        {loading ? <p className="text-sm text-slate-500">Loading responses...</p> : responses.length === 0 ? <section className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm"><p className="text-sm text-slate-500">No responses yet.</p></section> : <section><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold">All submissions</h2><span className="text-xs text-slate-500">{responses.length} total</span></div><div className="space-y-3">{responses.map((response, index) => <article key={response.response_id} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{response.response_respondent_email}</p><p className="mt-1 text-xs text-slate-500">Submitted {formatDate(response.response_submitted_at)}</p></div><Link href={`/f/${slug}/responses/${response.response_id}`} className="rounded-md border border-primary px-4 py-2 text-xs font-semibold text-primary hover:bg-primary hover:text-white">View</Link></article>)}</div></section>}
      </div>
    </main>
  );
}
