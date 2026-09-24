/**
 * Builds a standalone, filterable HTML report from raw-results.json + ratings.json
 * + themes.json. Everything is inlined (no CDN, no network) so the file can be
 * opened straight from disk or emailed to the client.
 *
 * Run: node tests/e2e/build-report.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";

const OUT = "chat-test-results";
const RAW = process.env.RAW_FILE || "raw-results.json";
const raw = JSON.parse(readFileSync(`${OUT}/${RAW}`, "utf8"));
const ratings = JSON.parse(readFileSync(`${OUT}/ratings.json`, "utf8"));
const themes = JSON.parse(readFileSync(`${OUT}/themes.json`, "utf8"));
const byN = new Map(ratings.map((r) => [r.n, r]));
const rows = raw.map((r, i) => ({ ...r, ...(byN.get(i + 1) || { rating: null, improve: "?", reason: "" }) }));

const esc = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const overall = avg(rows.map((r) => r.rating).filter((n) => typeof n === "number"));
const needs = rows.filter((r) => r.improve === "YES");
const avgMs = avg(rows.map((r) => r.totalMs));
const customers = [...new Set(rows.map((r) => r.customer))];
const services = [...new Set(rows.map((r) => r.service))];

const perCustomer = customers.map((c) => {
  const rs = rows.filter((r) => r.customer === c);
  return {
    customer: c,
    company: rs[0].company,
    service: rs[0].service,
    profile: rs[0].profile,
    avg: avg(rs.map((r) => r.rating)),
    flags: rs.filter((r) => r.improve === "YES").length,
    turns: rs.length,
    avgMs: avg(rs.map((r) => r.totalMs)),
  };
});

const dist = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((n) => ({ n, count: rows.filter((r) => r.rating === n).length }));
const maxDist = Math.max(1, ...dist.map((d) => d.count));
const model = process.env.CHAT_MODEL || "meta-llama/llama-3.3-70b-instruct";

const tableRows = rows
  .map(
    (r) => `<tr data-customer="${esc(r.customer)}" data-service="${esc(r.service)}" data-improve="${esc(r.improve)}" data-rating="${r.rating}"
  data-text="${esc((r.question + " " + r.answer + " " + (r.reason || "")).toLowerCase())}">
  <td><strong>${esc(r.customer)}</strong><div class="meta">${esc(r.company)}<br>${esc(r.service)}</div></td>
  <td class="q"><span class="turn">${r.turn}</span>${esc(r.question)}</td>
  <td><div class="ans">${esc(r.answer)}</div>
      ${r.sources?.length ? `<div class="srcs">Sources shown: ${r.sources.map((s) => `<span>${esc(s)}</span>`).join("")}</div>` : ""}
      <div class="meta">${(r.totalMs / 1000).toFixed(1)}s${r.firstTextMs ? ` &middot; first text ${(r.firstTextMs / 1000).toFixed(1)}s` : ""}</div></td>
  <td class="score ${r.rating >= 9 ? "s-hi" : r.rating >= 7 ? "s-mid" : "s-lo"}">${r.rating}/10</td>
  <td><span class="pill ${r.improve === "YES" ? "yes" : "no"}">${esc(r.improve)}</span></td>
  <td class="reason">${esc(r.reason || "—")}</td>
</tr>`,
  )
  .join("\n");

const convoBlocks = perCustomer
  .map((p) => {
    const rs = rows.filter((r) => r.customer === p.customer);
    const msgs = rs
      .map(
        (r) => `<div class="msg u"><div class="bub">${esc(r.question)}</div></div>
      <div class="msg a"><div class="bub">${esc(r.answer)}<div class="meta">${(r.totalMs / 1000).toFixed(1)}s &middot; rated ${r.rating}/10${r.improve === "YES" ? " &middot; needs improvement" : ""}</div></div></div>`,
      )
      .join("\n");
    return `<details class="convo" open>
    <summary>${esc(p.customer)} &mdash; ${esc(p.company)}
      <span class="meta">${esc(p.service)} &middot; ${esc(p.profile)}</span>
      <span class="score ${p.avg >= 9 ? "s-hi" : p.avg >= 7 ? "s-mid" : "s-lo"}" style="margin-left:auto">${p.avg.toFixed(1)}/10</span>
      ${p.flags ? `<span class="pill yes">${p.flags} to fix</span>` : `<span class="pill no">clean</span>`}
    </summary>
    <div class="body">${msgs}</div></details>`;
  })
  .join("\n");

const themeBlocks = themes
  .map(
    (t) => `<div class="theme"><div class="cnt2">${esc(t.count)} answers${t.turns ? " &middot; " + esc(t.turns) : ""}</div>
  <h3>${esc(t.title)}</h3><p>${esc(t.detail)}</p>
  <p style="margin-top:8px"><strong>Fix:</strong> ${esc(t.fix)}</p></div>`,
  )
  .join("\n");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>TE Chat Test Report</title>
<style>
  :root{
    --ink:#ffffff; --carbon:#f7f6f4; --line:#e3e0da; --bone:#16161a; --mute:#5b5853;
    --teal:#017486; --red:#c81c24; --amber:#b4530b; --green:#1c7a4a;
  }
  @media (prefers-color-scheme: dark){ :root:not([data-theme="light"]){
    --ink:#121214; --carbon:#191a1d; --line:#2c2d31; --bone:#f2efea; --mute:#a5a29c;
    --teal:#37b3c6; --red:#ff6b6f; --amber:#fbb03c; --green:#4ac489;
  }}
  :root[data-theme="dark"]{
    --ink:#121214; --carbon:#191a1d; --line:#2c2d31; --bone:#f2efea; --mute:#a5a29c;
    --teal:#37b3c6; --red:#ff6b6f; --amber:#fbb03c; --green:#4ac489;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--ink);color:var(--bone);font:15px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Inter,sans-serif}
  .wrap{max-width:1500px;margin:0 auto;padding:32px 16px 80px}
  h1{font-size:clamp(1.5rem,3vw,2.2rem);margin:0 0 4px;letter-spacing:-.02em}
  .sub{color:var(--mute);margin:0 0 28px;font-size:14px;display:flex;flex-wrap:wrap;gap:8px;align-items:center}
  .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin-bottom:28px}
  .card{border:1px solid var(--line);background:var(--carbon);padding:16px}
  .card .k{font-size:11px;letter-spacing:.09em;text-transform:uppercase;color:var(--mute)}
  .card .v{font-size:28px;font-weight:600;margin-top:4px;letter-spacing:-.02em}
  .card .n{font-size:12px;color:var(--mute)}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px}
  @media(max-width:880px){.grid2{grid-template-columns:1fr}}
  .panel{border:1px solid var(--line);background:var(--carbon);padding:18px}
  .panel h2{font-size:13px;letter-spacing:.09em;text-transform:uppercase;color:var(--mute);margin:0 0 14px;font-weight:600}
  .bar{display:flex;align-items:center;gap:10px;margin-bottom:6px;font-size:13px}
  .bar .lbl{width:42px;color:var(--mute);text-align:right}
  .bar .track{flex:1;height:18px;background:var(--ink);border:1px solid var(--line)}
  .bar .fill{height:100%;background:var(--teal)}
  .bar .cnt{width:26px;color:var(--mute);font-size:12px}
  table{width:100%;border-collapse:collapse;font-size:14px}
  th,td{text-align:left;padding:10px;border-bottom:1px solid var(--line);vertical-align:top}
  th{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--mute);font-weight:600;position:sticky;top:0;background:var(--ink);z-index:2}
  .controls{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:16px;align-items:center}
  select,input[type=search]{min-height:40px;padding:8px 10px;border:1px solid var(--line);background:var(--ink);color:var(--bone);font-size:14px;font-family:inherit}
  input[type=search]{min-width:230px;flex:1}
  .pill{display:inline-block;padding:2px 8px;font-size:11px;font-weight:600;letter-spacing:.04em}
  .yes{background:var(--red);color:#fff}
  .no{background:var(--green);color:#fff}
  .q{font-weight:600}
  .score{font-weight:700;font-variant-numeric:tabular-nums}
  .s-hi{color:var(--green)} .s-mid{color:var(--amber)} .s-lo{color:var(--red)}
  .ans{white-space:pre-wrap;max-width:640px}
  .reason{color:var(--mute);font-size:13px;max-width:330px}
  .meta{color:var(--mute);font-size:12px;margin-top:6px}
  .srcs{margin-top:8px;font-size:12px;color:var(--mute)}
  .srcs span{display:inline-block;border:1px solid var(--line);padding:1px 6px;margin:2px 4px 0 0}
  .turn{display:inline-block;min-width:22px;height:22px;line-height:22px;text-align:center;background:var(--teal);color:#fff;font-size:11px;font-weight:700;margin-right:6px}
  .convo{border:1px solid var(--line);background:var(--carbon);margin-bottom:14px}
  .convo summary{padding:14px 16px;cursor:pointer;font-weight:600;display:flex;flex-wrap:wrap;gap:12px;align-items:center}
  .convo .body{padding:0 16px 16px}
  .msg{margin:12px 0;display:flex}
  .msg.u{justify-content:flex-end}
  .msg .bub{max-width:78%;padding:10px 14px;white-space:pre-wrap;font-size:14px;border:1px solid var(--line)}
  .msg.u .bub{background:var(--teal);color:#fff;border-color:transparent}
  .msg.a .bub{background:var(--ink)}
  .theme{border-left:3px solid var(--red);padding:12px 14px;background:var(--ink);margin-bottom:12px}
  .theme h3{margin:0 0 6px;font-size:15px}
  .theme p{margin:0;color:var(--mute);font-size:14px}
  .theme .cnt2{font-size:12px;color:var(--red);font-weight:600;letter-spacing:.05em;text-transform:uppercase}
  .tabs{display:flex;gap:4px;border-bottom:1px solid var(--line);margin-bottom:20px;flex-wrap:wrap}
  .tabs button{background:none;border:0;border-bottom:2px solid transparent;color:var(--mute);padding:10px 16px;font:inherit;font-size:13px;font-weight:600;cursor:pointer}
  .tabs button[aria-selected=true]{color:var(--bone);border-bottom-color:var(--red)}
  .hidden{display:none}
  .empty{padding:30px;text-align:center;color:var(--mute);border:1px dashed var(--line)}
  .toggle{background:none;border:1px solid var(--line);color:var(--mute);min-height:34px;padding:0 12px;cursor:pointer;font:inherit;font-size:13px}
  @media(max-width:860px){ table,thead,tbody,th,td,tr{display:block} th{display:none}
    td{border:0;padding:6px 0} tr{border-bottom:1px solid var(--line);padding:14px 0}
    .ans,.reason{max-width:none} }
</style>
</head>
<body>
<div class="wrap">
  <h1>TE Chat &mdash; Customer Conversation Test</h1>
  <p class="sub">
    <span>${rows.length} conversational turns &middot; ${customers.length} customers &middot; model <strong>${esc(model)}</strong> via OpenRouter &middot; Chromium (headed, Playwright) &middot; ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</span>
    <button class="toggle" id="themeBtn" type="button">Toggle theme</button>
  </p>

  <div class="cards">
    <div class="card"><div class="k">Average rating</div><div class="v">${overall.toFixed(1)}<span style="font-size:16px;color:var(--mute)">/10</span></div><div class="n">across ${rows.length} answers</div></div>
    <div class="card"><div class="k">No change needed</div><div class="v" style="color:var(--green)">${rows.length - needs.length}</div><div class="n">${(((rows.length - needs.length) / rows.length) * 100).toFixed(0)}% of answers</div></div>
    <div class="card"><div class="k">Need improvement</div><div class="v" style="color:var(--red)">${needs.length}</div><div class="n">${((needs.length / rows.length) * 100).toFixed(0)}% flagged</div></div>
    <div class="card"><div class="k">Avg response</div><div class="v">${(avgMs / 1000).toFixed(1)}s</div><div class="n">slowest ${(Math.max(...rows.map((r) => r.totalMs)) / 1000).toFixed(1)}s</div></div>
    <div class="card"><div class="k">Root causes</div><div class="v">${themes.length}</div><div class="n">see Insights tab</div></div>
  </div>

  <div class="tabs" role="tablist">
    <button role="tab" aria-selected="true" data-tab="table">Answer-by-answer</button>
    <button role="tab" aria-selected="false" data-tab="convos">Conversations</button>
    <button role="tab" aria-selected="false" data-tab="insights">Insights</button>
  </div>

  <section id="tab-table">
    <div class="controls">
      <select id="fCustomer"><option value="">All customers</option>${customers.map((c) => `<option>${esc(c)}</option>`).join("")}</select>
      <select id="fService"><option value="">All services</option>${services.map((s) => `<option>${esc(s)}</option>`).join("")}</select>
      <select id="fImprove"><option value="">Improvement: any</option><option value="YES">Needs improvement</option><option value="NO">No change needed</option></select>
      <select id="fRating"><option value="">Any rating</option><option value="9">9 and above</option><option value="8">8 and above</option><option value="7">7 and below</option><option value="6">6 and below</option></select>
      <input type="search" id="fSearch" placeholder="Search question, answer or reason...">
      <span class="meta" id="count"></span>
    </div>
    <table id="tbl">
      <thead><tr>
        <th style="width:140px">Customer</th><th style="width:230px">Question</th><th>Chatbot answer (full)</th>
        <th style="width:70px">Rating</th><th style="width:110px">Improvement</th><th style="width:330px">Reason</th>
      </tr></thead>
      <tbody>
${tableRows}
      </tbody>
    </table>
    <div class="empty hidden" id="noRows">No answers match these filters.</div>
  </section>

  <section id="tab-convos" class="hidden">
${convoBlocks}
  </section>

  <section id="tab-insights" class="hidden">
    <div class="grid2">
      <div class="panel">
        <h2>Rating distribution</h2>
        ${dist
          .filter((d) => d.count)
          .map(
            (d) =>
              `<div class="bar"><span class="lbl">${d.n}/10</span><span class="track"><span class="fill" style="width:${(d.count / maxDist) * 100}%"></span></span><span class="cnt">${d.count}</span></div>`,
          )
          .join("")}
      </div>
      <div class="panel">
        <h2>Per customer</h2>
        <table>
          <thead><tr><th>Customer</th><th>Service</th><th>Avg</th><th>To fix</th><th>Avg time</th></tr></thead>
          <tbody>${perCustomer
            .map(
              (p) =>
                `<tr><td>${esc(p.customer)}<div class="meta">${esc(p.company)}</div></td><td>${esc(p.service)}</td>
              <td class="score ${p.avg >= 9 ? "s-hi" : p.avg >= 7 ? "s-mid" : "s-lo"}">${p.avg.toFixed(1)}</td>
              <td>${p.flags}/${p.turns}</td><td>${(p.avgMs / 1000).toFixed(1)}s</td></tr>`,
            )
            .join("")}</tbody>
        </table>
      </div>
    </div>
    <div class="panel">
      <h2>Root causes behind the flagged answers</h2>
${themeBlocks}
    </div>
  </section>
</div>

<script>
(function(){
  var f={c:document.getElementById('fCustomer'),s:document.getElementById('fService'),
         i:document.getElementById('fImprove'),r:document.getElementById('fRating'),q:document.getElementById('fSearch')};
  var rowsEl=[].slice.call(document.querySelectorAll('#tbl tbody tr'));
  var countEl=document.getElementById('count'), noRows=document.getElementById('noRows');
  function apply(){
    var n=0;
    rowsEl.forEach(function(tr){
      var ok=true;
      if(f.c.value && tr.dataset.customer!==f.c.value) ok=false;
      if(f.s.value && tr.dataset.service!==f.s.value) ok=false;
      if(f.i.value && tr.dataset.improve!==f.i.value) ok=false;
      var rt=parseInt(tr.dataset.rating,10);
      if(f.r.value==='9'&&!(rt>=9)) ok=false;
      if(f.r.value==='8'&&!(rt>=8)) ok=false;
      if(f.r.value==='7'&&!(rt<=7)) ok=false;
      if(f.r.value==='6'&&!(rt<=6)) ok=false;
      var q=f.q.value.trim().toLowerCase();
      if(q && tr.dataset.text.indexOf(q)===-1) ok=false;
      tr.style.display=ok?'':'none';
      if(ok)n++;
    });
    countEl.textContent=n+' of '+rowsEl.length+' answers';
    noRows.classList.toggle('hidden',n>0);
  }
  Object.keys(f).forEach(function(k){f[k].addEventListener('input',apply)});
  apply();

  var tabs=[].slice.call(document.querySelectorAll('.tabs button'));
  tabs.forEach(function(b){b.addEventListener('click',function(){
    tabs.forEach(function(x){x.setAttribute('aria-selected',String(x===b))});
    ['table','convos','insights'].forEach(function(id){
      document.getElementById('tab-'+id).classList.toggle('hidden',id!==b.dataset.tab);
    });
  })});

  document.getElementById('themeBtn').addEventListener('click',function(){
    var cur=document.documentElement.getAttribute('data-theme');
    var dark=matchMedia('(prefers-color-scheme: dark)').matches;
    var next=cur==='dark'?'light':(cur==='light'?'dark':(dark?'light':'dark'));
    document.documentElement.setAttribute('data-theme',next);
  });
})();
</script>
</body>
</html>`;

const OUTFILE = process.env.REPORT_FILE || "TE-Chat-Test-Report.html";
writeFileSync(`${OUT}/${OUTFILE}`, html, "utf8");
console.log(`Report written: ${OUT}/${OUTFILE} (${(html.length / 1024).toFixed(0)} KB)`);
console.log(`avg ${overall.toFixed(2)} | flagged ${needs.length}/${rows.length} | avg ${(avgMs / 1000).toFixed(1)}s`);
