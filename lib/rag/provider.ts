/**
 * LLM provider wrapper (server only).
 *
 * Centralises the model choice and API access behind one function so the
 * rest of the app never talks to the provider's API directly. If
 * GEMINI_API_KEY is not set, generateReply() runs in a documented
 * "fallback mode": no external call is made, and a templated, clearly
 * labelled reply is built from the retrieved knowledge instead of an LLM
 * completion. This keeps the feature fully working (and honest about what
 * it can't yet do) without a credential.
 *
 * Provider: Google Gemini, called over its plain REST API (no SDK
 * dependency - the API is small and stable enough that a typed fetch call
 * is simpler than pinning an SDK version). To swap providers later, this
 * file is the only place that needs to change: streamReply()'s signature
 * (system prompt + context + message history in, text chunks out) is what
 * the rest of the app depends on.
 *
 * Uses `generateContent` (a single request/response), not
 * `streamGenerateContent`: a live ListModels check against this project's
 * key showed no model exposing `streamGenerateContent` in its
 * `supportedGenerationMethods` (only `generateContent`, `countTokens`,
 * `createCachedContent`, `batchGenerateContent`). Calling the streaming
 * endpoint anyway "worked" but silently truncated replies mid-sentence with
 * no error or finishReason - an unsupported code path, not a real feature.
 * The app's own streaming contract (ND-JSON `delta` events to the client)
 * is unchanged; it just now receives the whole reply as one delta instead
 * of several, so token-by-token rendering isn't available with this
 * provider/key, but replies are complete and reliable.
 */

import type { ChatMessage } from "./chatSchema";
import type { RetrievedChunk } from "./retrieve";

/** Centralised model config - change here, not scattered through the codebase. */
export const CHAT_MODEL = process.env.CHAT_MODEL?.trim() || "gemini-flash-lite-latest";
const MAX_OUTPUT_TOKENS = 1024;
// This key/model combination has measurably inconsistent latency and an occasional
// transient 400 (confirmed not reproducible with the same payload retried immediately -
// see streamReply). One retry with a shorter budget noticeably improves reliability
// without risking the route's own maxDuration (app/api/chat/route.ts).
const FIRST_ATTEMPT_TIMEOUT_MS = 18_000;
const RETRY_TIMEOUT_MS = 8_000;
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export const chatProviderConfigured = () => Boolean(process.env.GEMINI_API_KEY?.trim());

export type GenerateArgs = {
  systemPrompt: string;
  contextBlock: string;
  messages: ChatMessage[];
};

/** Streams reply text chunks. In fallback mode, yields one templated chunk. */
export async function* streamReply(args: GenerateArgs, sources: RetrievedChunk[]): AsyncGenerator<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    yield fallbackReply(sources);
    return;
  }

  const body = {
    system_instruction: { parts: [{ text: `${args.systemPrompt}\n\n${args.contextBlock}` }] },
    contents: args.messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    // No thinkingConfig: support for it is inconsistent across this project's available
    // models (it 400s with INVALID_ARGUMENT on at least one Flash-Lite build), so omitting
    // it is the compatible default. Revisit per-model if CHAT_MODEL is changed and latency
    // matters more than the small risk of an unsupported field.
    generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS, temperature: 0.4 },
  };

  let chunk: ParsedChunk | null = null;
  let lastError: unknown;
  for (const timeoutMs of [FIRST_ATTEMPT_TIMEOUT_MS, RETRY_TIMEOUT_MS]) {
    try {
      chunk = await attemptGenerate(apiKey, body, timeoutMs);
      lastError = undefined;
      break;
    } catch (err) {
      lastError = err;
    }
  }

  if (lastError !== undefined || !chunk) {
    // Never leak provider errors (which can include request details) to the client.
    console.error("[te-chat] provider error:", lastError instanceof Error ? lastError.message : lastError);
    yield "\n\nSorry, I couldn't reach the assistant just now. Please try again in a moment, or use the contact details below.";
    return;
  }

  if (chunk.text) yield chunk.text;
  if (chunk.finishReason === "MAX_TOKENS") {
    yield "\n\n(That answer hit a length limit and may be cut short - ask me to continue for more detail.)";
  } else if (chunk.finishReason && chunk.finishReason !== "STOP") {
    console.error("[te-chat] unexpected finishReason:", chunk.finishReason);
    yield "\n\n(The assistant stopped early - please ask again if the answer above looks incomplete.)";
  } else if (!chunk.text) {
    console.error("[te-chat] provider error: Gemini returned no text and no finish reason");
    yield "\n\nSorry, I couldn't reach the assistant just now. Please try again in a moment, or use the contact details below.";
  }
}

async function attemptGenerate(apiKey: string, body: unknown, timeoutMs: number): Promise<ParsedChunk> {
  const res = await fetch(`${API_BASE}/${CHAT_MODEL}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    // Fail into our own graceful fallback/retry well within Vercel's function time budget,
    // instead of letting a hung/slow call get killed by the platform.
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Gemini responded ${res.status} ${res.statusText} ${detail.slice(0, 300)}`);
  }

  const chunk = jsonToChunk(await res.json());
  if (!chunk || chunk.error) throw new Error("Gemini returned an error or empty response");
  return chunk;
}

type ParsedChunk = { text?: string; error?: boolean; finishReason?: string };

function jsonToChunk(parsed: unknown): ParsedChunk | null {
  const obj = parsed as {
    error?: unknown;
    candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
  };
  if (obj?.error) return { error: true };
  const candidate = obj?.candidates?.[0];
  const text = candidate?.content?.parts?.map((p) => p.text ?? "").join("") || undefined;
  const finishReason = candidate?.finishReason;
  if (!text && !finishReason) return null;
  return { text, finishReason };
}

/** Deterministic, no-LLM reply used when no provider key is configured. */
function fallbackReply(sources: RetrievedChunk[]): string {
  if (sources.length === 0) {
    return (
      "I'm running in limited mode right now (the AI assistant isn't fully configured yet), so I can't generate a free-form answer. " +
      "Please use \"Request a quotation\" or the contact details below and our team will help directly."
    );
  }
  const top = sources.slice(0, 3);
  const lines = top.map((s) => `• ${s.title}: ${s.text.slice(0, 220).trim()}${s.text.length > 220 ? "…" : ""} (${s.url})`);
  return (
    "I'm running in limited mode right now (the AI assistant isn't fully configured yet), so here's what I found directly from the website that matches your question:\n\n" +
    lines.join("\n") +
    "\n\nFor anything beyond this, please use \"Request a quotation\" or contact the team directly."
  );
}
