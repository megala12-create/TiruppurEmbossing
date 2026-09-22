/**
 * TE Chat knowledge base (server only).
 *
 * Builds a flat list of grounded, source-tagged chunks from the site's own
 * structured content modules (data/*.ts) - the same data that renders the
 * public pages - plus any owner-approved supplementary documents dropped in
 * content/knowledge/*.md.
 *
 * This deliberately does NOT scrape the live website: the data/*.ts files are
 * the single source of truth the site itself renders from, and they already
 * encode the "do not invent pricing / MOQ / wash results / certifications"
 * rules (see each file's header comment). Reusing them keeps the chatbot
 * consistent with the pages a visitor can already see, and keeps unverified
 * facts (e.g. unverified phone numbers) correctly labelled.
 *
 * Supplementary docs: any .md/.txt file placed in content/knowledge/ is
 * ingested as one chunk per file (front-matter-free, plain body). This is the
 * "admin adds an approved document" path from the build spec, without adding
 * a PDF/DOCX parser dependency - see content/knowledge/README.md for how to
 * extend this.
 */

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { productionMachines, supportingEquipment } from "@/data/capabilities";
import { faqGroups, faqs } from "@/data/faqs";
import { productionPrinciples, workflow } from "@/data/production";
import { services } from "@/data/services";
import { site } from "@/data/site";

export type ChunkCategory = "service" | "faq" | "process" | "capability" | "contact" | "policy" | "reference";

export type KnowledgeChunk = {
  id: string;
  title: string;
  category: ChunkCategory;
  /** Plain-text body used for retrieval and grounding. */
  text: string;
  /** Where this fact can be read on the live site, for citations. */
  url: string;
  /** Human label for the admin panel / citations, e.g. "data/services.ts". */
  source: string;
  /** Whether every stated fact here has been explicitly confirmed by the business owner. */
  verified: boolean;
};

const clean = (parts: (string | undefined | null)[]) => parts.filter(Boolean).join(" ");

function serviceChunks(): KnowledgeChunk[] {
  return services.map((s) => ({
    id: `service:${s.slug}`,
    title: s.title,
    category: "service",
    url: `/services/${s.slug}`,
    source: "data/services.ts",
    verified: true, // descriptive/process facts, not commercial terms
    text: clean([
      `${s.title} (${s.shortTitle}). ${s.tagline}`,
      s.description.join(" "),
      `Process: ${s.process.join(", ")}.`,
      `Variations: ${s.subServices.join(", ")}.`,
      `Typical applications: ${s.applications.join(", ")}.`,
      `Material considerations: ${s.materialConsiderations.join(" ")}`,
      `Production considerations: ${s.productionConsiderations.join(" ")}`,
    ]),
  }));
}

function faqChunks(): KnowledgeChunk[] {
  return faqs.map((f) => ({
    id: `faq:${f.id}`,
    title: f.question,
    category: "faq",
    url: `/faq#${f.id}`,
    source: "data/faqs.ts",
    verified: Boolean(f.answer),
    text: clean([
      `Question: ${f.question} (${faqGroups[f.group]}).`,
      f.answer
        ? `Confirmed answer: ${f.answer}`
        : `No confirmed answer yet. Interim guidance to give the customer: ${f.guidance} Route them to ${f.next === "quote" ? "a quotation request" : "contacting the team directly"}.`,
    ]),
  }));
}

function processChunks(): KnowledgeChunk[] {
  const principles: KnowledgeChunk = {
    id: "process:principles",
    title: "Quality and production principles",
    category: "process",
    url: "/capabilities",
    source: "data/production.ts",
    verified: true,
    text: productionPrinciples.map((p) => `${p.title}: ${p.body}`).join(" "),
  };
  const flow: KnowledgeChunk = {
    id: "process:workflow",
    title: "Production workflow",
    category: "process",
    url: "/capabilities",
    source: "data/production.ts",
    verified: true,
    text: workflow.map((w) => `Step ${w.step} - ${w.title}: ${w.body}`).join(" "),
  };
  return [principles, flow];
}

function capabilityChunks(): KnowledgeChunk[] {
  const machines: KnowledgeChunk = {
    id: "capability:machines",
    title: "Printing systems in use",
    category: "capability",
    url: "/capabilities",
    source: "data/capabilities.ts",
    verified: true,
    text: productionMachines.map((m) => `${m.name}: ${m.summary}`).join(" "),
  };
  const equipment: KnowledgeChunk = {
    id: "capability:equipment",
    title: "Supporting production equipment",
    category: "capability",
    url: "/capabilities",
    source: "data/capabilities.ts",
    verified: true,
    text: supportingEquipment.map((e) => `${e.name} (${e.stage}): ${e.role}`).join(" "),
  };
  return [machines, equipment];
}

function contactChunks(): KnowledgeChunk[] {
  const c = site.contact;
  const allVerified = c.phones.every((p) => p.verified);
  return [
    {
      id: "contact:details",
      title: "Contact details",
      category: "contact",
      url: "/contact",
      source: "data/site.ts",
      verified: allVerified,
      text: clean([
        `${site.name} is a textile and garment printing service provider based in ${c.location.locality}, ${c.location.city}, ${c.location.region}, ${c.location.countryName}.`,
        `Email: ${c.email}.`,
        `Phone numbers: ${c.phones.map((p) => `${p.label} ${p.display}`).join(", ")}.`,
        `WhatsApp: ${c.whatsapp.display}.`,
        !allVerified ? "Note: phone numbers are as published on the website and pending final owner verification." : "",
      ]),
    },
  ];
}

/** Reads owner-approved supplementary docs from content/knowledge/*.{md,txt}. */
async function supplementaryChunks(): Promise<KnowledgeChunk[]> {
  const dir = path.resolve(/*turbopackIgnore: true*/ process.cwd(), "content/knowledge");
  let entries: string[] = [];
  try {
    entries = await readdir(dir);
  } catch {
    return [];
  }
  const files = entries.filter((f) => /\.(md|txt)$/i.test(f) && f.toLowerCase() !== "readme.md");
  const chunks = await Promise.all(
    files.map(async (name) => {
      const full = path.join(dir, name);
      const [raw, info] = await Promise.all([readFile(full, "utf8"), stat(full)]);
      const title = raw.match(/^#\s+(.+)$/m)?.[1]?.trim() || name.replace(/\.(md|txt)$/i, "");
      return {
        id: `reference:${name}`,
        title,
        category: "reference" as const,
        url: "/contact",
        source: `content/knowledge/${name}`,
        verified: true, // presence in this owner-managed folder is the approval signal
        text: raw.replace(/^#.*$/m, "").trim().slice(0, 6000),
        updatedAt: info.mtime.toISOString(),
      };
    }),
  );
  return chunks;
}

let cache: { builtAt: number; chunks: KnowledgeChunk[] } | null = null;

/** Builds (and caches) the full knowledge base. Call refreshKnowledgeBase() to force a rebuild. */
export async function getKnowledgeBase(): Promise<{ builtAt: number; chunks: KnowledgeChunk[] }> {
  if (cache) return cache;
  const chunks = [
    ...serviceChunks(),
    ...faqChunks(),
    ...processChunks(),
    ...capabilityChunks(),
    ...contactChunks(),
    ...(await supplementaryChunks()),
  ];
  cache = { builtAt: Date.now(), chunks };
  return cache;
}

/** Forces the next getKnowledgeBase() call to rebuild from source (admin "refresh" action). */
export function refreshKnowledgeBase() {
  cache = null;
}

export async function knowledgeBaseStats() {
  const { builtAt, chunks } = await getKnowledgeBase();
  const bySource = new Map<string, number>();
  for (const c of chunks) bySource.set(c.source, (bySource.get(c.source) ?? 0) + 1);
  return {
    builtAt: new Date(builtAt).toISOString(),
    totalChunks: chunks.length,
    unverifiedChunks: chunks.filter((c) => !c.verified).length,
    sources: [...bySource.entries()].map(([source, count]) => ({ source, count })),
  };
}
