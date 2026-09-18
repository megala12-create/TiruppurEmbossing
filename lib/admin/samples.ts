import { portfolio as defaultPortfolio, portfolioCategories, type PortfolioItem } from "@/data/portfolio";
import { services } from "@/data/services";
import type { PortfolioCategory } from "@/data/services";
import { readContent, type ContentFile } from "@/lib/content/store";
import { text } from "./api";

export const loadSamples = async (): Promise<{ content: ContentFile; items: PortfolioItem[] }> => {
  const content = await readContent();
  return { content, items: [...(content.portfolio ?? defaultPortfolio)] };
};

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50) || "sample";

/** Reads and validates the editable sample fields from a form. */
export function sampleFields(form: FormData) {
  const title = text(form, "title", 80);
  const category = text(form, "category", 40) as PortfolioCategory;
  const service = text(form, "service", 80);
  const summary = text(form, "summary", 300, true);
  const alt = text(form, "alt", 200);
  const errors: string[] = [];
  if (title.length < 2) errors.push("Please enter a title.");
  if (!portfolioCategories.some((c) => c.id === category)) errors.push("Please choose a category.");
  if (!services.some((s) => s.slug === service)) errors.push("Please choose the related service.");
  if (!alt) errors.push("Please describe the photo (alt text).");
  return { values: { title, category, service, summary, alt }, errors };
}
