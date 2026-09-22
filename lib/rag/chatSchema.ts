/**
 * Input validation for the chat API (server only). Dependency-free, mirrors
 * the discipline of lib/forms/schema.ts.
 */

import { sanitizeText } from "@/lib/forms/schema";

export const CHAT_LIMITS = {
  maxMessageChars: 2000,
  maxMessages: 24, // last N turns kept client-side and sent per request
  maxTotalChars: 16000,
};

export type ChatRole = "user" | "assistant";
export type ChatMessage = { role: ChatRole; content: string };

export type ChatValidationResult = { ok: true; messages: ChatMessage[] } | { ok: false; error: string };

/** Validates and sanitises the client-supplied conversation history. */
export function validateChatMessages(input: unknown): ChatValidationResult {
  if (!Array.isArray(input) || input.length === 0) {
    return { ok: false, error: "A message is required." };
  }
  if (input.length > CHAT_LIMITS.maxMessages) {
    return { ok: false, error: "This conversation has grown too long. Please restart the chat." };
  }

  const messages: ChatMessage[] = [];
  let total = 0;
  for (const raw of input) {
    if (!raw || typeof raw !== "object") return { ok: false, error: "Invalid message." };
    const { role, content } = raw as { role?: unknown; content?: unknown };
    if (role !== "user" && role !== "assistant") return { ok: false, error: "Invalid message role." };
    const text = sanitizeText(content, CHAT_LIMITS.maxMessageChars, true);
    if (!text) continue;
    total += text.length;
    messages.push({ role, content: text });
  }

  if (messages.length === 0) return { ok: false, error: "A message is required." };
  if (total > CHAT_LIMITS.maxTotalChars) {
    return { ok: false, error: "This conversation has grown too long. Please restart the chat." };
  }
  if (messages[messages.length - 1].role !== "user") {
    return { ok: false, error: "The last message must be from the visitor." };
  }
  return { ok: true, messages };
}

/* --------------------------------------------------- chat-collected quote */

import { SAMPLE_OPTIONS, isEmail, isPhone, type FieldErrors } from "@/lib/forms/schema";
import { getService, serviceSlugs } from "@/data/services";

export type ChatQuoteFields = {
  name: string;
  company: string;
  email: string;
  phone: string;
  service: string;
  fabric: string;
  garmentType: string;
  quantity: string;
  placement: string;
  deliveryDate: string;
  needSample: string;
  requirements: string;
  consent: boolean;
};

export function normalizeChatQuote(raw: Record<string, unknown>): ChatQuoteFields {
  return {
    name: sanitizeText(raw.name, 120),
    company: sanitizeText(raw.company, 160),
    email: sanitizeText(raw.email, 200).toLowerCase(),
    phone: sanitizeText(raw.phone, 30),
    service: sanitizeText(raw.service, 80),
    fabric: sanitizeText(raw.fabric, 200),
    garmentType: sanitizeText(raw.garmentType, 120),
    quantity: sanitizeText(raw.quantity, 80),
    placement: sanitizeText(raw.placement, 120),
    deliveryDate: sanitizeText(raw.deliveryDate, 10),
    needSample: sanitizeText(raw.needSample, 12),
    requirements: sanitizeText(raw.requirements, 3000, true),
    consent: raw.consent === true,
  };
}

export function validateChatQuote(v: ChatQuoteFields): FieldErrors<keyof ChatQuoteFields> {
  const e: FieldErrors<keyof ChatQuoteFields> = {};
  if (v.name.length < 2) e.name = "Please share a name.";
  if (!v.phone && !v.email) e.phone = "Please share a phone number or email.";
  if (v.phone && !isPhone(v.phone)) e.phone = "Please share a valid phone number, e.g. +91 98765 43210.";
  if (v.email && !isEmail(v.email)) e.email = "Please share a valid email address.";
  if (!v.service) e.service = "Please choose a printing service.";
  else if (!serviceSlugs.includes(v.service) && v.service !== "not-sure") e.service = "Please choose a valid service.";
  if (v.deliveryDate && (!/^\d{4}-\d{2}-\d{2}$/.test(v.deliveryDate) || Number.isNaN(Date.parse(v.deliveryDate)))) {
    e.deliveryDate = "Please share a valid date.";
  }
  if (v.needSample && !(SAMPLE_OPTIONS as readonly string[]).includes(v.needSample)) e.needSample = "Please choose a valid option.";
  if (!v.consent) e.consent = "Please confirm you're okay being contacted about this enquiry.";
  return e;
}

export const chatQuoteServiceTitle = (slug: string) => getService(slug)?.title ?? "Not sure";
