import { adminRoute, fail, fileFrom, ok, revalidateSite } from "@/lib/admin/api";
import { saveUploadedImage } from "@/lib/admin/media";
import { loadSamples, sampleFields, slugify } from "@/lib/admin/samples";
import { writeContent } from "@/lib/content/store";

/** Add a new sample (photo required). New samples appear first. */
export const POST = adminRoute(async (request: Request) => {
  const form = await request.formData();
  const { values, errors } = sampleFields(form);
  const file = fileFrom(form, "file");
  if (!file) errors.unshift("Please choose a photo.");
  if (errors.length) return fail(422, errors.join(" "));

  const { content, items } = await loadSamples();
  const slug = `${slugify(values.title)}-${crypto.randomUUID().slice(0, 4)}`;
  const image = await saveUploadedImage(file!, `sample-${slug}`, values.alt);
  items.unshift({
    slug,
    title: values.title,
    category: values.category,
    service: values.service,
    summary: values.summary,
    image: { src: image.src, width: image.width, height: image.height, alt: values.alt },
    illustrative: false,
  });
  await writeContent({ ...content, portfolio: items });
  revalidateSite();
  return ok({ slug });
});

/** Reorder samples: body { order: string[] } */
export const PUT = adminRoute(async (request: Request) => {
  const body = (await request.json().catch(() => ({}))) as { order?: unknown };
  if (!Array.isArray(body.order)) return fail(422, "Invalid order.");
  const { content, items } = await loadSamples();
  const rank = new Map((body.order as string[]).map((slug, i) => [slug, i]));
  items.sort((a, b) => (rank.get(a.slug) ?? 1e9) - (rank.get(b.slug) ?? 1e9));
  await writeContent({ ...content, portfolio: items });
  revalidateSite();
  return ok();
});
