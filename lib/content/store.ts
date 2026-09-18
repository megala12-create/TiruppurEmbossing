/**
 * Editable content store (server only).
 *
 * The site's defaults live in data/*.ts. Photos and samples managed from /admin
 * are stored in storage/content.json (+ image files in storage/media) and merged
 * over those defaults here. Pages read content through these getters, and admin
 * saves call revalidatePath() so the static pages are regenerated.
 */

import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { productionMachines, type Machine } from "@/data/capabilities";
import { portfolio as defaultPortfolio, type PortfolioItem } from "@/data/portfolio";
import { services as defaultServices, type ServiceCategory } from "@/data/services";

export type StoredImage = { src: string; width: number; height: number; alt: string };

export type ContentFile = {
  version: 1;
  updatedAt: string | null;
  services: Record<string, StoredImage>;
  machines: Record<string, StoredImage>;
  /** null = use the default sample list from data/portfolio.ts */
  portfolio: PortfolioItem[] | null;
};

// Runtime data folder: excluded from build tracing.
export const STORAGE_DIR = path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.CONTENT_STORAGE_DIR?.trim() || "storage");
export const MEDIA_DIR = path.join(STORAGE_DIR, "media");
const CONTENT_FILE = path.join(STORAGE_DIR, "content.json");

const empty = (): ContentFile => ({ version: 1, updatedAt: null, services: {}, machines: {}, portfolio: null });

export async function readContent(): Promise<ContentFile> {
  try {
    const raw = JSON.parse(await readFile(CONTENT_FILE, "utf8")) as Partial<ContentFile>;
    return { ...empty(), ...raw, services: raw.services ?? {}, machines: raw.machines ?? {} };
  } catch {
    return empty();
  }
}

/** Per-request memoised read for pages. */
const getContent = cache(readContent);

export async function writeContent(content: ContentFile) {
  await mkdir(STORAGE_DIR, { recursive: true });
  const tmp = `${CONTENT_FILE}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify({ ...content, updatedAt: new Date().toISOString() }, null, 2), "utf8");
  await rename(tmp, CONTENT_FILE);
}

/** Removes an uploaded media file (never touches the bundled /assets). */
export async function removeMedia(src: string | undefined) {
  if (!src?.startsWith("/media/")) return;
  const file = path.join(MEDIA_DIR, path.basename(src));
  await unlink(file).catch(() => undefined);
}

/* ------------------------------------------------------------- getters */

export async function getServices(): Promise<ServiceCategory[]> {
  const content = await getContent();
  return defaultServices.map((s) => {
    const img = content.services[s.slug];
    return img ? { ...s, image: { ...img, illustrative: false } } : s;
  });
}

export async function getServiceBySlug(slug: string) {
  return (await getServices()).find((s) => s.slug === slug);
}

export async function getPortfolio(): Promise<PortfolioItem[]> {
  const content = await getContent();
  return content.portfolio ?? defaultPortfolio;
}

export async function getMachines(): Promise<Machine[]> {
  const content = await getContent();
  return productionMachines.map((m) => {
    const img = content.machines[m.slug];
    return img ? { ...m, photo: img } : m;
  });
}
