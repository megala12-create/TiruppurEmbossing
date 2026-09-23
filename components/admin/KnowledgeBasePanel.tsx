"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { Notify } from "./shared";

export type KnowledgeStats = {
  builtAt: string;
  totalChunks: number;
  unverifiedChunks: number;
  sources: { source: string; count: number }[];
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });

export function KnowledgeBasePanel({
  stats: initial,
  providerConfigured,
  model,
  notify,
}: {
  stats: KnowledgeStats;
  providerConfigured: boolean;
  model: string;
  notify: Notify;
}) {
  const [stats, setStats] = useState(initial);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/knowledge", { method: "POST" });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string; stats?: KnowledgeStats };
      if (res.status === 401) return window.location.reload();
      if (!res.ok || !body.ok || !body.stats) {
        notify(body.message ?? "Could not refresh the knowledge base.", "error");
        return;
      }
      setStats(body.stats);
      notify(`Knowledge base refreshed - ${body.stats.totalChunks} chunks indexed.`);
    } catch {
      notify("Could not reach the server. Please check your connection.", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p className="mb-6 max-w-2xl text-sm text-mute">
        TE Chat answers only from this indexed content: the service, FAQ, process and contact data that also renders the
        public pages, plus any files placed in <code>content/knowledge/</code>. Refresh after editing that folder or
        redeploying with updated data.
      </p>

      <div
        className={cn(
          "mb-6 flex flex-wrap items-center gap-3 border px-4 py-3 text-sm",
          providerConfigured ? "border-teal-deep bg-teal-deep/5" : "border-orange bg-orange/10",
        )}
      >
        <span className={cn("t-label px-2 py-1 text-[0.6rem] text-white", providerConfigured ? "bg-teal-deep" : "bg-orange")}>
          {providerConfigured ? "Live" : "Limited mode"}
        </span>
        <span>
          {providerConfigured
            ? `Generating replies with ${model}.`
            : "OPENROUTER_API_KEY is not set, so TE Chat replies with matched website content only, not generated answers. Add the key in your environment and redeploy to enable full answers."}
        </span>
      </div>

      <dl className="mb-6 flex flex-wrap gap-x-8 gap-y-2 text-sm">
        <div>
          <dt className="inline text-mute">Indexed chunks: </dt>
          <dd className="inline font-medium">{stats.totalChunks}</dd>
        </div>
        <div>
          <dt className="inline text-mute">Awaiting owner confirmation: </dt>
          <dd className="inline font-medium">{stats.unverifiedChunks}</dd>
        </div>
        <div>
          <dt className="inline text-mute">Last built: </dt>
          <dd className="inline font-medium">{fmt(stats.builtAt)}</dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={refresh}
        disabled={busy}
        className="t-label mb-6 min-h-10 border border-line bg-ink px-3 hover:border-teal-deep disabled:opacity-50"
      >
        {busy ? "Refreshing…" : "Refresh knowledge base"}
      </button>

      <ul className="divide-y divide-line border border-line bg-ink text-sm">
        {stats.sources.map((s) => (
          <li key={s.source} className="flex items-center justify-between px-4 py-2">
            <span>{s.source}</span>
            <span className="text-mute">{s.count} chunk{s.count === 1 ? "" : "s"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
