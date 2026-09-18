import { NextResponse } from "next/server";
import { getService, serviceSlugs } from "@/data/services";
import {
  ARTWORK_EXTENSIONS,
  REFERENCE_EXTENSIONS,
  UPLOAD_LIMITS,
  normalizeQuote,
  validateQuote,
} from "@/lib/forms/schema";
import { createReference, deliverEnquiry } from "@/lib/server/delivery";
import { clientIp, filesFrom, rateLimited, validateFiles } from "@/lib/server/guards";

const placements = getService("placement-printing")?.subServices ?? [];

const fail = (status: number, code: string, message: string, fieldErrors?: Record<string, string>) =>
  NextResponse.json({ ok: false, code, message, fieldErrors }, { status });

export async function POST(request: Request) {
  if (rateLimited(clientIp(request))) {
    return fail(429, "rate_limited", "Too many enquiries in a short time. Please try again in a few minutes.");
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail(400, "validation", "The enquiry could not be read. Please try again.");
  }

  // Honeypot: real users never fill this hidden field.
  if (form.get("website")) {
    return NextResponse.json({ ok: true, reference: createReference("quote") });
  }

  const fields = normalizeQuote({
    name: form.get("name"),
    company: form.get("company"),
    email: form.get("email"),
    phone: form.get("phone"),
    service: form.get("service"),
    subService: form.get("subService"),
    quantity: form.get("quantity"),
    fabric: form.get("fabric"),
    placement: form.getAll("placement"),
    deliveryDate: form.get("deliveryDate"),
    needSample: form.get("needSample"),
    requirements: form.get("requirements"),
  });

  const fieldErrors: Record<string, string> = {
    ...validateQuote(fields, {
      serviceSlugs,
      subServicesFor: (slug) => getService(slug)?.subServices ?? [],
      placements,
      // allow one day of timezone slack
      today: new Date(Date.now() - 86_400_000).toISOString().slice(0, 10),
    }),
  };

  const artwork = filesFrom(form, "artwork");
  const reference = filesFrom(form, "reference");
  const artworkErrors = await validateFiles(artwork, ARTWORK_EXTENSIONS, "Artwork");
  const referenceErrors = await validateFiles(reference, REFERENCE_EXTENSIONS, "Reference images");
  if (artworkErrors.length) fieldErrors.artwork = artworkErrors.join(" ");
  if (referenceErrors.length) fieldErrors.reference = referenceErrors.join(" ");
  const totalBytes = [...artwork, ...reference].reduce((n, f) => n + f.size, 0);
  if (totalBytes > UPLOAD_LIMITS.maxTotalBytes) {
    fieldErrors.artwork = "Total upload size is too large. Please share large files via email instead.";
  }

  if (Object.keys(fieldErrors).length) {
    return fail(422, "validation", "Please check the highlighted fields.", fieldErrors);
  }

  const ref = createReference("quote");
  const result = await deliverEnquiry({
    kind: "quote",
    reference: ref,
    submittedAt: new Date().toISOString(),
    fields: { ...fields, serviceTitle: getService(fields.service)?.title ?? "Not sure" },
    files: [
      ...artwork.map((file) => ({ field: "artwork", file })),
      ...reference.map((file) => ({ field: "reference", file })),
    ],
  });

  if (!result.ok) {
    return result.reason === "not_configured"
      ? fail(
          503,
          "not_configured",
          "Online enquiries are switched off. Please call, WhatsApp or email us directly. Your details have not been sent.",
        )
      : fail(502, "failed", "We couldn't send your enquiry right now. Please try again or contact us directly.");
  }

  return NextResponse.json({ ok: true, reference: ref });
}
