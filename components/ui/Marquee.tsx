import { cn } from "@/lib/cn";

/**
 * CSS-only marquee. Content is duplicated for a seamless loop; the duplicate
 * is hidden from assistive technology. Pauses on hover and for reduced motion.
 */
export function Marquee({
  items,
  className,
  duration = 60,
  separator = "▲",
}: {
  items: string[];
  className?: string;
  duration?: number;
  separator?: string;
}) {
  const row = (hidden?: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <li key={`${item}-${i}`} className="flex items-center whitespace-nowrap">
          <span className="px-6 md:px-10">{item}</span>
          <span className="text-[0.4em] text-orange" aria-hidden>
            {separator}
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className={cn("group relative flex overflow-hidden", className)}>
      <div
        className="flex w-max animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none"
        style={{ ["--marquee-duration" as string]: `${duration}s` }}
      >
        {row()}
        {row(true)}
      </div>
    </div>
  );
}
