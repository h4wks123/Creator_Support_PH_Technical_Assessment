import { getAuthToken } from "@/lib/auth";
import {
  webhookDeliveriesPayloadSchema,
  webhookPayloadSchema,
  type WebhookDeliveryRecord,
  type WebhookRecord,
} from "@/types/api";

const apiUrl = () =>
  typeof window === "undefined"
    ? (process.env.APP_API_URL ?? process.env.NEXT_PUBLIC_APP_API_URL)
    : process.env.NEXT_PUBLIC_APP_API_URL;

const authHeaders = () => ({ Authorization: `Bearer ${getAuthToken()}` });

export type Webhook = WebhookRecord;
export type WebhookDelivery = WebhookDeliveryRecord;

export async function getWebhook(
  formId: string,
  authToken?: string,
): Promise<Webhook | null> {
  const response = await fetch(`${apiUrl()}/api/forms/${formId}/webhook`, {
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
    `${apiUrl()}/api/forms/${formId}/webhook/deliveries`,
    { headers: { Authorization: `Bearer ${authToken ?? getAuthToken()}` } },
  );
  if (!response.ok) throw new Error("Unable to load webhook deliveries");
  return webhookDeliveriesPayloadSchema.parse(await response.json()).deliveries;
}

export async function saveWebhook(
  formId: string,
  input: { url: string; secret: string },
): Promise<Webhook> {
  const response = await fetch(`${apiUrl()}/api/forms/${formId}/webhook`, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error("Unable to save webhook configuration");
  return webhookPayloadSchema.parse(await response.json()).webhook!;
}
