/**
 * Full 11-service, 220-turn conversational run (headless).
 * Reuses the same driver as chat-personas.mjs but with the full persona set.
 *
 * Run: node tests/e2e/run-full.mjs
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { personas } from "./personas-full.mjs";

const BASE = process.env.TEST_BASE_URL || "http://localhost:3000";
const OUT = "chat-test-results";
const ANSWER_TIMEOUT_MS = 120_000;
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
  let firstTextAt = null, stable = "", stableSince = null;
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
    } else { stable = latest.text; stableSince = Date.now(); }
  }
  const assistants = (await readMessages(page)).filter((m) => m.role === "assistant");
  return { answer: assistants[assistants.length - 1]?.text || "(no answer - timed out)",
    sources: assistants[assistants.length - 1]?.sources || [], ms: Date.now() - started,
    firstTextMs: firstTextAt, timedOut: true };
}

(async () => {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const results = [];
  const t0 = Date.now();

  for (const [pi, persona] of personas.entries()) {
    console.log(`\n=== [${pi + 1}/${personas.length}] ${persona.name} (${persona.company}) - ${persona.service} ===`);
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await page.click('button[aria-controls="te-chat-panel"]');
    await page.waitForSelector("#te-chat-panel", { timeout: 20000 });
    await sleep(600);

    let turn = 0;
    for (const q of persona.turns) {
      turn += 1;
      let r;
      try { r = await ask(page, q); }
      catch (err) { r = { answer: `(test error: ${err.message})`, sources: [], ms: 0, error: true }; }
      const flag = /(no answer - timed out|couldn't reach the assistant|Too many messages)/i.test(r.answer) ? "  <-- FAILED" : "";
      console.log(`  t${String(turn).padStart(2)} (${(r.ms / 1000).toFixed(1)}s) ${r.answer.slice(0, 80).replace(/\n/g, " ")}...${flag}`);
      results.push({ customer: persona.name, company: persona.company, service: persona.service,
        profile: persona.profile, turn, question: q, answer: r.answer, sources: r.sources,
        totalMs: r.ms, firstTextMs: r.firstTextMs ?? null, timedOut: !!r.timedOut });
      writeFileSync(`${OUT}/raw-results-full.json`, JSON.stringify(results, null, 2));
      await sleep(600);
    }
    console.log(`  [elapsed ${((Date.now() - t0) / 60000).toFixed(1)} min, ${results.length}/220 turns]`);
    await page.click('#te-chat-panel button:has-text("Restart")').catch(() => {});
    await sleep(600);
  }

  await browser.close();
  console.log(`\nDONE: ${results.length} turns in ${((Date.now() - t0) / 60000).toFixed(1)} min -> ${OUT}/raw-results-full.json`);
})();
