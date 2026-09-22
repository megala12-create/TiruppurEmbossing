export type ChatSource = { title: string; url: string; verified: boolean };

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
  mode?: "live" | "fallback";
  status?: "pending" | "streaming" | "done" | "error";
};

/** A quote-request card rendered inline in the message list. */
export type QuoteCard = {
  id: string;
  kind: "quote-form";
  status: "collecting" | "submitting" | "submitted" | "failed";
  reference?: string;
};

export type Turn = ChatMessage | QuoteCard;

export const isQuoteCard = (t: Turn): t is QuoteCard => "kind" in t && t.kind === "quote-form";
