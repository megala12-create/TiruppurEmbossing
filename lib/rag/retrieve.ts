/**
 * Retrieval (server only).
 *
 * Lexical (keyword / TF-IDF style) retrieval over the knowledge chunks, with
 * field boosting (title matches score higher than body matches) and a small
 * domain synonym map so shorthand ("HD", "MOQ", common Tamil terms) still
 * finds the right chunks.
 *
 * This intentionally does not call an external embedding API: the knowledge
 * base is small (a few dozen chunks), so lexical scoring already gives
 * accurate, zero-cost, zero-extra-credential retrieval. See README.md ("RAG
 * architecture") for how to swap in a vector store + embedding provider
 * later without changing the chat route's contract.
 */

import { type ChunkCategory, type KnowledgeChunk, getKnowledgeBase } from "./knowledge";

const SYNONYMS: Record<string, string[]> = {
  hd: ["high-density", "high density"],
  moq: ["minimum order quantity", "minimum quantity"],
  dtf: ["digital transfer film", "direct to film"],
  htv: ["heat transfer vinyl", "vinyl"],
  tpu: ["thermoplastic polyurethane transfer"],
  aop: ["all over print", "all-over print"],
  uv: ["ultraviolet"],
  price: ["cost", "rate", "pricing", "quotation", "quote"],
  cost: ["price", "rate", "pricing"],
  sample: ["sampling", "prototype", "proof"],
  quantity: ["pieces", "qty", "units", "bulk"],
  fabric: ["material", "textile", "cloth"],
  tshirt: ["t-shirt", "garment"],
  // common Tamil / Tanglish shorthand -> English retrieval keywords
  "விலை": ["price", "cost"],
  "மாதிரி": ["sample"],
  "துணி": ["fabric"],
  "அளவு": ["quantity", "size"],
  "டிசைன்": ["design", "artwork"],
  "விலைவாசி": ["price"],
  "எப்படி": ["how"],
};

const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "i", "we", "you", "our", "your", "to", "for", "of", "in", "on",
  "and", "or", "do", "does", "can", "could", "will", "would", "please", "hi", "hello", "want", "need", "with",
]);

const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);

function expand(tokens: string[]): string[] {
  const out = new Set(tokens);
  for (const t of tokens) {
    for (const syn of SYNONYMS[t] ?? []) tokenize(syn).forEach((w) => out.add(w));
  }
  return [...out];
}

export type RetrievedChunk = KnowledgeChunk & { score: number };

export type RetrieveOptions = {
  topK?: number;
  minScore?: number;
  categories?: ChunkCategory[];
};

/** Scores every chunk against the query and returns the top matches above minScore. */
export async function retrieve(query: string, opts: RetrieveOptions = {}): Promise<RetrievedChunk[]> {
  const { topK = 5, minScore = 0.5, categories } = opts;
  const { chunks } = await getKnowledgeBase();
  const pool = categories?.length ? chunks.filter((c) => categories.includes(c.category)) : chunks;

  const queryTokens = expand(tokenize(query).filter((t) => !STOPWORDS.has(t)));
  if (queryTokens.length === 0) return [];

  const scored = pool.map((chunk) => {
    const titleTokens = tokenize(chunk.title);
    const bodyTokens = tokenize(chunk.text);
    let score = 0;
    for (const qt of queryTokens) {
      const titleHits = titleTokens.filter((t) => t === qt || t.includes(qt)).length;
      const bodyHits = bodyTokens.filter((t) => t === qt).length;
      score += titleHits * 3 + bodyHits * 1;
    }
    // normalise a little for very long chunks so they don't win purely on length
    const norm = Math.sqrt(bodyTokens.length || 1);
    return { chunk, score: score / norm };
  });

  return scored
    .filter((s) => s.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => ({ ...s.chunk, score: Number(s.score.toFixed(3)) }));
}
