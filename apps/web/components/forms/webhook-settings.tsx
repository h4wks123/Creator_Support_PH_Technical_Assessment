"use client";

import { SubmitEvent, useState } from "react";
import { Button } from "@/components/button";
import LocalDate from "@/components/local-date";

type DeliveryLog = {
  id: string;
  submittedAt: string;
  statusCode: number | null;
  errorMessage: string | null;
};

export default function WebhookSettings({
  formTitle,
  hasWebhook,
  deliveries,
}: {
  formId: string;
  formTitle: string;
  hasWebhook: boolean;
  deliveries: readonly DeliveryLog[];
}) {
  const [url, setUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Persistence is intentionally deferred until the webhook API exists.
    setIsSaved(true);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.82fr)]">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Endpoint configuration</h2>
            <p className="mt-1 text-xs text-slate-500">
              Configure where submissions for “{formTitle}” should be sent.
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${hasWebhook ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
          >
            {hasWebhook ? "Configured" : "Not configured"}
          </span>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium">
            Webhook URL
            <input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://example.com/webhooks/forms"
              className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              required
            />
          </label>

          <label className="block text-sm font-medium">
            Secret
            <div className="mt-2 flex h-11 overflow-hidden rounded-md border border-slate-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
              <input
                type={showSecret ? "text" : "password"}
                value={secret}
                onChange={(event) => setSecret(event.target.value)}
                placeholder="Enter a shared secret"
                className="min-w-0 flex-1 px-3 text-sm outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowSecret((visible) => !visible)}
                className="border-l border-slate-300 px-3 text-xs font-medium text-primary hover:bg-slate-50"
              >
                {showSecret ? "Hide" : "Show"}
              </button>
            </div>
            <span className="mt-2 block text-xs text-slate-500">
              Sent in the <code className="font-mono">X-Webhook-Secret</code>{" "}
              header with each delivery.
            </span>
          </label>

          <div className="flex items-center gap-3 pt-1">
            <Button
              type="submit"
              size="small"
              className="h-10 w-auto px-5 text-white"
            >
              Save configuration
            </Button>
            {isSaved ? (
              <span className="text-xs text-amber-700">
                Preview only — API persistence is not connected yet.
              </span>
            ) : null}
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Delivery log</h2>
            <p className="mt-1 text-xs text-slate-500">
              Every delivery attempt will appear here.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
            {deliveries.length} attempts
          </span>
        </div>

        {deliveries.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-slate-300 px-5 py-10 text-center">
            <p className="text-sm font-medium text-slate-600">
              No deliveries yet
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Delivery status, response codes, timestamps, and errors will be
              shown here after a response is submitted.
            </p>
          </div>
        ) : (
          <div className="mt-5 divide-y divide-slate-100">
            {deliveries.map((delivery) => (
              <div key={delivery.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">
                    <LocalDate value={delivery.submittedAt} />
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${delivery.statusCode && delivery.statusCode >= 200 && delivery.statusCode < 300 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
                  >
                    {delivery.statusCode ?? "Failed"}
                  </span>
                </div>
                {delivery.errorMessage ? (
                  <p className="mt-2 text-xs text-red-600">
                    {delivery.errorMessage}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-primary/15 bg-primary/5 p-6 lg:col-span-2">
        <h2 className="text-sm font-semibold text-primary">
          How delivery works
        </h2>
        <div className="mt-4 grid gap-4 text-xs leading-5 text-slate-600 sm:grid-cols-3">
          <p>
            <strong className="text-secondary">1. Submit first.</strong>
            <br />
            The response is committed before the webhook is sent.
          </p>
          <p>
            <strong className="text-secondary">2. Send asynchronously.</strong>
            <br />A slow or failed endpoint never blocks the respondent.
          </p>
          <p>
            <strong className="text-secondary">3. Log once.</strong>
            <br />
            Each attempt is recorded. No retry logic is required.
          </p>
        </div>
      </section>
    </div>
  );
}
