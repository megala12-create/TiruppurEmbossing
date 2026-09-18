import { NextResponse } from "next/server";
import { normalizeContact, validateContact } from "@/lib/forms/schema";
import { createReference, deliverEnquiry } from "@/lib/server/delivery";
import { clientIp, rateLimited } from "@/lib/server/guards";

const fail = (status: number, code: string, message: string, fieldErrors?: Record<string, string>) =>
  NextResponse.json({ ok: false, code, message, fieldErrors }, { status });

export async function POST(request: Request) {
  if (rateLimited(clientIp(request))) {
    return fail(429, "rate_limited", "Too many messages in a short time. Please try again in a few minutes.");
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail(400, "validation", "The message could not be read. Please try again.");
  }

  if (form.get("website")) {
    return NextResponse.json({ ok: true, reference: createReference("contact") });
  }

  const fields = normalizeContact({
    name: form.get("name"),
    phone: form.get("phone"),
    email: form.get("email"),
    message: form.get("message"),
  });
  const fieldErrors = validateContact(fields) as Record<string, string>;
  if (Object.keys(fieldErrors).length) {
    return fail(422, "validation", "Please check the highlighted fields.", fieldErrors);
  }

  const reference = createReference("contact");
  const result = await deliverEnquiry({
    kind: "contact",
    reference,
    submittedAt: new Date().toISOString(),
    fields,
    files: [],
  });

  if (!result.ok) {
    return result.reason === "not_configured"
      ? fail(
          503,
          "not_configured",
          "Online messages are switched off. Please call, WhatsApp or email us directly. Your message has not been sent.",
        )
      : fail(502, "failed", "We couldn't send your message right now. Please try again or contact us directly.");
  }

  return NextResponse.json({ ok: true, reference });
}
