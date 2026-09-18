import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Plus } from "./Icons";

/**
 * Accessible accordion built on native <details>/<summary>:
 * keyboard operable, announced correctly, searchable with find-in-page and
 * functional without JavaScript. Height animates where supported.
 */
export function AccordionItem({
  summary,
  children,
  defaultOpen,
  name,
  className,
  summaryClassName,
  id,
}: {
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  /** Same `name` = exclusive group (only one open at a time) */
  name?: string;
  className?: string;
  summaryClassName?: string;
  id?: string;
}) {
  return (
    <details id={id} name={name} open={defaultOpen} className={cn("group/acc border-b border-line", className)}>
      <summary
        className={cn(
          "flex min-h-16 items-center justify-between gap-6 py-5 transition-colors hover:text-teal-deep",
          summaryClassName,
        )}
      >
        <span className="min-w-0 flex-1">{summary}</span>
        <span
          className="flex size-10 shrink-0 items-center justify-center border border-line transition-transform duration-500 ease-[var(--ease-out-expo)] group-open/acc:rotate-45 group-open/acc:border-red group-open/acc:text-red"
          aria-hidden
        >
          <Plus size={18} />
        </span>
      </summary>
      <div className="pb-8">{children}</div>
    </details>
  );
}
