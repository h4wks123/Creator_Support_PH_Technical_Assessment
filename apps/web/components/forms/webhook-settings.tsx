"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/button";
import LocalDate from "@/components/local-date";
import toaster from "@/components/toaster";
import {
  saveWebhook,
  type Webhook,
  type WebhookDelivery,
} from "@/lib/api/webhooks";

export default function WebhookSettings({
  formId,
  formTitle,
  webhook,
  deliveries,
}: {
  formId: string;
  formTitle: string;
  webhook: Webhook | null;
  deliveries: readonly WebhookDelivery[];
}) {
  const [url, setUrl] = useState(webhook?.webhook_url ?? "");
  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfigured, setIsConfigured] = useState(webhook !== null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await saveWebhook(formId, { url, secret });
      setIsConfigured(true);
      setSecret("");
      toaster(200, "Webhook configuration saved");
    } catch (error) {
      toaster(
        500,
        error instanceof Error ? error.message : "Unable to save webhook",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.82fr)]">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Endpoint configuration</h2>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${isConfigured ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
          >
            {isConfigured ? "Configured" : "Not configured"}
          </span>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium">
            Webhook URL
            <input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="http://localhost:4000/webhook"
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
                placeholder={
                  isConfigured
                    ? "Enter a new secret to replace it"
                    : "Enter the consumer secret"
                }
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
          </label>
          <div className="flex items-center gap-3 pt-1">
            <Button
              type="submit"
              size="small"
              className="h-10 w-auto px-5 text-white"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save configuration"}
            </Button>
            {isConfigured ? (
              <span className="text-xs text-emerald-700">
                Saved by the API.
              </span>
            ) : null}
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Delivery log</h2>
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
            {deliveries.map((delivery) => {
              const status = delivery.webhook_delivery_status_code;
              const successful =
                status !== null && status >= 200 && status < 300;
              return (
                <div
                  key={delivery.webhook_delivery_id}
                  className="py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-500">
                      <LocalDate
                        value={delivery.webhook_delivery_attempted_at}
                      />
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${successful ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
                    >
                      {status ?? "Failed"}
                    </span>
                  </div>
                  {delivery.webhook_delivery_error_message ? (
                    <p className="mt-2 text-xs text-red-600">
                      {delivery.webhook_delivery_error_message}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
