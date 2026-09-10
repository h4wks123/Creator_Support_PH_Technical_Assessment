"use client";
import { Button } from "@/components/button";
import { getLoggedInEmail } from "@/lib/auth";
import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

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
      <div className="mx-auto w-full max-w-360 px-5 py-10 sm:px-0 sm:py-11">
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
        <div
          aria-label={`Forms owned by ${email}`}
          className="py-12 text-center text-sm text-slate-500"
        >
          No forms yet. Create your first form to get started.
        </div>
      </div>
    </main>
  );
}
