/**
 * Enquiry delivery adapter (server only).
 *
 * ENQUIRY_DELIVERY is a comma-separated list of channels (default: "file"):
 *   file     → save each enquiry (JSON + attachments) under ENQUIRY_STORAGE_DIR
 *   webhook  → POST to ENQUIRY_WEBHOOK_URL (ENQUIRY_WEBHOOK_FORMAT=multipart|json)
 *   log      → development only: print to the server console
 * e.g. ENQUIRY_DELIVERY=file,webhook
 *
 * An enquiry counts as delivered when at least one channel succeeds, so the
 * visitor only sees "Enquiry received" when the data has really been stored or
 * accepted. If every channel fails, the UI shows the error with call / WhatsApp /
 * email alternatives.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export type EnquiryKind = "quote" | "contact";

export type DeliveryPayload = {
  kind: EnquiryKind;
  reference: string;
  submittedAt: string;
  fields: Record<string, string | string[]>;
  files: { field: string; file: File }[];
};

export type DeliveryResult = { ok: true } | { ok: false; reason: "not_configured" | "failed" };

type Channel = "file" | "webhook" | "log";

export function createReference(kind: EnquiryKind) {
  const stamp = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const rand = crypto.randomUUID().slice(0, 6).toUpperCase();
  return `TE-${kind === "quote" ? "Q" : "C"}${stamp}-${rand}`;
}

const safeName = (name: string) =>
  name
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "_")
    .replace(/^\.+/, "")
    .slice(-100) || "file";

const summary = (p: DeliveryPayload) => ({
  kind: p.kind,
  reference: p.reference,
  submittedAt: p.submittedAt,
  fields: p.fields,
  files: p.files.map(({ field, file }) => ({ field, name: file.name, type: file.type, size: file.size })),
});

/* ------------------------------------------------------------ channels */

/** Folder where the "file" channel saves enquiries (also read by the admin panel). */
export const enquiryBaseDir = () =>
  path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.ENQUIRY_STORAGE_DIR?.trim() || "storage/enquiries");

async function toFile(p: DeliveryPayload) {
  const dir = path.join(enquiryBaseDir(), `${p.submittedAt.slice(0, 10)}_${p.reference}`);
  await mkdir(dir, { recursive: true });
  await Promise.all(
    p.files.map(async ({ field, file }, i) =>
      writeFile(path.join(dir, `${field}-${i + 1}-${safeName(file.name)}`), Buffer.from(await file.arrayBuffer())),
    ),
  );
  await writeFile(path.join(dir, "enquiry.json"), JSON.stringify({ ...summary(p), status: "new" }, null, 2), "utf8");
  console.info(`[enquiry] saved ${p.reference} → ${dir}`);
}

async function toWebhook(p: DeliveryPayload) {
  const url = process.env.ENQUIRY_WEBHOOK_URL?.trim();
  if (!url) throw new Error("ENQUIRY_WEBHOOK_URL is not set");
  const format = (process.env.ENQUIRY_WEBHOOK_FORMAT?.trim() || "multipart").toLowerCase();
  const secret = process.env.ENQUIRY_WEBHOOK_SECRET?.trim();

  const build = async (): Promise<RequestInit> => {
    const headers: Record<string, string> = {};
    if (secret) headers.Authorization = `Bearer ${secret}`;
    if (format === "json") {
      headers["Content-Type"] = "application/json";
      const files = await Promise.all(
        p.files.map(async ({ field, file }) => ({
          field,
          name: file.name,
          type: file.type,
          size: file.size,
          base64: Buffer.from(await file.arrayBuffer()).toString("base64"),
        })),
      );
      return { method: "POST", headers, body: JSON.stringify({ ...summary(p), files }) };
    }
    const body = new FormData();
    body.set("enquiry", JSON.stringify(summary(p)));
    p.files.forEach(({ field, file }) => body.append(field, file, file.name));
    return { method: "POST", headers, body };
  };

  let lastError: unknown;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(url, { ...(await build()), redirect: "follow", signal: AbortSignal.timeout(30_000) });
      if (res.ok) return;
      const text = (await res.text().catch(() => "")).slice(0, 300);
      lastError = new Error(`webhook responded ${res.status} ${res.statusText} ${text}`);
      if (res.status < 500) break; // client errors won't succeed on retry
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

async function toLog(p: DeliveryPayload) {
  if (process.env.NODE_ENV === "production") throw new Error("log delivery is disabled in production");
  console.info("[enquiry] (development log delivery)", summary(p));
}

const handlers: Record<Channel, (p: DeliveryPayload) => Promise<void>> = {
  file: toFile,
  webhook: toWebhook,
  log: toLog,
};

/* ------------------------------------------------------------ public API */

export async function deliverEnquiry(payload: DeliveryPayload): Promise<DeliveryResult> {
  const channels = (process.env.ENQUIRY_DELIVERY?.trim() || "file")
    .split(",")
    .map((c) => c.trim().toLowerCase())
    .filter((c): c is Channel => c in handlers);

  if (channels.length === 0) return { ok: false, reason: "not_configured" };

  const results = await Promise.allSettled(channels.map((c) => handlers[c](payload)));
  results.forEach((r, i) => {
    if (r.status === "rejected") console.error(`[enquiry] ${channels[i]} delivery failed for ${payload.reference}:`, r.reason);
  });

  return results.some((r) => r.status === "fulfilled") ? { ok: true } : { ok: false, reason: "failed" };
}
