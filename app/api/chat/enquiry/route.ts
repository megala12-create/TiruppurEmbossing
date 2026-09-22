import { NextResponse } from "next/server";
import { chatQuoteServiceTitle, normalizeChatQuote, validateChatQuote } from "@/lib/rag/chatSchema";
import { createReference, deliverEnquiry } from "@/lib/server/delivery";
import { clientIp, rateLimited } from "@/lib/server/guards";

const fail = (status: number, code: string, message: string, fieldErrors?: Record<string, string>) =>
  NextResponse.json({ ok: false, code, message, fieldErrors }, { status });

/**
 * POST /api/chat/enquiry
 * Submits a quotation enquiry collected conversationally by TE Chat.
 * Reuses the same delivery pipeline as the "Request a Quote" page, so
 * submissions appear in the existing admin Enquiries panel, tagged
 * channel = "chatbot". No file uploads here (chat doesn't support them yet).
 */
export async function POST(request: Request) {
  if (rateLimited(`chat-enquiry:${clientIp(request)}`)) {
    return fail(429, "rate_limited", "Too many enquiries in a short time. Please try again in a few minutes.");
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return fail(400, "validation", "The enquiry could not be read. Please try again.");
  }

  // Honeypot: a hidden field a real chat client never populates.
  if (typeof (body as Record<string, unknown>).website === "string" && (body as Record<string, unknown>).website) {
    return NextResponse.json({ ok: true, reference: createReference("quote") });
  }

  const fields = normalizeChatQuote(body as Record<string, unknown>);
  const fieldErrors = validateChatQuote(fields) as Record<string, string>;
  if (Object.keys(fieldErrors).length) {
    return fail(422, "validation", "Please check the highlighted details.", fieldErrors);
  }

  const reference = createReference("quote");
  const result = await deliverEnquiry({
    kind: "quote",
    reference,
    submittedAt: new Date().toISOString(),
    fields: {
      name: fields.name,
      company: fields.company,
      email: fields.email,
      phone: fields.phone,
      service: fields.service,
      serviceTitle: chatQuoteServiceTitle(fields.service),
      fabric: fields.fabric,
      garmentType: fields.garmentType,
      quantity: fields.quantity,
      placement: fields.placement,
      deliveryDate: fields.deliveryDate,
      needSample: fields.needSample,
      requirements: fields.requirements,
      channel: "TE Chat",
    },
    files: [],
  });

  if (!result.ok) {
    return result.reason === "not_configured"
      ? fail(503, "not_configured", "Online enquiries are switched off. Please call, WhatsApp or email us directly. Your details have not been sent.")
      : fail(502, "failed", "We couldn't send your enquiry right now. Please try again or contact us directly.");
  }

  return NextResponse.json({ ok: true, reference });
}
