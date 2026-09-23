import { buildContextBlock, SYSTEM_PROMPT } from "@/lib/rag/prompt";
import { retrieve } from "@/lib/rag/retrieve";
import { chatProviderConfigured, streamReply } from "@/lib/rag/provider";
import { validateChatMessages } from "@/lib/rag/chatSchema";
import { clientIp, rateLimited } from "@/lib/server/guards";

export const runtime = "nodejs";
// Headroom over lib/rag/provider.ts's worst-case upstream budget (a 10s first-token
// wait plus a 35s generation window, or a failed first attempt plus a full retry), so
// a slow reply fails into our graceful fallback rather than a raw platform timeout.
// Tamil replies are the long tail here: Llama tokenises Tamil script very inefficiently.
export const maxDuration = 60;

/**
 * POST /api/chat
 * Body: { messages: { role: "user" | "assistant"; content: string }[] }
 *
 * Streams the reply as newline-delimited JSON events (one JSON object per
 * line), so the client can render text as it arrives without pulling in an
 * SSE library:
 *   {"type":"delta","text":"..."}      - repeated, append to the message
 *   {"type":"sources","sources":[...]} - sent once, the citations used
 *   {"type":"done"}                    - stream finished
 *   {"type":"error","message":"..."}   - sent instead of the above on failure
 */
export async function POST(request: Request) {
  // A real conversation runs well past the 8-per-10-minutes enquiry-form default.
  if (rateLimited(`chat:${clientIp(request)}`, 40)) {
    return json({ type: "error", message: "Too many messages in a short time. Please wait a few minutes." }, 429);
  }

  const body = await request.json().catch(() => null);
  const validated = validateChatMessages(body?.messages);
  if (!validated.ok) {
    return json({ type: "error", message: validated.error }, 422);
  }

  const lastUserMessage = [...validated.messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const sources = await retrieve(lastUserMessage, { topK: 5, minScore: 0.5 });
  const contextBlock = buildContextBlock(sources);

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: object) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      try {
        for await (const delta of streamReply({ systemPrompt: SYSTEM_PROMPT, contextBlock, messages: validated.messages }, sources)) {
          send({ type: "delta", text: delta });
        }
        send({
          type: "sources",
          sources: sources.map((s) => ({ title: s.title, url: s.url, verified: s.verified })),
          mode: chatProviderConfigured() ? "live" : "fallback",
        });
        send({ type: "done" });
      } catch (err) {
        console.error("[te-chat] stream error:", err instanceof Error ? err.message : err);
        send({ type: "error", message: "Something went wrong. Please try again." });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}

const json = (body: object, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
