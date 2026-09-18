/**
 * Request guards shared by enquiry route handlers (server only).
 */

import { UPLOAD_LIMITS, fileExtension, validateUpload } from "@/lib/forms/schema";

/* ------------------------------------------------ best-effort rate limit */
// In-memory, per-instance. For multi-instance deployments use a shared store
// (e.g. Redis / Upstash) behind the same function signature.
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 8;

export function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_REQUESTS;
}

export const clientIp = (req: Request) =>
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";

/* ---------------------------------------------------- file signatures */
const SIGNATURES: Record<string, (b: Uint8Array) => boolean> = {
  png: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  jpg: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  jpeg: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  webp: (b) => String.fromCharCode(...b.slice(0, 4)) === "RIFF" && String.fromCharCode(...b.slice(8, 12)) === "WEBP",
  pdf: (b) => String.fromCharCode(...b.slice(0, 5)) === "%PDF-",
  zip: (b) => b[0] === 0x50 && b[1] === 0x4b,
  psd: (b) => String.fromCharCode(...b.slice(0, 4)) === "8BPS",
};

/**
 * Validates uploaded files: extension allowlist, MIME, size, count,
 * total size and - where a signature is known - magic bytes.
 */
export async function validateFiles(files: File[], allowedExts: string[], label: string) {
  const errors: string[] = [];
  if (files.length > UPLOAD_LIMITS.maxFilesPerField) {
    errors.push(`${label}: up to ${UPLOAD_LIMITS.maxFilesPerField} files are allowed.`);
  }
  for (const file of files) {
    const basic = validateUpload(file, allowedExts);
    if (basic) {
      errors.push(basic);
      continue;
    }
    const check = SIGNATURES[fileExtension(file.name)];
    if (check) {
      const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
      if (!check(head)) errors.push(`${file.name}: file content does not match its type.`);
    }
  }
  return errors;
}

export const filesFrom = (form: FormData, field: string) =>
  form.getAll(field).filter((v): v is File => typeof v !== "string" && v.size > 0);
