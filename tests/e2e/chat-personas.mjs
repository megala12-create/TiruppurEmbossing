/**
 * TE Chat customer-conversation test.
 * Drives the real website in a headed Chromium browser. Each persona holds ONE
 * continuous conversation - later turns deliberately use pronouns and refer back
 * ("that process", "it", "the same one") so context retention is tested too.
 *
 * Run: node tests/e2e/chat-personas.mjs
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";

const BASE = process.env.TEST_BASE_URL || "http://localhost:3000";
const OUT = "chat-test-results";
const ANSWER_TIMEOUT_MS = 120_000;

const personas = [
  {
    name: "Rajesh Kumar",
    company: "Kumar Exports",
    service: "Emboss Printing",
    profile: "Garment exporter, polo shirts for European buyers",
    turns: [
      "Hi, I'm Rajesh from Kumar Exports. We manufacture polo shirts for European buyers.",
      "We want our brand logo on the left chest with a premium raised look. What would you suggest?",
      "How is that different from the silicone HD option you mentioned?",
      "Let's go with emboss then. Our fabric is 220 GSM pique cotton - will it hold the emboss properly?",
      "Good. What would the price per piece be for 1000 polos with that?",
    ],
  },
  {
    name: "Priya Venkatesan",
    company: "VStar Sportswear",
    service: "Sublimation Printing",
    profile: "Sportswear maker, all-over printed jerseys",
    turns: [
      "Hello, we make sports jerseys for local clubs. Do you handle all-over printing?",
      "Our jerseys are 100% polyester mesh. Is that okay for it?",
      "We also have some cotton training tees. Can you use the same process for those?",
      "Alright, let's stick to the polyester jerseys. What is your minimum order quantity?",
      "We need 500 pieces by 20th October. Is that achievable?",
    ],
  },
  {
    name: "Mohammed Arif",
    company: "Arif Sourcing",
    service: "DTF Printing",
    profile: "Buying house sourcing for multiple brands",
    turns: [
      "Good morning. I'm a sourcing agent working with several apparel brands.",
      "One of my clients has a photographic design with about 12 colours. Which process would you use for it?",
      "Why that one over screen printing?",
      "Does it hold up in industrial washing?",
      "Fine. What artwork format should I send you for it?",
    ],
  },
  {
    name: "Lakshmi Narayanan",
    company: "Lakshmi Label",
    service: "Silicone HD / Specialty",
    profile: "Fashion label wanting premium layered finishes",
    turns: [
      "Hi, I run a fashion label and I'm looking for a premium finish on our hoodies.",
      "I want a raised glossy logo that feels high-end. What do you recommend?",
      "Can we add a puff texture around that same logo?",
      "What is the largest size we could run on the back panel?",
      "Okay, I'd like to talk to your team about this. How do I reach them?",
    ],
  },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function readMessages(page) {
  return page.evaluate(() => {
    const log = document.querySelector('#te-chat-panel [role="log"]');
    if (!log) return [];
    return Array.from(log.children)
      .filter((el) => el.className.includes("flex") && el.className.includes("justify-"))
      .map((el) => {
        const bubble = el.querySelector("div");
        const links = Array.from(bubble?.querySelectorAll("a") || []).map((a) => a.textContent.trim());
        const clone = bubble?.cloneNode(true);
        clone?.querySelectorAll("ul").forEach((u) => u.remove());
        return {
          role: el.className.includes("justify-end") ? "user" : "assistant",
          text: (clone?.innerText || "").trim(),
          sources: links,
        };
      });
  });
}

async function ask(page, question) {
  const before = (await readMessages(page)).filter((m) => m.role === "assistant").length;
  await page.fill('#te-chat-panel input[type="text"], #te-chat-panel input:not([type])', question);
  await page.click('#te-chat-panel button[type="submit"]');

  const started = Date.now();
  let firstTextAt = null;
  let stable = "";
  let stableSince = null;

  while (Date.now() - started < ANSWER_TIMEOUT_MS) {
    await sleep(500);
    const assistants = (await readMessages(page)).filter((m) => m.role === "assistant");
    if (assistants.length <= before) continue;
    const latest = assistants[assistants.length - 1];
    if (latest.text && firstTextAt === null) firstTextAt = Date.now() - started;
    const busy = await page.locator('#te-chat-panel :text("TE Chat is thinking")').count();
    if (latest.text === stable && latest.text.length > 0 && busy === 0) {
      if (stableSince && Date.now() - stableSince > 2500) {
        return { answer: latest.text, sources: latest.sources, ms: Date.now() - started, firstTextMs: firstTextAt };
      }
    } else {
      stable = latest.text;
      stableSince = Date.now();
    }
  }
  const assistants = (await readMessages(page)).filter((m) => m.role === "assistant");
  return {
    answer: assistants[assistants.length - 1]?.text || "(no answer - timed out)",
    sources: assistants[assistants.length - 1]?.sources || [],
    ms: Date.now() - started,
    firstTextMs: firstTextAt,
    timedOut: true,
  };
}

(async () => {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const results = [];

  for (const persona of personas) {
    console.log(`\n=== ${persona.name} (${persona.company}) - ${persona.service} ===`);
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await page.click('button[aria-controls="te-chat-panel"]');
    await page.waitForSelector("#te-chat-panel", { timeout: 15000 });
    await sleep(800);

    let turn = 0;
    for (const q of persona.turns) {
      turn += 1;
      process.stdout.write(`  [turn ${turn}] ${q}\n`);
      let r;
      try {
        r = await ask(page, q);
      } catch (err) {
        r = { answer: `(test error: ${err.message})`, sources: [], ms: 0, error: true };
      }
      console.log(`  -> (${(r.ms / 1000).toFixed(1)}s) ${r.answer.slice(0, 100).replace(/\n/g, " ")}...`);
      results.push({
        customer: persona.name,
        company: persona.company,
        service: persona.service,
        profile: persona.profile,
        turn,
        question: q,
        answer: r.answer,
        sources: r.sources,
        totalMs: r.ms,
        firstTextMs: r.firstTextMs ?? null,
        timedOut: !!r.timedOut,
      });
      writeFileSync(`${OUT}/raw-results.json`, JSON.stringify(results, null, 2));
      await sleep(1200);
    }
    await page.click('#te-chat-panel button:has-text("Restart")').catch(() => {});
    await sleep(800);
  }

  await browser.close();
  console.log(`\nSaved ${results.length} conversational turns to ${OUT}/raw-results.json`);
})();
