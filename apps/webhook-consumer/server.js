import { createServer } from "node:http";

const port = Number(process.env.PORT ?? 4000);
const webhookSecret = process.env.WEBHOOK_SECRET ?? "development-secret";
const receivedPayloads = [];
const maxBodySize = 1024 * 1024;

const htmlEscape = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const page = () => {
  const cards = receivedPayloads.length
    ? receivedPayloads
        .map(
          (entry) => `
            <article class="payload">
              <div class="payload-meta">
                <strong>Received payload</strong>
                <time datetime="${htmlEscape(entry.receivedAt)}">${htmlEscape(entry.receivedAt)}</time>
              </div>
              <pre>${htmlEscape(JSON.stringify(entry.payload, null, 2))}</pre>
            </article>`,
        )
        .join("")
    : '<p class="empty">No payloads received yet. Submit a published form to see one here.</p>';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="refresh" content="5" />
    <title>Webhook Consumer</title>
    <style>
      :root { color-scheme: light; font-family: system-ui, sans-serif; color: #20242b; background: #f7f8fa; }
      body { max-width: 900px; margin: 0 auto; padding: 40px 20px; }
      h1 { margin-bottom: 8px; color: #61215a; }
      .subtitle { color: #667085; margin-top: 0; }
      .count { display: inline-block; margin: 20px 0; padding: 6px 12px; border-radius: 999px; background: #eee8f5; color: #61215a; font-size: 13px; }
      .payload { margin-top: 14px; padding: 18px; border: 1px solid #e1e4e8; border-radius: 10px; background: white; box-shadow: 0 1px 2px #0000000d; }
      .payload-meta { display: flex; justify-content: space-between; gap: 20px; font-size: 13px; }
      time { color: #667085; }
      pre { overflow-x: auto; margin: 14px 0 0; padding: 14px; border-radius: 7px; background: #f7f8fa; font: 13px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace; }
      .empty { padding: 50px 20px; border: 1px dashed #c8ccd2; border-radius: 10px; text-align: center; color: #667085; background: white; }
    </style>
  </head>
  <body>
    <h1>Webhook Consumer</h1>
    <p class="subtitle">A minimal receiver for the Forms App webhook.</p>
    <span class="count">${receivedPayloads.length} payload${receivedPayloads.length === 1 ? "" : "s"} received</span>
    <section>${cards}</section>
  </body>
</html>`;
};

const sendJson = (response, statusCode, body) => {
  response.writeHead(statusCode, { "Content-Type": "application/json" });
  response.end(JSON.stringify(body));
};

const receiveBody = (request) =>
  new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (Buffer.byteLength(body) > maxBodySize) {
        reject(new Error("Payload too large"));
        request.destroy();
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });

const server = createServer(async (request, response) => {
  if (request.method === "GET" && request.url === "/") {
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(page());
    return;
  }

  if (request.method === "GET" && request.url === "/health") {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === "POST" && request.url === "/webhook") {
    if (request.headers["x-webhook-secret"] !== webhookSecret) {
      sendJson(response, 401, { message: "Invalid webhook secret" });
      return;
    }

    try {
      const body = await receiveBody(request);
      const payload = JSON.parse(body);
      receivedPayloads.unshift({
        receivedAt: new Date().toISOString(),
        payload,
      });
      sendJson(response, 200, { received: true });
    } catch {
      sendJson(response, 400, { message: "Invalid JSON payload" });
    }
    return;
  }

  sendJson(response, 404, { message: "Not found" });
});

server.listen(port, () => {
  console.log(`Webhook consumer listening on http://localhost:${port}`);
});
