"use client";

import { useEffect, useRef } from "react";
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
  const lastNotifiedError = useRef<string | null>(null);
  const lastNotifiedAt = useRef(0);

  useEffect(() => {
    if (!error) return;
    if (
      lastNotifiedError.current === error &&
      Date.now() - lastNotifiedAt.current < 1000
    ) {
      return;
    }

    lastNotifiedError.current = error;
    lastNotifiedAt.current = Date.now();
    toaster(500, messages[error] ?? messages.load);
    window.history.replaceState({}, "", window.location.pathname);
  }, [error]);

  return null;
}
