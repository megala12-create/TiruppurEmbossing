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
 */

import type { ChatMessage } from "./chatSchema";
import type { RetrievedChunk } from "./retrieve";

/** Centralised model config - change here, not scattered through the codebase. */
export const CHAT_MODEL = process.env.CHAT_MODEL?.trim() || "gemini-3.6-flash";
const MAX_OUTPUT_TOKENS = 700;
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
    generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS, temperature: 0.4 },
  };

  try {
    const res = await fetch(`${API_BASE}/${CHAT_MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok || !res.body) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Gemini responded ${res.status} ${res.statusText} ${detail.slice(0, 300)}`);
    }

    // The stream is read and re-assembled line by line rather than by splitting on blank
    // lines: a single reader.read() can deliver several SSE "data:" lines already joined
    // together, and splitting only on "\n\n" silently dropped everything but the first one
    // in that case. Reading line-by-line (keeping any trailing partial line in `buffer` for
    // the next chunk) is correct regardless of how the underlying stream happens to chunk.
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let sawMidStreamError = false;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const result = parseSseLine(line);
        if (result?.type === "text") yield result.text;
        if (result?.type === "error") sawMidStreamError = true;
      }
    }
    const tail = buffer.trim();
    if (tail) {
      // If generation is interrupted mid-stream, Gemini can append a plain (non "data:",
      // pretty-printed) error object after the last successful chunk - try that shape too.
      const result = parseSseLine(tail) ?? parseJsonErrorBlock(tail);
      if (result?.type === "text") yield result.text;
      if (result?.type === "error") sawMidStreamError = true;
    }
    if (sawMidStreamError) {
      yield "\n\n(The connection to the assistant was interrupted partway through, so the answer above may be incomplete - please ask again if needed.)";
    }
  } catch (err) {
    // Never leak provider errors (which can include request details) to the client.
    console.error("[te-chat] provider error:", err instanceof Error ? err.message : err);
    yield "\n\nSorry, I couldn't reach the assistant just now. Please try again in a moment, or use the contact details below.";
  }
}

type SseResult = { type: "text"; text: string } | { type: "error" };

/** Parses one `data: {...}` SSE line from the Gemini streaming API. */
function parseSseLine(line: string): SseResult | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data:")) return null;
  const payload = trimmed.slice(5).trim();
  if (!payload || payload === "[DONE]") return null;
  try {
    return jsonToResult(JSON.parse(payload));
  } catch {
    return null;
  }
}

/** Parses a bare (non "data:"-prefixed, possibly multi-line/pretty-printed) `{"error": {...}}` block. */
function parseJsonErrorBlock(text: string): SseResult | null {
  if (!text.startsWith("{")) return null;
  try {
    return jsonToResult(JSON.parse(text));
  } catch {
    return null;
  }
}

function jsonToResult(parsed: unknown): SseResult | null {
  const obj = parsed as { error?: unknown; candidates?: { content?: { parts?: { text?: string }[] } }[] };
  if (obj?.error) return { type: "error" };
  const parts = obj?.candidates?.[0]?.content?.parts;
  const text = parts?.map((p) => p.text ?? "").join("") ?? "";
  return text ? { type: "text", text } : null;
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
