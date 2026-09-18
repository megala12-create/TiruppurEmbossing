"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import type { Faq, FaqGroup } from "@/data/faqs";
import { cn } from "@/lib/cn";
import { AccordionItem } from "@/components/ui/Accordion";
import { ArrowRight, Search } from "@/components/ui/Icons";

type Props = { faqs: Faq[]; groups: Record<FaqGroup, string> };

const normalize = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\w\s]/g, " ");

/** Searchable, filterable FAQ built on native <details> accordions. */
export function FaqExplorer({ faqs, groups }: Props) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<FaqGroup | "all">("all");
  const deferred = useDeferredValue(query);

  const results = useMemo(() => {
    const terms = normalize(deferred).split(/\s+/).filter(Boolean);
    return faqs.filter((f) => {
      if (group !== "all" && f.group !== group) return false;
      if (!terms.length) return true;
      const haystack = normalize(`${f.question} ${f.answer ?? ""} ${f.guidance} ${groups[f.group]}`);
      return terms.every((t) => haystack.includes(t));
    });
  }, [faqs, groups, deferred, group]);

  const groupIds = Object.keys(groups) as FaqGroup[];

  return (
    <div className="grid gap-12 lg:grid-cols-12">
      <aside className="lg:col-span-4">
        <div className="lg:sticky lg:top-28">
          <label htmlFor="faq-search" className="t-label text-mute">
            Search questions
          </label>
          <div className="mt-3 flex items-center gap-3 border-b border-line focus-within:border-teal-deep">
            <Search size={20} className="text-mute" />
            <input
              id="faq-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. sample, fabric, MOQ"
              className="min-h-14 w-full bg-transparent text-lg placeholder:text-mute/60 focus:outline-none"
              aria-controls="faq-results"
            />
          </div>

          <div role="group" aria-label="Filter by topic" className="mt-8 flex flex-wrap gap-2 lg:flex-col lg:items-start">
            {(["all", ...groupIds] as const).map((id) => {
              const active = group === id;
              const count = id === "all" ? faqs.length : faqs.filter((f) => f.group === id).length;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setGroup(id)}
                  className={cn(
                    "t-label flex min-h-11 items-center gap-2 border px-4 transition-colors lg:border-0 lg:px-0",
                    active ? "border-teal-deep bg-teal-deep text-white lg:bg-transparent lg:text-red" : "border-line text-bone hover:text-teal-deep",
                  )}
                >
                  {id === "all" ? "All topics" : groups[id]}
                  <span className="tabular-nums text-mute">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <div className="lg:col-span-8" id="faq-results">
        <p className="t-label mb-6 text-mute" aria-live="polite">
          {results.length} {results.length === 1 ? "question" : "questions"}
        </p>

        {results.length === 0 ? (
          <div className="border border-dashed border-line p-10">
            <p className="t-h3">No matching questions.</p>
            <p className="mt-3 text-mute">Try a different word, or ask the team directly.</p>
            <div className="mt-6 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setGroup("all");
                }}
                className="t-label link-underline min-h-11"
              >
                Clear search
              </button>
              <Link href="/contact" className="t-label link-underline flex min-h-11 items-center text-red">
                Contact us
              </Link>
            </div>
          </div>
        ) : (
          <div className="border-t border-line">
            {results.map((f) => {
              const index = faqs.indexOf(f) + 1;
              return (
                <AccordionItem
                  key={f.id}
                  id={f.id}
                  summary={
                    <span className="flex gap-4 md:gap-6">
                      <span className="t-label w-6 shrink-0 pt-1.5 tabular-nums text-mute">
                        {String(index).padStart(2, "0")}
                      </span>
                      <span className="text-[clamp(1.15rem,2vw,1.5rem)] font-medium leading-snug">{f.question}</span>
                    </span>
                  }
                >
                  <div className="pl-10 md:pl-12">
                    {f.answer ? (
                      f.answer.split(/\n\n+/).map((p, i) => (
                        <p key={i} className="mb-3 max-w-2xl text-bone/85">
                          {p}
                        </p>
                      ))
                    ) : (
                      <p className="max-w-2xl text-bone/85">{f.guidance}</p>
                    )}
                    <p className="t-label mt-4 text-mute">{groups[f.group]}</p>
                    <Link
                      href={f.next === "quote" ? "/request-a-quote" : "/contact"}
                      className="t-label mt-5 inline-flex min-h-11 items-center gap-2 text-red"
                    >
                      {f.next === "quote" ? "Request a Quote" : "Contact the team"}
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </AccordionItem>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
