import { cn } from "@/lib/cn";
import type { Accent } from "@/data/services";

const accentFill: Record<Accent, string> = {
  teal: "fill-teal",
  red: "fill-red",
  orange: "fill-orange",
  amber: "fill-orange",
  maroon: "fill-maroon",
};

/** Editorial section index, e.g. "01 / SERVICES", with a logo-derived triangle glyph. */
export function SectionLabel({
  index,
  label,
  accent = "teal",
  className,
  tone = "dark",
}: {
  index?: string;
  label: string;
  accent?: Accent;
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <p
      className={cn(
        "t-label flex items-center gap-3",
        tone === "dark" ? "text-mute" : "text-paper-mute",
        className,
      )}
      data-reveal="fade"
    >
      <svg width="10" height="9" viewBox="0 0 10 9" aria-hidden className={accentFill[accent]}>
        <path d="M5 0 10 9H0z" />
      </svg>
      {index && (
        <>
          <span className="text-bone">{index}</span>
          <span aria-hidden>/</span>
        </>
      )}
      <span>{label}</span>
    </p>
  );
}
