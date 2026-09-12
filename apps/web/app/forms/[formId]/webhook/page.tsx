import { redirect } from "next/navigation";
import { loadWebhookPage } from "./loader";
import WebhookSettings from "@/components/forms/webhook-settings";

export default async function WebhookPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;
  const data = await loadWebhookPage(formId).catch(() =>
    redirect("/?error=webhook"),
  );

  return (
    <main className="min-h-[calc(100dvh-140px)] bg-page px-5 py-8 text-secondary">
      <div className="mx-auto max-w-360">
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-[Poppins] text-3xl font-semibold text-primary">
              Webhook
            </h1>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Send each successful form submission to your endpoint and monitor
            whether deliveries are landing.
          </p>
        </header>
        <WebhookSettings
          formId={formId}
          formTitle={data.form.form_title}
          webhook={data.webhook}
          deliveries={data.deliveries}
        />
      </div>
    </main>
  );
}
