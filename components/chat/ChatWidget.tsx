"use client";

import { useEffect, useId, useRef, useState } from "react";
import { site, whatsappHref } from "@/data/site";
import { cn } from "@/lib/cn";
import { Close, Phone, WhatsApp } from "@/components/ui/Icons";
import { GREETING, QUICK_ACTIONS } from "@/lib/rag/prompt";
import { QuoteForm, type QuoteDraft } from "./QuoteForm";
import { isQuoteCard, type ChatMessage, type QuoteCard, type Turn } from "./types";

const MAX_HISTORY = 24;
const uid = () => Math.random().toString(36).slice(2, 10);

const greetingMessage: ChatMessage = { id: "greeting", role: "assistant", content: GREETING, status: "done" };

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([greetingMessage]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [turns]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const restart = () => {
    setTurns([greetingMessage]);
    setInput("");
    setQuoteError(null);
  };

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    setInput("");

    const userMsg: ChatMessage = { id: uid(), role: "user", content, status: "done" };
    const assistantId = uid();
    const history = [
      ...turns.filter((t): t is ChatMessage => !isQuoteCard(t)).map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content },
    ].slice(-MAX_HISTORY);

    setTurns((prev) => [...prev, userMsg, { id: assistantId, role: "assistant", content: "", status: "streaming" }]);
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "The assistant is unavailable right now.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          handleEvent(assistantId, JSON.parse(line));
        }
      }
      if (buffer.trim()) handleEvent(assistantId, JSON.parse(buffer));
    } catch {
      updateMessage(assistantId, (m) => ({
        ...m,
        status: "error",
        content: m.content || "Sorry, I couldn't reach the assistant just now.",
      }));
    } finally {
      setBusy(false);
    }
  }

  function handleEvent(assistantId: string, event: { type: string; text?: string; sources?: ChatMessage["sources"]; mode?: ChatMessage["mode"]; message?: string }) {
    if (event.type === "delta" && event.text) {
      updateMessage(assistantId, (m) => ({ ...m, content: m.content + event.text }));
    } else if (event.type === "sources") {
      updateMessage(assistantId, (m) => ({ ...m, sources: event.sources, mode: event.mode }));
    } else if (event.type === "done") {
      updateMessage(assistantId, (m) => ({ ...m, status: "done" }));
    } else if (event.type === "error") {
      updateMessage(assistantId, (m) => ({ ...m, status: "error", content: m.content || event.message || "Something went wrong." }));
    }
  }

  function updateMessage(id: string, fn: (m: ChatMessage) => ChatMessage) {
    setTurns((prev) => prev.map((t) => (!isQuoteCard(t) && t.id === id ? fn(t) : t)));
  }

  function retry() {
    const lastUser = [...turns].reverse().find((t): t is ChatMessage => !isQuoteCard(t) && t.role === "user");
    if (!lastUser) return;
    setTurns((prev) => {
      const idx = prev.findIndex((t) => t === lastUser);
      return prev.slice(0, idx + 1);
    });
    void send(lastUser.content);
  }

  function openQuoteForm() {
    setQuoteError(null);
    setTurns((prev) => [...prev, { id: uid(), kind: "quote-form", status: "collecting" } satisfies QuoteCard]);
  }

  function cancelQuoteForm(cardId: string) {
    setTurns((prev) => prev.filter((t) => !(isQuoteCard(t) && t.id === cardId)));
  }

  async function submitQuoteForm(cardId: string, draft: QuoteDraft) {
    setQuoteError(null);
    setTurns((prev) => prev.map((t) => (isQuoteCard(t) && t.id === cardId ? { ...t, status: "submitting" } : t)));
    try {
      const res = await fetch("/api/chat/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.ok) throw new Error(body.message || "We couldn't send your enquiry right now.");
      setTurns((prev) => [
        ...prev.map((t) => (isQuoteCard(t) && t.id === cardId ? { ...t, status: "submitted" as const, reference: body.reference } : t)),
        {
          id: uid(),
          role: "assistant",
          status: "done",
          content: `Thank you — your enquiry has been recorded. Reference: ${body.reference}. Our team will get back to you on the details you shared. Is there anything else I can help with?`,
        },
      ]);
    } catch (err) {
      setQuoteError(err instanceof Error ? err.message : "We couldn't send your enquiry right now.");
      setTurns((prev) => prev.map((t) => (isQuoteCard(t) && t.id === cardId ? { ...t, status: "collecting" } : t)));
    }
  }

  const onlyGreeting = turns.length === 1;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="te-chat-panel"
        className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-4 z-40 flex h-14 w-14 items-center justify-center bg-teal-deep text-white shadow-lg transition-transform hover:scale-105 lg:bottom-6"
      >
        {open ? <Close size={22} /> : <ChatBubble size={24} />}
        <span className="sr-only">{open ? "Close TE Chat" : "Open TE Chat, our printing assistant"}</span>
      </button>

      {open && (
        <div
          id="te-chat-panel"
          ref={panelRef}
          role="dialog"
          aria-label="TE Chat"
          aria-labelledby={titleId}
          className="fixed inset-0 z-40 flex flex-col bg-ink sm:inset-auto sm:bottom-[calc(6rem+env(safe-area-inset-bottom))] sm:right-4 sm:h-[min(640px,80vh)] sm:w-[380px] sm:border sm:border-line sm:shadow-2xl lg:bottom-24"
        >
          <header className="flex items-center justify-between border-b border-line bg-bone px-4 py-3 text-white">
            <div>
              <p id={titleId} className="t-label text-white">
                TE Chat
              </p>
              <p className="text-xs text-white/70">{site.name} printing assistant</p>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={restart} className="t-label px-2 py-1 text-[0.6rem] text-white/80 hover:text-white">
                Restart
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close TE Chat"
                className="flex h-8 w-8 items-center justify-center text-white/80 hover:text-white"
              >
                <Close size={18} />
              </button>
            </div>
          </header>

          <div ref={listRef} role="log" aria-live="polite" className="flex-1 space-y-3 overflow-y-auto bg-carbon p-4">
            {turns.map((t) =>
              isQuoteCard(t) ? (
                t.status === "submitted" ? null : (
                  <QuoteForm
                    key={t.id}
                    submitting={t.status === "submitting"}
                    error={quoteError}
                    onCancel={() => cancelQuoteForm(t.id)}
                    onSubmit={(draft) => submitQuoteForm(t.id, draft)}
                  />
                )
              ) : (
                <MessageBubble key={t.id} message={t} onRetry={retry} />
              ),
            )}
            {busy && <p className="t-label text-[0.65rem] text-mute">TE Chat is thinking…</p>}
          </div>

          {onlyGreeting && (
            <div className="flex flex-wrap gap-2 border-t border-line bg-ink px-3 py-2">
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => (a.id === "quote" ? openQuoteForm() : send(a.prompt))}
                  className="t-label border border-line px-2.5 py-1.5 text-[0.62rem] hover:border-teal-deep hover:text-teal-deep"
                >
                  {a.label}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="flex items-center gap-2 border-t border-line bg-ink p-3"
          >
            <label className="flex-1">
              <span className="sr-only">Message TE Chat</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={2000}
                placeholder="Ask about a printing process, quote, sample…"
                className="block min-h-11 w-full border border-line bg-ink px-3 py-2 text-sm text-bone focus:border-teal-deep focus:outline-none"
              />
            </label>
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="t-label min-h-11 shrink-0 bg-teal-deep px-4 text-[0.65rem] text-white hover:bg-red disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send
            </button>
          </form>

          <div className="flex items-center justify-center gap-4 border-t border-line bg-ink px-3 py-2 text-xs text-mute">
            <a href={`tel:${site.contact.phones[0].e164}`} className="flex items-center gap-1 hover:text-teal-deep">
              <Phone size={14} /> Call
            </a>
            <a
              href={whatsappHref("Hello Tiruppur Embossing, I have a printing enquiry.")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-teal-deep"
            >
              <WhatsApp size={14} /> WhatsApp
            </a>
          </div>
        </div>
      )}
    </>
  );
}

function MessageBubble({ message, onRetry }: { message: ChatMessage; onRetry: () => void }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[88%] px-3 py-2 text-sm", isUser ? "bg-teal-deep text-white" : "border border-line bg-ink text-bone")}>
        {message.status === "streaming" && !message.content ? (
          <span className="inline-flex gap-1 py-1" aria-hidden>
            <Dot /> <Dot delay="150ms" /> <Dot delay="300ms" />
          </span>
        ) : (
          <p className="whitespace-pre-line">{message.content}</p>
        )}

        {message.mode === "fallback" && message.status === "done" && (
          <p className="mt-2 border-t border-line pt-2 text-[0.65rem] text-mute">
            Limited mode: the AI assistant isn&apos;t fully configured yet, so this reply is built directly from website
            content rather than generated live.
          </p>
        )}

        {!!message.sources?.length && message.status === "done" && (
          <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t border-line pt-2 text-[0.65rem]">
            {message.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} className="text-teal-deep hover:underline">
                  {s.title}
                </a>
                {!s.verified && <span className="text-mute"> (to be confirmed)</span>}
              </li>
            ))}
          </ul>
        )}

        {message.status === "error" && (
          <button type="button" onClick={onRetry} className="t-label mt-2 text-[0.65rem] text-red hover:underline">
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

const Dot = ({ delay }: { delay?: string }) => (
  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mute" style={{ animationDelay: delay }} />
);

function ChatBubble({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
      <path d="M4 5h16v11H8l-4 4V5Z" strokeLinejoin="round" />
    </svg>
  );
}
