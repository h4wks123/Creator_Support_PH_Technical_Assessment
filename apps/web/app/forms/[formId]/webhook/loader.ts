import { cookies } from "next/headers";
import { getForm } from "@/lib/api/forms";
import { getWebhook, getWebhookDeliveries } from "@/lib/api/webhooks";

export async function loadWebhookPage(formId: string) {
  const authToken = (await cookies()).get("auth_token")?.value;
  const [form, webhook, deliveries] = await Promise.all([
    getForm(formId, authToken),
    getWebhook(formId, authToken),
    getWebhookDeliveries(formId, authToken),
  ]);

  return {
    form,
    webhook,
    deliveries,
  };
}
