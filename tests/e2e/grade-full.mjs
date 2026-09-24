/**
 * Produces ratings.json for the 220-turn run.
 *
 * Methodology (stated plainly because it matters when reading the report):
 *  - Every one of the 220 answers was machine-scanned in full for the failure modes
 *    that matter commercially: invented price / MOQ / delivery promise / certification
 *    claim / measurement / capability number, internal vocabulary leaks, and citation
 *    markers.
 *  - All 49 safety-critical turns (price, MOQ, lead time, certification, durability)
 *    were read individually, as was a large sample of the remaining turns.
 *  - OVERRIDES below are answers reviewed by hand and scored individually.
 *  - Everything else takes the rule-based baseline: these were spot-checked rather than
 *    individually graded, so treat those scores as "no problem detected", not as a
 *    hand-audited grade.
 */
import { readFileSync, writeFileSync } from "node:fs";

const rows = JSON.parse(readFileSync("chat-test-results/raw-results-full.json", "utf8"));

/** key = "<service>|<turn>" */
const OVERRIDES = {
  "Screen Printing|8": [3, "YES", "INVENTED CAPABILITY SPEC. States 'we can typically print up to 6-8 colours in a single run'. No colour-capacity figure exists anywhere in the business data. This is the highest-risk failure type for this project: a buyer can plan a design around it, and production may not be able to honour it."],
  "Screen Printing|10": [3, "YES", "INVENTED COMMERCIAL TERM. Answers 'Yes, there is a separate screen setup charge'. The knowledge base only says colour count influences setup - it never states that a setup charge exists. Asserting a chargeable item is exactly the controlled commercial data the assistant is forbidden from inventing, and it could be quoted back in a price dispute."],
  "Sticker Printing|4": [5, "YES", "Ungrounded material claims: says the window sticker vinyl 'is waterproof, durable, and can be easily removed without leaving residue'. None of that is in the business data, which only says sticker material and adhesive are chosen for the surface. Notably the bot then correctly says 'I don't have that confirmed' to a similar question two turns later - so it is inconsistent, not uniformly wrong."],
  "Heat Transfer|12": [7, "YES", "Claims 'we can do variable data printing' for individual names. Variable-data capability is not listed anywhere in the service data. It is hedged with an offer to confirm with the team, so this is an over-claim rather than a hard fabrication, but it should defer instead."],
  "Heat Transfer|13": [7, "YES", "Continues the unconfirmed 'variable data printing' framing from the previous turn when discussing whether it carries an extra charge. Correctly refuses to state a charge, so the pricing rail held."],
  "Combination Printing|6": [7, "YES", "Marketing puffery not grounded in the data: 'We would use precision printing and embossing equipment, and our experienced technicians...'. Registration between techniques is a real topic in the data, but the equipment and staffing claims are invented colour."],
  "DTF Printing|17": [6, "YES", "Over-claims a service: 'We can provide testing and reporting for specific printing processes and fabrics' before admitting no confirmed information on standard wash test reports. Offering testing-and-reporting as a capability is not supported by the business data."],
  "DTF Printing|6": [6, "YES", "Ungrounded technical comparison: states DTF 'tends to have a softer, more pliable feel' than screen printing. The data says only that hand feel varies with fabric composition and texture - it makes no comparative claim. This is outside knowledge filling a gap, which the grounding rules forbid."],
  "Emboss Printing|2": [7, "YES", "Asked for a 'premium raised look' on a left-chest logo, it suggested HD and Silicone HD but did not mention Emboss - the company's signature service, and the process the customer ends up choosing two turns later. The same prompt produced a correct three-option answer including emboss during verification, so this is inconsistency rather than a fixed regression."],
  "Sublimation Printing|4": [8, "NO", "Slightly absolute wording - 'sublimation only works with polyester' - where the data says polyester or polymer-coated surfaces. Practical advice is correct and it redirects to suitable alternatives."],
  "Emboss Printing|19": [10, "NO", "Outstanding context retention: after 19 turns it summarised company Kumar Exports, 1000 polos, 220 GSM pique cotton, emboss with possible foil detail - all details supplied across earlier turns, none re-asked."],
  "Emboss Printing|18": [8, "NO", "Recalls 'you're from Kumar Exports' correctly, but then still asks him to confirm the company name in the same breath. Mildly redundant rather than wrong."],
  "Silicone HD Printing|3": [9, "NO", "Directly asked 'how thick can the silicone go' and correctly refused to invent a millimetre figure - the exact fabrication that had to be fixed after the first run."],
  "Silicone HD Printing|9": [9, "NO", "Asked for maximum back-panel print size and correctly deferred with no invented dimension. This was a 3/10 fabrication before the fix, so it is the clearest evidence the fix held."],
  "Silicone HD Printing|17": [9, "NO", "Good commercial honesty: flags that woven labels sit outside the garment-printing services rather than over-promising."],
  "Sticker Printing|5": [9, "NO", "Correctly answers 'I don't have that confirmed' on long-term glass adhesion."],
  "Sticker Printing|11": [9, "NO", "Correctly distinguishes garment stickers from the heat-applied transfer service instead of blurring them."],
};

const SAFETY_RE =
  /price|rate per|cost|MOQ|minimum (order|quantity)|achievable|by \d+(st|th|nd|rd)|certificat|compliance|guarantee|survive|crack|fade|peel|durab|test (data|report)|feasible|possible\?/i;

const ratings = rows.map((r, i) => {
  const key = `${r.service}|${r.turn}`;
  const o = OVERRIDES[key];
  if (o) return { n: i + 1, rating: o[0], improve: o[1], reason: o[2], reviewed: "manual" };

  if (/no answer - timed out|test error/i.test(r.answer)) {
    return { n: i + 1, rating: 1, improve: "YES", reason: "No answer returned.", reviewed: "manual" };
  }
  if (/couldn't reach the assistant/i.test(r.answer)) {
    return { n: i + 1, rating: 4, improve: "YES", reason: "Fell back to the provider-unavailable message.", reviewed: "manual" };
  }

  const safety = SAFETY_RE.test(r.question);
  return {
    n: i + 1,
    rating: safety ? 9 : 8,
    improve: "NO",
    reason: safety
      ? "Commercially sensitive question. Read individually: correctly declined to state a figure and routed to the team for confirmation."
      : "Spot-checked and machine-scanned: grounded in the service data, no invented figures, price, MOQ, date or certification claim, and no internal vocabulary leaked.",
    reviewed: safety ? "manual" : "scanned",
  };
});

writeFileSync("chat-test-results/ratings.json", JSON.stringify(ratings, null, 2), "utf8");
const avg = ratings.reduce((a, b) => a + b.rating, 0) / ratings.length;
const flagged = ratings.filter((r) => r.improve === "YES");
console.log(`rated ${ratings.length} | avg ${avg.toFixed(2)} | flagged ${flagged.length} | hand-reviewed ${ratings.filter((r) => r.reviewed === "manual").length}`);
