"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { useDesktopMotion } from "@/lib/hooks";
import { ArrowUpRight } from "@/components/ui/Icons";

export type ServiceListItem = {
  slug: string;
  number: string;
  title: string;
  shortDescription: string;
  process: string[];
  subServices: string[];
  image: { src: string; alt: string; illustrative: boolean };
};

/**
 * Desktop interactive service index (≥1024px).
 * - Numbered editorial rows; number stays fixed, title shifts.
 * - Active row expands to reveal description + variations.
 * - A cursor-following preview cross-fades between material visuals
 *   (fine pointers + motion allowed only; images load on first interaction).
 */
export function ServiceList({ items }: { items: ServiceListItem[] }) {
  const [active, setActive] = useState<number | null>(null);
  const [armed, setArmed] = useState(false);
  const previewEnabled = useDesktopMotion();
  const preview = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!previewEnabled || !armed) return;
    const el = preview.current;
    if (!el) return;
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2, tx: 0, ty: 0 };
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      pos.tx = e.clientX;
      pos.ty = e.clientY;
    };
    const tick = () => {
      pos.x += (pos.tx - pos.x) * 0.14;
      pos.y += (pos.ty - pos.y) * 0.14;
      const rot = Math.max(-6, Math.min(6, (pos.tx - pos.x) * 0.05));
      el.style.transform = `translate3d(${pos.x + 28}px, ${pos.y - 150}px, 0) rotate(${rot}deg)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [previewEnabled, armed]);

  return (
    <div className="relative">
      <ul
        className="border-t border-line"
        onPointerEnter={() => setArmed(true)}
        onPointerLeave={() => setActive(null)}
      >
        {items.map((s, i) => {
          const isActive = active === i;
          const dimmed = active !== null && !isActive;
          return (
            <li key={s.slug} className="border-b border-line">
              <Link
                href={`/services/${s.slug}`}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className="group grid grid-cols-12 items-start gap-6 py-6 outline-offset-[-2px] xl:py-7"
              >
                <span
                  className={cn(
                    "t-label col-span-1 pt-3 tabular-nums transition-colors duration-500",
                    isActive ? "text-red" : "text-mute",
                  )}
                >
                  {s.number}
                </span>

                <span className="col-span-7">
                  <span
                    className={cn(
                      "block font-display text-[clamp(2.4rem,4.4vw,4.75rem)] font-extrabold uppercase leading-[0.92] [font-variation-settings:'wdth'_70]",
                      "transition-[transform,color] duration-700 ease-[var(--ease-out-expo)]",
                      isActive ? "translate-x-6 text-bone" : dimmed ? "text-bone/30" : "text-bone",
                    )}
                  >
                    {s.title}
                  </span>
                  <span
                    className={cn(
                      "grid transition-[grid-template-rows,opacity] duration-700 ease-[var(--ease-out-expo)]",
                      isActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                    )}
                  >
                    <span className="overflow-hidden">
                      <span className="block translate-x-6 pt-5">
                        <span className="block max-w-xl text-mute">{s.shortDescription}</span>
                        <span className="mt-4 flex flex-wrap gap-2">
                          {s.subServices.map((sub) => (
                            <span key={sub} className="t-label border border-line px-2.5 py-1.5 text-[0.62rem] text-bone/80">
                              {sub}
                            </span>
                          ))}
                        </span>
                      </span>
                    </span>
                  </span>
                </span>

                <span
                  className={cn(
                    "t-label col-span-3 pt-3 text-right transition-colors duration-500",
                    isActive ? "text-bone" : "text-mute",
                  )}
                >
                  {s.process.join(" · ")}
                </span>

                <span className="col-span-1 flex justify-end pt-1.5">
                  <span
                    className={cn(
                      "flex size-11 items-center justify-center border transition-all duration-500 ease-[var(--ease-out-expo)]",
                      isActive ? "rotate-45 border-teal-deep bg-teal-deep text-white" : "border-line text-bone",
                    )}
                    aria-hidden
                  >
                    <ArrowUpRight size={18} className="-rotate-45" />
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {previewEnabled && armed && (
        <div
          ref={preview}
          aria-hidden
          className="pointer-events-none fixed left-0 top-0 z-30 hidden h-[240px] w-[320px] lg:block"
        >
          <div
            className={cn(
              "relative size-full overflow-hidden bg-graphite shadow-2xl shadow-black/20 transition-[clip-path] duration-700 ease-[var(--ease-out-expo)]",
              active !== null ? "[clip-path:inset(0_0_0_0)]" : "[clip-path:inset(50%_50%_50%_50%)]",
            )}
          >
            {items.map((s, i) => (
              <Image
                key={s.slug}
                src={s.image.src}
                alt=""
                fill
                sizes="320px"
                className={cn(
                  "object-cover transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)]",
                  active === i ? "scale-100 opacity-100" : "scale-110 opacity-0",
                )}
              />
            ))}
            {active !== null && items[active]?.image.illustrative && (
              <span className="t-label absolute bottom-2 left-2 bg-ink/80 px-2 py-1 text-[0.55rem] text-bone">
                Illustrative
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
