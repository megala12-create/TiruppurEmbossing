import { productionMachines } from "@/data/capabilities";
import { services } from "@/data/services";
import { adminRoute, fail, fileFrom, ok, revalidateSite, text } from "@/lib/admin/api";
import { saveUploadedImage } from "@/lib/admin/media";
import { readContent, removeMedia, writeContent } from "@/lib/content/store";

type Ctx = RouteContext<"/api/admin/images/[kind]/[slug]">;

const slots = {
  services: services.map((s) => s.slug),
  machines: productionMachines.map((m) => m.slug),
} as const;

const resolve = async (ctx: Ctx) => {
  const { kind, slug } = await ctx.params;
  if (!(kind in slots) || !slots[kind as keyof typeof slots].includes(slug)) return null;
  return { kind: kind as keyof typeof slots, slug };
};

/** Replace the photo (and/or alt text) for a service category or machine. */
export const POST = adminRoute(async (request: Request, ctx: Ctx) => {
  const target = await resolve(ctx);
  if (!target) return fail(404, "Unknown item.");
  const form = await request.formData();
  const alt = text(form, "alt", 200);
  const file = fileFrom(form, "file");

  const content = await readContent();
  const current = content[target.kind][target.slug];
  if (!file && !current) return fail(422, "Please choose a photo to upload.");
  if (!alt) return fail(422, "Please describe the photo (alt text) for accessibility and SEO.");

  if (file) {
    const image = await saveUploadedImage(file, `${target.kind}-${target.slug}`, alt);
    await removeMedia(current?.src);
    content[target.kind][target.slug] = image;
  } else {
    content[target.kind][target.slug] = { ...current, alt };
  }
  await writeContent(content);
  revalidateSite();
  return ok({ image: content[target.kind][target.slug] });
});

/** Revert to the default visual. */
export const DELETE = adminRoute(async (_request: Request, ctx: Ctx) => {
  const target = await resolve(ctx);
  if (!target) return fail(404, "Unknown item.");
  const content = await readContent();
  await removeMedia(content[target.kind][target.slug]?.src);
  delete content[target.kind][target.slug];
  await writeContent(content);
  revalidateSite();
  return ok();
});
