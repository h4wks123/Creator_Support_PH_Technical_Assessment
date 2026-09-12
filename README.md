# Forms App

## Run locally

Start PostgreSQL, the API, the Next.js app, and the webhook consumer with:

```sh
docker compose up --build
```

The webhook consumer is available at `http://localhost:4000`. Configure a
form's webhook URL as `http://localhost:4000/webhook` and use the same value as
the consumer's `WEBHOOK_SECRET` environment variable.

If the PostgreSQL volume already existed before webhook support was added,
apply `apps/api/db/schema.sql` once so the `webhooks` and
`webhook_deliveries` tables exist.

## Webhook contract

After a successful response is committed, the API sends one asynchronous
request to the configured URL. It does not retry failed deliveries.

```json
{
  "form": { "id": "...", "title": "Onboarding Survey" },
  "response": {
    "id": "...",
    "email": "respondent@example.com",
    "submittedAt": "2026-09-03T04:21:00.000Z",
    "answers": [
      {
        "questionId": "...",
        "label": "Your role",
        "type": "dropdown",
        "value": "Engineer"
      }
    ]
  }
}
```

The API sends the configured secret in the `X-Webhook-Secret` header. Every
delivery attempt is logged with its timestamp, response status code, and any
error message. The consumer keeps accepted payloads in memory and displays
them at its root page.
