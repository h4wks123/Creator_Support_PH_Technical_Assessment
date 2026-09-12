"use client";

import { useState, SubmitEvent } from "react";
import { Button } from "@/components/button";
import LocalDate from "@/components/local-date";
import toaster from "@/components/toaster";
import {
  saveWebhook,
  toggleWebhook,
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
  const [isEnabled, setIsEnabled] = useState(
    webhook?.webhook_is_enabled ?? true,
  );
  const [isToggling, setIsToggling] = useState(false);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await saveWebhook(
        formId,
        { url, secret: secret || undefined },
        webhook !== null,
      );
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

  const handleToggle = async (enabled: boolean) => {
    if (!isConfigured) {
      setIsEnabled(enabled);
      return;
    }

    const previous = isEnabled;
    setIsEnabled(enabled);
    setIsToggling(true);
    try {
      await toggleWebhook(formId, enabled);
    } catch (error) {
      setIsEnabled(previous);
      toaster(
        500,
        error instanceof Error
          ? error.message
          : "Unable to update webhook status",
      );
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="grid gap-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Endpoint configuration</h2>
            <p className="mt-1 text-xs text-slate-500">
              Configure where submissions for “{formTitle}” should be sent.
            </p>
          </div>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium">
            Webhook URL
            <input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              readOnly={!isEnabled}
              className={`mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 ${!isEnabled ? "cursor-not-allowed bg-slate-100 text-slate-500" : ""}`}
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
                readOnly={!isEnabled}
                className={`min-w-0 flex-1 px-3 text-sm outline-none ${!isEnabled ? "cursor-not-allowed bg-slate-100 text-slate-500" : ""}`}
                required={!webhook}
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
          <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <span>
              <span className="block font-medium">
                Enable webhook deliveries
              </span>
              <span className="mt-1 block text-xs text-slate-500">
                Disabled webhooks keep their configuration and logs but do not
                send new deliveries.
              </span>
            </span>
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(event) => void handleToggle(event.target.checked)}
              disabled={isToggling || !isConfigured}
              className="h-4 w-4 accent-primary"
            />
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
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Delivery log</h2>
          </div>
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
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
