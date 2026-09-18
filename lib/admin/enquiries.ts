/**
 * Reads and manages enquiries saved by the "file" delivery channel (server only).
 * Each enquiry is a folder: storage/enquiries/<date>_<reference>/enquiry.json + attachments.
 */

import { readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { enquiryBaseDir } from "@/lib/server/delivery";

export const ENQUIRY_STATUSES = ["new", "in-progress", "done"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export type EnquiryAttachment = { name: string; field: string; size: number; isImage: boolean };

export type StoredEnquiry = {
  reference: string;
  kind: "quote" | "contact";
  submittedAt: string;
  status: EnquiryStatus;
  fields: Record<string, string | string[]>;
  attachments: EnquiryAttachment[];
};

const REF_RE = /^TE-[QC]\d{6}-[A-F0-9]{6}$/;
export const isReference = (ref: string) => REF_RE.test(ref);

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);

async function findDir(reference: string) {
  if (!isReference(reference)) return null;
  const base = enquiryBaseDir();
  const entries = await readdir(base).catch(() => [] as string[]);
  const name = entries.find((e) => e.endsWith(`_${reference}`));
  return name ? path.join(base, name) : null;
}

async function readOne(dir: string): Promise<StoredEnquiry | null> {
  try {
    const raw = JSON.parse(await readFile(path.join(dir, "enquiry.json"), "utf8"));
    const files = (await readdir(dir)).filter((f) => f !== "enquiry.json");
    const attachments = await Promise.all(
      files.map(async (name) => ({
        name,
        field: name.split("-")[0],
        size: (await stat(path.join(dir, name))).size,
        isImage: IMAGE_EXT.has(path.extname(name).toLowerCase()),
      })),
    );
    return {
      reference: raw.reference,
      kind: raw.kind,
      submittedAt: raw.submittedAt,
      status: ENQUIRY_STATUSES.includes(raw.status) ? raw.status : "new",
      fields: raw.fields ?? {},
      attachments,
    };
  } catch {
    return null;
  }
}

/** All enquiries, newest first. */
export async function listEnquiries(): Promise<StoredEnquiry[]> {
  const base = enquiryBaseDir();
  const dirs = await readdir(base).catch(() => [] as string[]);
  const items = await Promise.all(dirs.map((d) => readOne(path.join(base, d))));
  return items
    .filter((e): e is StoredEnquiry => e !== null)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

export async function setEnquiryStatus(reference: string, status: EnquiryStatus) {
  const dir = await findDir(reference);
  if (!dir) return false;
  const file = path.join(dir, "enquiry.json");
  const raw = JSON.parse(await readFile(file, "utf8"));
  await writeFile(file, JSON.stringify({ ...raw, status }, null, 2), "utf8");
  return true;
}

export async function deleteEnquiry(reference: string) {
  const dir = await findDir(reference);
  if (!dir) return false;
  await rm(dir, { recursive: true, force: true });
  return true;
}

/** Absolute path of an attachment, or null if it does not belong to the enquiry. */
export async function attachmentPath(reference: string, name: string) {
  const dir = await findDir(reference);
  if (!dir || name === "enquiry.json" || path.basename(name) !== name) return null;
  const files = await readdir(/*turbopackIgnore: true*/ dir);
  return files.includes(name) ? path.join(/*turbopackIgnore: true*/ dir, name) : null;
}
