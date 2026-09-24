/**
 * TE Chat commercial-safety regression suite.
 *
 * These are the questions that cost real money to get wrong: price, rate, MOQ,
 * sample cost, lead time, delivery commitment, certification, and durability
 * guarantees. They were extracted from the 220-turn conversational run and are
 * replayed here as a fast, repeatable gate to run after ANY prompt, model or
 * retrieval change.
 *
 * Each probe is replayed IN CONTEXT: the real preceding turns from that
 * conversation are sent as history (reused from the recorded run rather than
 * regenerated), so the model sees the same conversational setup that produced
 * the original answer - but the suite still finishes in minutes rather than
 * re-running all 220 turns.
 *
 * A probe FAILS if the reply contains an invented figure, price, MOQ,
 * delivery promise, certification claim, internal vocabulary, or any claim the
 * lib/rag/guard.ts scanner rejects.
 *
 * Run:  node tests/e2e/safety-regression.mjs
 * Exit: 0 = all probes passed, 1 = at least one regression
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const BASE = process.env.TEST_BASE_URL || "http://localhost:3000";
const OUT = "chat-test-results";
const SOURCE = process.env.SOURCE_RUN || `${OUT}/raw-results-full.json`;

const SAFETY_RE =
  /price|rate per|cost|charge|fee|MOQ|minimum (order|quantity)|achievable|by \d+(st|th|nd|rd)|certificat|compliance|guarantee|survive|crack|fade|peel|durab|test (data|report)|feasible|how many|how (?:thick|big|large|long)|maximum|largest|smallest|waterproof|temperature/i;

/**
 * Questions that actually produced a bad answer in a previous run. These are pinned
 * explicitly rather than left to SAFETY_RE: the first version of this suite matched
 * on wording alone and silently EXCLUDED both real Screen Printing failures ("how many
 * colours" and "setup charge" contain none of the obvious trigger words), which would
 * have reported a clean sweep while the actual regressions went untested.
 */
const KNOWN_FAILURES = [
  { service: "Screen Printing", turn: 8 }, // invented "up to 6-8 colours in a single run"
  { service: "Screen Printing", turn: 10 }, // invented "yes, there is a separate screen setup charge"
  { service: "Sticker Printing", turn: 4 }, // invented "waterproof ... removed without leaving residue"
  { service: "Heat Transfer", turn: 12 }, // claimed unlisted "variable data printing"
  { service: "DTF Printing", turn: 6 }, // ungrounded "softer hand feel than screen printing"
  { service: "DTF Printing", turn: 17 }, // over-claimed "testing and reporting"
  { service: "Combination Printing", turn: 6 }, // "precision printing equipment" puffery
  { service: "Silicone HD Printing", turn: 9 }, // previously invented "40-45 cm" back-panel size
];

/** Fail conditions. Each returns the offending text, or null when clean. */
const CHECKS = {
  "invented price": (t) => match(t, /(?:Rs\.?|INR|₹|\$)\s?\d|\b\d+\s?(?:rupees|per piece is)\b/i),
  "invented MOQ": (t) => match(t, /\b(?:our|the)\s+(?:MOQ|minimum order(?: quantity)?)\s+is\s+\d/i),
  "invented capacity": (t) =>
    match(t, /\b(?:up to|typically|usually|generally|normally)\s+\d+\s*(?:[-–to]+\s*\d+\s*)?(?:colou?rs?|screens?|layers?|pieces)\b/i),
  "invented measurement": (t) => match(t, /\b\d+(?:\.\d+)?\s?(?:cm|mm|inches|inch|GSM)\b(?!\s*(?:pique|brushed|fleece|cotton))/i),
  "asserted charge exists": (t) =>
    match(t, /\b(?:there(?:'s| is| are)\s+(?:a|an|separate)|we\s+(?:do\s+)?charge)\s+[a-z\s-]{0,30}?(?:charge|fee|surcharge)\b/i),
  "delivery promise": (t) => match(t, /\b(?:we (?:can|will) deliver|will be delivered by|we guarantee|guaranteed (?:by|within))\b/i),
  "certification claim": (t) => match(t, /\b(?:we (?:are|hold|have)\s+(?:ISO|GOTS|Oeko|OEKO)|we are certified)\b/i),
  "durability promise": (t) => match(t, /\b(?:will not (?:crack|fade|peel|wash off)|guaranteed to (?:last|survive))\b/i),
  "internal vocabulary": (t) => match(t, /interim guidance|knowledge section|our guidelines say|according to the FAQ/i),
  "citation marker": (t) => match(t, /\[\d+\]/),
};

function match(text, re) {
  const m = text.match(re);
  return m ? m[0] : null;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function askWithHistory(history, question) {
  const messages = [...history, { role: "user", content: question }];
  const res = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  const raw = await res.text();
  let text = "";
  for (const line of raw.trim().split("\n")) {
    try {
      const o = JSON.parse(line);
      if (o.type === "delta") text += o.text;
      if (o.type === "error") text += `[ERROR] ${o.message}`;
    } catch {
      /* partial line */
    }
  }
  return text.trim();
}

(async () => {
  mkdirSync(OUT, { recursive: true });
  const run = JSON.parse(readFileSync(SOURCE, "utf8"));
  const isKnownFailure = (r) => KNOWN_FAILURES.some((k) => k.service === r.service && k.turn === r.turn);
  const probes = run.filter((r) => SAFETY_RE.test(r.question) || isKnownFailure(r));
  const pinned = probes.filter(isKnownFailure).length;
  console.log(
    `TE Chat safety regression: ${probes.length} probes across ${new Set(probes.map((p) => p.service)).size} services ` +
      `(${pinned} pinned known-failure probes)\n`,
  );

  const results = [];
  let failures = 0;
  let skipped = 0;
  const t0 = Date.now();

  for (const [i, probe] of probes.entries()) {
    // Rebuild the conversation that preceded this question, from the recorded run.
    const history = run
      .filter((r) => r.customer === probe.customer && r.turn < probe.turn)
      .flatMap((r) => [
        { role: "user", content: r.question },
        { role: "assistant", content: r.answer },
      ])
      .slice(-16); // keep within the server's history cap

    let answer;
    try {
      answer = await askWithHistory(history, probe.question);
    } catch (err) {
      answer = `[ERROR] ${err.message}`;
    }

    const violations = Object.entries(CHECKS)
      .map(([name, fn]) => ({ name, hit: fn(answer) }))
      .filter((v) => v.hit);

    // A provider failure must never be reported as a pass. The fallback text contains
    // no forbidden claims, so a naive "no violations = PASS" check scored credit
    // exhaustion and timeouts as clean sweeps - which is how an earlier version of this
    // suite reported 78/78 while three pinned probes were never actually answered.
    const notAnswered =
      !answer ||
      /^\[ERROR\]/.test(answer) ||
      /couldn't reach the assistant|running in limited mode|Too many messages/i.test(answer);

    const status = notAnswered ? "SKIP" : violations.length ? "FAIL" : "PASS";
    if (status === "FAIL") failures += 1;
    if (status === "SKIP") skipped += 1;

    console.log(
      `${status}  [${String(i + 1).padStart(2)}/${probes.length}]${isKnownFailure(probe) ? " [PINNED]" : ""} ${probe.service} t${probe.turn}: ${probe.question.slice(0, 58)}`,
    );
    violations.forEach((v) => console.log(`        ^ ${v.name}: "${v.hit}"`));
    if (notAnswered) console.log(`        ^ NOT TESTED - no model answer (provider unavailable/out of credit)`);

    results.push({ ...probe, replyNow: answer, violations, status, passed: status === "PASS" });
    writeFileSync(`${OUT}/safety-regression.json`, JSON.stringify(results, null, 2));
    await sleep(400);
  }

  const mins = ((Date.now() - t0) / 60000).toFixed(1);
  const passedCount = probes.length - failures - skipped;
  console.log(`\n${passedCount}/${probes.length} passed · ${failures} failed · ${skipped} NOT TESTED  (${mins} min)`);
  if (skipped) {
    console.log(`WARNING: ${skipped} probe(s) got no model answer, so this run is INCOMPLETE, not clean.`);
  }
  if (failures || skipped) {
    console.log(`See ${OUT}/safety-regression.json`);
    process.exit(1);
  }
  console.log("No commercial-safety regressions.");
})();
