import { getAuthToken } from "@/lib/auth";
import { getApiUrl } from "@/lib/api/config";
import {
  webhookDeliveriesPayloadSchema,
  webhookPayloadSchema,
  type WebhookDeliveryRecord,
  type WebhookRecord,
} from "@/types/api";

const authHeaders = () => ({ Authorization: `Bearer ${getAuthToken()}` });

export type Webhook = WebhookRecord;
export type WebhookDelivery = WebhookDeliveryRecord;

export async function getWebhook(
  formId: string,
  authToken?: string,
): Promise<Webhook | null> {
  const response = await fetch(`${getApiUrl()}/api/forms/${formId}/webhook`, {
    headers: { Authorization: `Bearer ${authToken ?? getAuthToken()}` },
  });
  if (!response.ok) throw new Error("Unable to load webhook configuration");
  return webhookPayloadSchema.parse(await response.json()).webhook;
}

export async function getWebhookDeliveries(
  formId: string,
  authToken?: string,
): Promise<WebhookDelivery[]> {
  const response = await fetch(
    `${getApiUrl()}/api/forms/${formId}/webhook/deliveries`,
    { headers: { Authorization: `Bearer ${authToken ?? getAuthToken()}` } },
  );
  if (!response.ok) throw new Error("Unable to load webhook deliveries");
  return webhookDeliveriesPayloadSchema.parse(await response.json()).deliveries;
}

export async function saveWebhook(
  formId: string,
  input: { url: string; secret?: string },
  existing = false,
): Promise<Webhook> {
  const response = await fetch(`${getApiUrl()}/api/forms/${formId}/webhook`, {
    method: existing ? "PATCH" : "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error("Unable to save webhook configuration");
  return webhookPayloadSchema.parse(await response.json()).webhook!;
}

export async function toggleWebhook(
  formId: string,
  enabled: boolean,
): Promise<Webhook> {
  const response = await fetch(
    `${getApiUrl()}/api/forms/${formId}/webhook/status`,
    {
      method: "PATCH",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    },
  );
  if (!response.ok) throw new Error("Unable to update webhook status");
  return webhookPayloadSchema.parse(await response.json()).webhook!;
}
