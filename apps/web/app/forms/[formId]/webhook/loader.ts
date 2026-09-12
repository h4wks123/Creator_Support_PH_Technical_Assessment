import { cookies } from "next/headers";
import { getForm } from "@/lib/api/forms";

/**
 * Webhook data will be loaded here once the webhook API is available.
 * Keeping the page loader separate follows the form responses route shape
 * without inventing an API contract before the backend is implemented.
 */
export async function loadWebhookPage(formId: string) {
  const authToken = (await cookies()).get("auth_token")?.value;
  const form = await getForm(formId, authToken);

  return {
    form,
    webhook: null,
    deliveries: [],
  } as const;
}
