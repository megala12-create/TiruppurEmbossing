/**
 * LLM provider wrapper (server only).
 *
 * Centralises the model choice and API access behind one function so the
 * rest of the app never talks to the provider's API directly. If
 * OPENROUTER_API_KEY is not set, streamReply() runs in a documented
 * "fallback mode": no external call is made, and a templated, clearly
 * labelled reply is built from the retrieved knowledge instead of an LLM
 * completion. This keeps the feature fully working (and honest about what
 * it can't yet do) without a credential.
 *
 * Provider: OpenRouter (https://openrouter.ai), called over its plain
 * OpenAI-compatible REST API - no SDK dependency, so there's no extra
 * package version to track. To swap providers again, this file is the only
 * place that needs to change: streamReply()'s signature (system prompt +
 * context + message history in, text chunks out) is what the rest of the
 * app depends on.
 *
 * Why OpenRouter rather than the Gemini API this originally used: a live
 * ListModels check against that project's Gemini key showed no model
 * exposing `streamGenerateContent`, so replies could only be fetched as one
 * slow blocking call, and that key measured 4-25s per request with frequent
 * transient failures (confirmed in production: both the initial attempt and
 * its retry timed out). OpenRouter supports real SSE streaming, so the
 * visitor sees text within about a second instead of waiting for the whole
 * answer.
 */

import { site } from "@/data/site";
import type { ChatMessage } from "./chatSchema";
import type { RetrievedChunk } from "./retrieve";

/** Centralised model config - change here, or via CHAT_MODEL, not scattered through the codebase. */
export const CHAT_MODEL = process.env.CHAT_MODEL?.trim() || "meta-llama/llama-3.1-8b-instruct";
const MAX_OUTPUT_TOKENS = 1024;
/**
 * Two separate budgets per attempt, because one timeout covering the whole stream is
 * wrong for streaming: a long reply (measured with Tamil, which costs far more tokens
 * per word than English) was being aborted mid-word at 20s even though it was streaming
 * healthily. The first number bounds time-to-first-token (is the provider responding at
 * all?); the second bounds generation once text is already flowing. Worst case across
 * both attempts stays under the route's maxDuration (app/api/chat/route.ts).
 */
const FIRST_ATTEMPT = { ttfbMs: 10_000, streamMs: 35_000 };
const RETRY_ATTEMPT = { ttfbMs: 6_000, streamMs: 25_000 };
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

export const chatProviderConfigured = () => Boolean(process.env.OPENROUTER_API_KEY?.trim());

export type GenerateArgs = {
  systemPrompt: string;
  contextBlock: string;
  messages: ChatMessage[];
};

/** Streams reply text chunks. In fallback mode, yields one templated chunk. */
export async function* streamReply(args: GenerateArgs, sources: RetrievedChunk[]): AsyncGenerator<string> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    yield fallbackReply(sources);
    return;
  }

  const body = {
    model: CHAT_MODEL,
    messages: [
      { role: "system", content: `${args.systemPrompt}\n\n${args.contextBlock}` },
      ...args.messages.map((m) => ({ role: m.role, content: m.content })),
    ],
    max_tokens: MAX_OUTPUT_TOKENS,
    temperature: 0.4,
    stream: true,
  };

  // Retry only while nothing has been shown to the visitor yet - once text has been
  // streamed out, a retry would duplicate or contradict what they already read.
  let yieldedText = false;
  let lastError: unknown;

  for (const budget of [FIRST_ATTEMPT, RETRY_ATTEMPT]) {
    try {
      for await (const event of attemptStream(apiKey, body, budget)) {
        if (event.text) {
          yieldedText = true;
          yield event.text;
        }
        if (event.finishReason === "length") {
          yield "\n\n(That answer hit a length limit and may be cut short - ask me to continue for more detail.)";
        } else if (event.finishReason && !["stop", "end_turn"].includes(event.finishReason)) {
          console.error("[te-chat] unexpected finish_reason:", event.finishReason);
        }
      }
      if (!yieldedText) throw new Error("Provider returned an empty reply");
      return;
    } catch (err) {
      lastError = err;
      if (yieldedText) {
        // Never leak provider errors to the client.
        console.error("[te-chat] provider error after partial reply:", err instanceof Error ? err.message : err);
        yield "\n\n(The answer above was cut off by a connection problem - please ask again if it looks incomplete.)";
        return;
      }
    }
  }

  console.error("[te-chat] provider error:", lastError instanceof Error ? lastError.message : lastError);
  yield "\n\nSorry, I couldn't reach the assistant just now. Please try again in a moment, or use the contact details below.";
}

type StreamEvent = { text?: string; finishReason?: string };

/** One streaming attempt. Yields text deltas as they arrive; throws on any failure. */
async function* attemptStream(
  apiKey: string,
  body: unknown,
  budget: { ttfbMs: number; streamMs: number },
): AsyncGenerator<StreamEvent> {
  // Abort manually rather than with AbortSignal.timeout so the deadline can be extended
  // once tokens start arriving - see the FIRST_ATTEMPT/RETRY_ATTEMPT comment above.
  const controller = new AbortController();
  let timer = setTimeout(() => controller.abort(), budget.ttfbMs);

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // Optional OpenRouter attribution headers (used for their app rankings).
        "HTTP-Referer": site.url,
        "X-Title": site.name,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok || !res.body) {
      const detail = await res.text().catch(() => "");
      throw new Error(`OpenRouter responded ${res.status} ${res.statusText} ${detail.slice(0, 300)}`);
    }

    // Read line by line, keeping any trailing partial line for the next chunk: a single
    // read() can deliver several SSE lines at once, or split one mid-way.
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let started = false;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const event = parseSseLine(line);
        if (event === "done") return;
        if (!event) continue;
        // Switch to the generation budget as soon as the provider is demonstrably
        // responding - the first chunk often carries the role with empty content, so
        // don't wait for non-empty text before extending the deadline.
        if (!started) {
          started = true;
          clearTimeout(timer);
          timer = setTimeout(() => controller.abort(), budget.streamMs);
        }
        yield event;
      }
    }
    const tail = parseSseLine(buffer);
    if (tail && tail !== "done") yield tail;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Parses one SSE line in OpenAI/OpenRouter chat-completion format.
 * Returns "done" for the terminating `[DONE]` sentinel, an event for a usable
 * chunk, or null for keep-alive comments (`: OPENROUTER PROCESSING`) and blanks.
 */
function parseSseLine(line: string): StreamEvent | "done" | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith(":")) return null;
  if (!trimmed.startsWith("data:")) return null;
  const payload = trimmed.slice(5).trim();
  if (!payload) return null;
  if (payload === "[DONE]") return "done";
  try {
    const parsed = JSON.parse(payload) as {
      error?: { message?: string };
      choices?: { delta?: { content?: string }; finish_reason?: string | null }[];
    };
    if (parsed.error) throw new Error(parsed.error.message || "provider error");
    const choice = parsed.choices?.[0];
    return { text: choice?.delta?.content || undefined, finishReason: choice?.finish_reason || undefined };
  } catch (err) {
    // A malformed line is skipped, but a real error payload must surface.
    if (err instanceof Error && !(err instanceof SyntaxError)) throw err;
    return null;
  }
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
