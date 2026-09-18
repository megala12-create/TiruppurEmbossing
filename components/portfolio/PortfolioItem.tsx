import Image from "next/image";
import type { PortfolioItem as Item } from "@/data/portfolio";
import { cn } from "@/lib/cn";

/** Portfolio tile - a real <button> that opens the detail dialog. */
export function PortfolioItem({
  item,
  categoryLabel,
  onOpen,
  onHover,
  priority,
}: {
  item: Item;
  categoryLabel: string;
  onOpen: () => void;
  onHover?: (hovering: boolean) => void;
  priority?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      onPointerEnter={() => onHover?.(true)}
      onPointerLeave={() => onHover?.(false)}
      className="group relative mb-4 block w-full break-inside-avoid text-left animate-fade md:mb-6"
      aria-label={`${item.title}, ${categoryLabel}. Open details`}
    >
      <span className="relative block overflow-hidden bg-graphite">
        <Image
          src={item.image.src}
          alt={item.image.alt}
          width={item.image.width}
          height={item.image.height}
          sizes="(min-width: 1024px) 31vw, (min-width: 640px) 48vw, 100vw"
          preload={priority}
          className="h-auto w-full transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/0 to-ink/0 opacity-0 transition-opacity duration-500 lg:group-hover:opacity-100" />
        <span className="t-label absolute left-3 top-3 bg-ink/80 px-2 py-1 text-[0.58rem] text-bone backdrop-blur-sm">
          {categoryLabel}
        </span>
        {item.illustrative && (
          <span className="t-label absolute right-3 top-3 flex items-center gap-1.5 bg-ink/80 px-2 py-1 text-[0.58rem] text-bone backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-orange" aria-hidden />
            Illustrative
          </span>
        )}
        <span
          className={cn(
            "absolute inset-x-0 bottom-0 hidden p-4 transition-[transform,opacity] duration-700 ease-[var(--ease-out-expo)] lg:block",
            "translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100",
          )}
        >
          <span className="block font-display text-2xl font-extrabold uppercase leading-none [font-variation-settings:'wdth'_76]">
            {item.title}
          </span>
          <span className="mt-2 block text-sm text-bone/75">{item.summary}</span>
        </span>
      </span>
      <span className="flex items-baseline justify-between gap-4 pt-3 lg:hidden">
        <span className="font-display text-lg font-bold uppercase leading-tight [font-variation-settings:'wdth'_80]">
          {item.title}
        </span>
        <span className="t-label text-mute">View</span>
      </span>
    </button>
  );
}
