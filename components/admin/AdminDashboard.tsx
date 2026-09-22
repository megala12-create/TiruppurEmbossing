"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import type { PortfolioItem } from "@/data/portfolio";
import type { StoredEnquiry } from "@/lib/admin/enquiries";
import { cn } from "@/lib/cn";
import { LogoLockup } from "@/components/ui/Brand";
import { EnquiriesPanel } from "./EnquiriesPanel";
import { ImageSlotCard, type ImageSlot } from "./ImageSlotCard";
import { KnowledgeBasePanel, type KnowledgeStats } from "./KnowledgeBasePanel";
import { SamplesManager } from "./SamplesManager";
import type { Notify } from "./shared";

type Option = { id: string; label: string };

type Props = {
  enquiries: StoredEnquiry[];
  services: ImageSlot[];
  machines: ImageSlot[];
  samples: PortfolioItem[];
  categories: Option[];
  serviceOptions: Option[];
  knowledgeStats: KnowledgeStats;
  chatProviderConfigured: boolean;
  chatModel: string;
};

const TABS = [
  { id: "enquiries", label: "Enquiries" },
  { id: "services", label: "Service categories" },
  { id: "samples", label: "Samples (portfolio)" },
  { id: "machines", label: "Machines" },
  { id: "knowledge", label: "TE Chat" },
] as const;

type Tab = (typeof TABS)[number]["id"];

export function AdminDashboard({
  enquiries,
  services,
  machines,
  samples,
  categories,
  serviceOptions,
  knowledgeStats,
  chatProviderConfigured,
  chatModel,
}: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("enquiries");
  const [toast, setToast] = useState<{ message: string; tone: "ok" | "error" } | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const notify: Notify = useCallback((message, tone = "ok") => {
    setToast({ message, tone });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 6000);
  }, []);

  const logout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" }).catch(() => null);
    router.refresh();
  };

  const newCount = enquiries.filter((e) => e.status === "new").length;
  const customCount = services.filter((s) => s.custom).length;
  const realSamples = samples.filter((s) => !s.illustrative).length;

  return (
    <div className="min-h-svh bg-carbon">
      <header className="sticky top-0 z-20 border-b border-line bg-ink/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div className="flex items-center gap-4">
            <LogoLockup compact />
            <p className="t-label text-mute">Admin</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="t-label flex min-h-10 items-center border border-line px-3 hover:border-teal-deep"
            >
              View website
            </a>
            <button type="button" onClick={logout} className="t-label min-h-10 bg-bone px-3 text-white hover:bg-red">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <h1 className="t-h2 text-[clamp(1.8rem,4vw,3rem)]">Admin</h1>
        <p className="mt-2 max-w-2xl text-mute">
          Review enquiries from the website and manage photos. Photo changes are published as soon as you save; photos
          are resized and optimised automatically (JPG, PNG, WebP or AVIF, up to 20 MB).
        </p>

        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div>
            <dt className="inline text-mute">New enquiries: </dt>
            <dd className="inline font-medium">{newCount}</dd>
          </div>
          <div>
            <dt className="inline text-mute">Service photos uploaded: </dt>
            <dd className="inline font-medium">
              {customCount} / {services.length}
            </dd>
          </div>
          <div>
            <dt className="inline text-mute">Real samples: </dt>
            <dd className="inline font-medium">
              {realSamples} / {samples.length}
            </dd>
          </div>
        </dl>

        <div role="tablist" aria-label="Sections" className="mt-8 flex flex-wrap gap-2 border-b border-line">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              onClick={() => setTab(t.id)}
              className={cn(
                "t-label -mb-px min-h-12 border-b-2 px-4 transition-colors",
                tab === t.id ? "border-red text-bone" : "border-transparent text-mute hover:text-teal-deep",
              )}
            >
              {t.label}
              {t.id === "enquiries" && newCount > 0 && (
                <span className="ml-2 inline-flex min-w-5 justify-center bg-red px-1.5 py-0.5 text-[0.6rem] text-white">
                  {newCount}
                  <span className="sr-only"> new</span>
                </span>
              )}
            </button>
          ))}
        </div>

        <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="pt-8">
          {tab === "enquiries" && <EnquiriesPanel enquiries={enquiries} notify={notify} />}
          {tab === "services" && (
            <>
              <p className="mb-6 text-sm text-mute">
                The main photo for each service category (used on the Services pages, home page and service cards).
              </p>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {services.map((s) => (
                  <ImageSlotCard key={s.slug} slot={s} notify={notify} />
                ))}
              </ul>
            </>
          )}
          {tab === "samples" && (
            <SamplesManager samples={samples} categories={categories} services={serviceOptions} notify={notify} />
          )}
          {tab === "machines" && (
            <>
              <p className="mb-6 text-sm text-mute">
                Photos of your production machines for the Capabilities page. Machines without a photo show a schematic
                diagram.
              </p>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {machines.map((m) => (
                  <ImageSlotCard key={m.slug} slot={m} notify={notify} />
                ))}
              </ul>
            </>
          )}
          {tab === "knowledge" && (
            <KnowledgeBasePanel stats={knowledgeStats} providerConfigured={chatProviderConfigured} model={chatModel} notify={notify} />
          )}
        </div>
      </main>

      <div
        role="status"
        aria-live="polite"
        className={cn(
          "fixed bottom-4 left-1/2 z-30 -translate-x-1/2 px-5 py-3 text-sm shadow-lg transition-opacity",
          toast ? "opacity-100" : "pointer-events-none opacity-0",
          toast?.tone === "error" ? "bg-red text-white" : "bg-teal-deep text-white",
        )}
      >
        {toast?.message}
      </div>
    </div>
  );
}
