/**
 * The guard is the safety net for claims the system prompt forbids but the model
 * still produced intermittently. Every "must catch" string below is a VERBATIM
 * quote from the 220-turn conversational run (chat-test-results/), so these tests
 * are regression coverage for real observed failures, not invented examples.
 *
 * Run: npm test
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { correctionFor, scanForUnsupportedClaims } from "@/lib/rag/guard";

test("guard: catches the invented capacity count seen in the Screen Printing run", () => {
  const claims = scanForUnsupportedClaims(
    "For Screen Printing, we can typically print up to 6-8 colours in a single run, but this may vary.",
  );
  assert.equal(claims.length, 1);
  assert.equal(claims[0].kind, "capacity");
});

test("guard: catches the invented setup charge seen in the Screen Printing run", () => {
  const claims = scanForUnsupportedClaims(
    "Yes, there is a separate screen setup charge for Screen Printing, which depends on the number of colours.",
  );
  assert.ok(claims.some((c) => c.kind === "charge"), `expected a charge claim, got ${JSON.stringify(claims)}`);
});

test("guard: catches unlisted capabilities and material property claims", () => {
  assert.ok(
    scanForUnsupportedClaims("We can do variable data printing, which allows for individual names.").some(
      (c) => c.kind === "capability",
    ),
  );
  assert.ok(
    scanForUnsupportedClaims("This material is waterproof, durable, and can be easily removed without residue.").some(
      (c) => c.kind === "capability",
    ),
  );
});

test("guard: leaves correct, properly-deferred answers alone", () => {
  const good = [
    "Rates are calculated per job based on quantity, process, print size, and placement. I don't have a fixed price to share.",
    "Minimum order quantity can vary by printing process and job type. Our team will confirm what is possible for your design.",
    "The team will need to confirm the maximum print size based on your specific garment and artwork.",
    "Emboss definition and depth depend on the fabric's weight, knit structure and fibre composition.",
    "We support sampling as part of our production process, and the team confirms costs with your quotation.",
    "You can reach our team at tiruppurembossing@gmail.com or +91 98403 37054.",
  ];
  for (const text of good) {
    assert.deepEqual(scanForUnsupportedClaims(text), [], `false positive on: ${text}`);
  }
});

test("guard: correction text visibly retracts rather than silently rewriting", () => {
  const c = correctionFor([{ kind: "charge", match: "there is a separate setup charge" }]);
  assert.match(c, /disregard/i);
  assert.match(c, /isn't confirmed/i);
});
