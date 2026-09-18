import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { site } from "@/data/site";

/**
 * Logo lockup. The supplied logo is used unmodified; it sits on a light
 * "plate" because its maroon letterforms and transparent interior would lose
 * legibility on the site's near-black surfaces.
 */
export function LogoLockup({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn("group/logo flex items-center gap-3", className)} aria-label={`${site.name}, home`}>
      <span className="relative flex size-11 shrink-0 items-center justify-center transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/logo:-rotate-3 md:size-12">
        <Image
          src="/assets/brand/logo-mark.png"
          alt=""
          width={512}
          height={512}
          sizes="48px"
          className="size-[86%] object-contain"
          loading="eager"
        />
      </span>
      {!compact && (
        <span
          className="font-display text-[0.95rem] font-bold uppercase leading-[0.9] tracking-[0.02em] [font-variation-settings:'wdth'_78]"
          aria-hidden
        >
          Tiruppur
          <br />
          Embossing
        </span>
      )}
    </Link>
  );
}

/** Brand colour calibration strip - a print-industry motif built from the logo palette. */
export function ColorBar({ className, labels = false }: { className?: string; labels?: boolean }) {
  const swatches = [
    { c: "bg-teal-deep", hex: "#017486" },
    { c: "bg-teal", hex: "#008D9B" },
    { c: "bg-amber", hex: "#FBB03C" },
    { c: "bg-orange", hex: "#F77E1E" },
    { c: "bg-red", hex: "#C81C24" },
    { c: "bg-maroon", hex: "#8F202C" },
    { c: "bg-black", hex: "#000000" },
    { c: "bg-white shadow-[inset_0_0_0_1px_var(--color-line)]", hex: "#FFFFFF" },
  ];
  return (
    <div className={cn("grid grid-cols-8", className)} aria-hidden>
      {swatches.map((s) => (
        <div key={s.hex}>
          <div className={cn("h-2", s.c)} />
          {labels && <div className="mt-2 hidden font-mono text-[0.6rem] text-mute md:block">{s.hex}</div>}
        </div>
      ))}
    </div>
  );
}

/** Printer's registration mark. Decorative. */
export function RegMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-6 text-line", className)} aria-hidden fill="none" stroke="currentColor" strokeWidth="1">
      <circle cx="12" cy="12" r="6" />
      <path d="M12 0v24M0 12h24" />
    </svg>
  );
}

/** Tag used on generated/placeholder visuals so they are never mistaken for client work. */
export function IllustrativeTag({ className, children = "Illustrative visual" }: { className?: string; children?: string }) {
  return (
    <span
      className={cn(
        "t-label inline-flex items-center gap-2 bg-ink/80 px-2.5 py-1.5 text-[0.6rem] text-bone backdrop-blur-sm",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-orange" aria-hidden />
      {children}
    </span>
  );
}
