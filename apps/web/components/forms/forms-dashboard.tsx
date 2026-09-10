"use client";
import { Button } from "@/components/button";
import { getLoggedInEmail } from "@/lib/auth";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

interface DashboardForm {
  id: string;
  title: string;
  status: "Draft" | "Published";
  questions: number;
  responses: number;
}
const demoForms: DashboardForm[] = [
  {
    id: "untitled-draft",
    title: "Untitled form",
    status: "Draft",
    questions: 3,
    responses: 0,
  },
  {
    id: "untitled-published",
    title: "Untitled form",
    status: "Published",
    questions: 0,
    responses: 0,
  },
  {
    id: "untitled-empty",
    title: "Untitled form",
    status: "Draft",
    questions: 0,
    responses: 0,
  },
];

const subscribe = () => () => {};
export default function FormsDashboard() {
  const email = useSyncExternalStore(
    subscribe,
    getLoggedInEmail,
    () => "ada@example.com",
  );
  const router = useRouter();
  return (
    <main className="min-h-[calc(100dvh-57px)] bg-[#f7f8fa] text-secondary">
      <div className="mx-auto w-full max-w-212 px-5 py-10 sm:px-0 sm:py-11">
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
          {demoForms.map((form) => (
            <div
              key={form.id}
              className="flex flex-col gap-4 border-b border-slate-200 py-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h2 className="font-[Poppins] text-2xl font-semibold tracking-tight">
                  {form.title}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {form.status} · {form.questions}{" "}
                  {form.questions === 1 ? "question" : "questions"} ·{" "}
                  {form.responses}{" "}
                  {form.responses === 1 ? "response" : "responses"}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Link
                  href={`/form/${form.id}`}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 hover:border-primary hover:text-primary"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 hover:border-primary hover:text-primary"
                >
                  Responses
                </button>
                <button type="button" className="px-3 py-2 hover:text-delete">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
