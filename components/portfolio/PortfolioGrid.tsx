"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PortfolioItem as Item } from "@/data/portfolio";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { useDesktopMotion } from "@/lib/hooks";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, ArrowRight, Close } from "@/components/ui/Icons";
import { PortfolioFilter, type FilterOption } from "./PortfolioFilter";
import { PortfolioItem } from "./PortfolioItem";

type Props = {
  items: Item[];
  categories: { id: string; label: string }[];
  serviceTitles: Record<string, string>;
};

export function PortfolioGrid({ items, categories, serviceTitles }: Props) {
  const params = useSearchParams();
  const initialCategory = params.get("category");
  const initialItem = params.get("item");

  const [filter, setFilter] = useState(
    initialCategory && categories.some((c) => c.id === initialCategory) ? initialCategory : "all",
  );
  const [openSlug, setOpenSlug] = useState<string | null>(
    initialItem && items.some((i) => i.slug === initialItem) ? initialItem : null,
  );
  const [hovering, setHovering] = useState(false);
  const cursorEnabled = useDesktopMotion();
  const dialog = useRef<HTMLDialogElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLSpanElement>(null);

  const labelFor = useCallback((id: string) => categories.find((c) => c.id === id)?.label ?? id, [categories]);

  const options: FilterOption[] = useMemo(
    () => [
      { id: "all", label: "All work", count: items.length },
      ...categories.map((c) => ({ id: c.id, label: c.label, count: items.filter((i) => i.category === c.id).length })),
    ],
    [items, categories],
  );

  const visible = useMemo(() => (filter === "all" ? items : items.filter((i) => i.category === filter)), [items, filter]);
  const openIndex = visible.findIndex((i) => i.slug === openSlug);
  const openItem = openIndex >= 0 ? visible[openIndex] : items.find((i) => i.slug === openSlug);

  const syncUrl = (category: string, item: string | null) => {
    const sp = new URLSearchParams();
    if (category !== "all") sp.set("category", category);
    if (item) sp.set("item", item);
    const qs = sp.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  };

  const changeFilter = (id: string) => {
    setFilter(id);
    syncUrl(id, null);
    track("portfolio_interaction", { action: "filter", category: id });
  };

  const open = (slug: string) => {
    setOpenSlug(slug);
    syncUrl(filter, slug);
    track("portfolio_interaction", { action: "open", item: slug });
  };

  const close = () => dialog.current?.close();

  // Drive the native modal dialog from state.
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (openSlug && !d.open) d.showModal();
    if (!openSlug && d.open) d.close();
  }, [openSlug]);

  // Cursor "View" label (desktop, fine pointer only).
  useEffect(() => {
    if (!cursorEnabled) return;
    const el = grid.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      if (cursor.current) cursor.current.style.transform = `translate3d(${e.clientX - r.left}px, ${e.clientY - r.top}px, 0)`;
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    return () => el.removeEventListener("pointermove", onMove);
  }, [cursorEnabled]);

  const step = (dir: 1 | -1) => {
    if (openIndex < 0 || visible.length < 2) return;
    const next = visible[(openIndex + dir + visible.length) % visible.length];
    setOpenSlug(next.slug);
    syncUrl(filter, next.slug);
  };

  return (
    <>
      <div className="mb-10 flex flex-col gap-6 md:mb-14">
        <PortfolioFilter options={options} value={filter} onChange={changeFilter} />
        <p className="t-label text-mute" aria-live="polite">
          Showing <span className="text-bone">{visible.length}</span> {visible.length === 1 ? "study" : "studies"}
          {filter !== "all" && ` in ${labelFor(filter)}`}
        </p>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-start gap-6 border border-dashed border-line p-10 md:p-16">
          <p className="t-h3">No work in this category yet.</p>
          <p className="max-w-md text-mute">
            New project photography is being added. Browse all studies, or ask us about this process directly.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => changeFilter("all")} variant="outline" icon={false}>
              Show all work
            </Button>
            <Button href="/request-a-quote">Request a Quote</Button>
          </div>
        </div>
      ) : (
        <div ref={grid} className={cn("relative", cursorEnabled && hovering && "cursor-none")}>
          <div key={filter} className="columns-1 gap-4 sm:columns-2 md:gap-6 lg:columns-3">
            {visible.map((item, i) => (
              <PortfolioItem
                key={item.slug}
                item={item}
                categoryLabel={labelFor(item.category)}
                onOpen={() => open(item.slug)}
                onHover={setHovering}
                priority={i < 2}
              />
            ))}
          </div>
          {cursorEnabled && (
            <span
              ref={cursor}
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 z-10 hidden lg:block"
            >
              <span
                className={cn(
                  "t-label -ml-10 -mt-10 flex size-20 items-center justify-center rounded-full bg-red text-white transition-[scale,opacity] duration-300",
                  hovering ? "scale-100 opacity-100" : "scale-50 opacity-0",
                )}
              >
                View
              </span>
            </span>
          )}
        </div>
      )}

      <dialog
        ref={dialog}
        onClose={() => {
          setOpenSlug(null);
          syncUrl(filter, null);
        }}
        onClick={(e) => e.target === dialog.current && close()}
        aria-labelledby="portfolio-dialog-title"
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-ink/95 p-0 text-bone backdrop:bg-ink/80 backdrop:backdrop-blur-sm"
      >
        {openItem && (
          <div className="container-x flex min-h-full flex-col py-5 md:py-8" data-lenis-prevent>
            <div className="flex items-center justify-between gap-4">
              <p className="t-label text-mute">
                {labelFor(openItem.category)}
                {openIndex >= 0 && (
                  <span className="ml-3 tabular-nums">
                    {String(openIndex + 1).padStart(2, "0")} / {String(visible.length).padStart(2, "0")}
                  </span>
                )}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="flex size-12 items-center justify-center border border-line hover:border-bone"
                  aria-label="Previous item"
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="flex size-12 items-center justify-center border border-line hover:border-bone"
                  aria-label="Next item"
                >
                  <ArrowRight size={18} />
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="flex size-12 items-center justify-center bg-red text-white hover:bg-maroon"
                  aria-label="Close"
                  autoFocus
                >
                  <Close size={18} />
                </button>
              </div>
            </div>

            <div className="mt-6 grid flex-1 gap-8 lg:grid-cols-12 lg:items-center">
              <div className="relative lg:col-span-8">
                <Image
                  key={openItem.slug}
                  src={openItem.image.src}
                  alt={openItem.image.alt}
                  width={openItem.image.width}
                  height={openItem.image.height}
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="mx-auto h-auto max-h-[72dvh] w-auto animate-fade object-contain"
                />
              </div>
              <div className="lg:col-span-4">
                <h2 id="portfolio-dialog-title" className="t-h2 text-[clamp(2rem,4vw,3.5rem)]">
                  {openItem.title}
                </h2>
                <p className="mt-4 text-mute">{openItem.summary}</p>
                {openItem.illustrative && (
                  <p className="mt-6 border-l-2 border-orange pl-4 text-sm text-bone/80">
                    This is an illustrative, generated material study used while client project photography is being
                    prepared. It is not a photograph of client work.
                  </p>
                )}
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button href={`/services/${openItem.service}`} variant="light">
                    {serviceTitles[openItem.service] ?? "View service"}
                  </Button>
                  <Button
                    href={`/request-a-quote?service=${openItem.service}`}
                    variant="outline"
                    track="quote_cta_click"
                    trackLabel="portfolio-dialog"
                  >
                    Request a Quote
                  </Button>
                </div>
                <p className="mt-6 text-sm">
                  <Link href="/services" className="link-underline text-mute hover:text-bone">
                    Explore all services
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
