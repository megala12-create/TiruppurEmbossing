"use client";

import { cn } from "@/lib/cn";

export type FilterOption = { id: string; label: string; count: number };

export function PortfolioFilter({
  options,
  value,
  onChange,
}: {
  options: FilterOption[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div role="group" aria-label="Filter portfolio by category" className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.id)}
            className={cn(
              "t-label inline-flex min-h-11 items-center gap-2 border px-4 transition-colors duration-300",
              active ? "border-teal-deep bg-teal-deep text-white" : "border-line text-bone hover:border-bone",
            )}
          >
            {o.label}
            <span className={cn("tabular-nums", active ? "text-white/70" : "text-mute")}>{o.count}</span>
          </button>
        );
      })}
    </div>
  );
}
