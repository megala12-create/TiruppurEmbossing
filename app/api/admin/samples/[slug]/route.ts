import { adminRoute, fail, fileFrom, ok, revalidateSite } from "@/lib/admin/api";
import { saveUploadedImage } from "@/lib/admin/media";
import { loadSamples, sampleFields } from "@/lib/admin/samples";
import { removeMedia, writeContent } from "@/lib/content/store";

type Ctx = RouteContext<"/api/admin/samples/[slug]">;

/** Update a sample's details and optionally replace its photo. */
export const POST = adminRoute(async (request: Request, ctx: Ctx) => {
  const { slug } = await ctx.params;
  const form = await request.formData();
  const { values, errors } = sampleFields(form);
  if (errors.length) return fail(422, errors.join(" "));

  const { content, items } = await loadSamples();
  const index = items.findIndex((i) => i.slug === slug);
  if (index < 0) return fail(404, "Sample not found.");
  const current = items[index];

  let image = { ...current.image, alt: values.alt };
  let illustrative = current.illustrative;
  const file = fileFrom(form, "file");
  if (file) {
    const saved = await saveUploadedImage(file, `sample-${slug}`, values.alt);
    await removeMedia(current.image.src);
    image = { src: saved.src, width: saved.width, height: saved.height, alt: values.alt };
    illustrative = false;
  }

  items[index] = { ...current, ...values, image, illustrative };
  await writeContent({ ...content, portfolio: items });
  revalidateSite();
  return ok();
});

export const DELETE = adminRoute(async (_request: Request, ctx: Ctx) => {
  const { slug } = await ctx.params;
  const { content, items } = await loadSamples();
  const item = items.find((i) => i.slug === slug);
  if (!item) return fail(404, "Sample not found.");
  await removeMedia(item.image.src);
  await writeContent({ ...content, portfolio: items.filter((i) => i.slug !== slug) });
  revalidateSite();
  return ok();
});
