"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import toaster from "@/components/toaster";

const messages: Record<string, string> = {
  load: "Unable to load webpage. Please try again.",
  form: "Unable to load form. Please try again.",
  responses: "Unable to load responses. Please try again.",
  response: "Unable to load response. Please try again.",
  webhook: "Unable to load webhook data. Please try again.",
};

export default function NavigationErrorNotifier() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (!error) return;
    toaster(500, messages[error] ?? messages.load);
    window.history.replaceState({}, "", window.location.pathname);
  }, [error]);

  return null;
}
