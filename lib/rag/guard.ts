/**
 * Post-generation safety net for TE Chat replies (server only).
 *
 * The system prompt already forbids inventing figures, charges and capabilities,
 * but a 220-turn conversational test showed that prompt-only enforcement is
 * *intermittent* rather than reliable: the same question that was answered
 * correctly in one run produced "we can typically print up to 6-8 colours in a
 * single run" and "yes, there is a separate screen setup charge" in another -
 * neither of which appears anywhere in the business data (chat-test-results/).
 *
 * Anything that must be true every single time cannot rely on the prompt alone,
 * so this scans the finished reply and reports unsupported claims. It is
 * deliberately conservative: it only matches patterns that assert a specific
 * capability count or the existence of a chargeable item, because those are the
 * two that a customer can plan or negotiate around. General hedged wording
 * ("depends on the design", "the team will confirm") is left alone.
 */

export type UnsupportedClaim = { kind: "capacity" | "charge" | "capability"; match: string };

const PATTERNS: { kind: UnsupportedClaim["kind"]; re: RegExp }[] = [
  // "up to 6-8 colours in a single run", "typically 4 screens", "usually 3 layers"
  {
    kind: "capacity",
    re: /\b(?:up to|typically|usually|generally|normally|around|about)\s+\d+\s*(?:[-–to]+\s*\d+\s*)?(?:colou?rs?|screens?|layers?|placements?|techniques?)\b/gi,
  },
  // "there is a separate screen setup charge", "we charge a setup fee", "comes with a mould charge"
  {
    kind: "charge",
    re: /\b(?:there(?:'s| is| are)\s+(?:a|an|separate)|we\s+(?:do\s+)?charge|comes\s+with\s+(?:a|an))\s+[a-z\s-]{0,30}?(?:charge|fee|surcharge)\b/gi,
  },
  // Capability/material claims that the service data does not list
  {
    kind: "capability",
    re: /\b(?:we\s+(?:can|do|offer|provide)\s+[a-z\s-]{0,20}?(?:variable[- ]data\s+printing|wash[- ]test(?:ing)?\s+reports?|testing\s+and\s+reporting))\b/gi,
  },
  {
    kind: "capability",
    re: /\b(?:this\s+material|the\s+(?:vinyl|material)|it)\s+is\s+(?:[a-z\s,-]{0,30}?)(?:waterproof|residue[- ]free|machine\s+washable|fade[- ]proof)\b/gi,
  },
];

/** Returns every unsupported claim found in a finished reply (empty when clean). */
export function scanForUnsupportedClaims(text: string): UnsupportedClaim[] {
  const found: UnsupportedClaim[] = [];
  for (const { kind, re } of PATTERNS) {
    for (const m of text.matchAll(re)) {
      found.push({ kind, match: m[0].trim() });
    }
  }
  return found;
}

/**
 * The correction appended to a reply that contained an unsupported claim.
 * The reply has already been streamed to the visitor by the time this runs, so
 * the honest option is to visibly retract rather than silently rewrite.
 */
export function correctionFor(claims: UnsupportedClaim[]): string {
  const kinds = new Set(claims.map((c) => c.kind));
  const what = kinds.has("charge")
    ? "any charge I mentioned"
    : kinds.has("capacity")
      ? "the figure I gave above"
      : "the capability I mentioned above";
  return `\n\nOne correction: please disregard ${what} - I should not have stated that, as it isn't confirmed in our published information. Our team will confirm the exact details with your quotation.`;
}
