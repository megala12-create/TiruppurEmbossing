"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { getLenis, onLenis } from "@/components/motion/lenis-store";

/**
 * Desktop: vertical scroll drives a pinned horizontal track (GSAP ScrollTrigger).
 * Keyboard focus moving into an off-screen panel scrolls the page to that panel,
 * so the horizontal section never traps or hides focused content.
 * Mobile / tablet / reduced motion: panels stack vertically - no horizontal scrolling.
 */
export function HorizontalScroll({ children, className }: { children: ReactNode; className?: string }) {
  const section = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const trigger = useRef<{ start: number; end: number } | null>(null);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)");
    let cancelled = false;
    let revert: (() => void) | undefined;

    const setup = async () => {
      revert?.();
      revert = undefined;
      trigger.current = null;
      if (!mq.matches) {
        setPinned(false);
        return;
      }
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled || !section.current || !track.current) return;
      gsap.registerPlugin(ScrollTrigger);
      setPinned(true);

      // Wait for the pinned layout class to apply before measuring.
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      if (cancelled || !track.current) return;

      let offScroll: (() => void) | undefined;
      const unsubscribe = onLenis((lenis) => {
        offScroll?.();
        offScroll = lenis?.on("scroll", ScrollTrigger.update);
      });

      const ctx = gsap.context(() => {
        const distance = () => Math.max(0, track.current!.scrollWidth - window.innerWidth);
        const tween = gsap.to(track.current, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.5,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onRefresh: (self) => {
              trigger.current = { start: self.start, end: self.end };
            },
          },
        });
        const st = tween.scrollTrigger;
        if (st) trigger.current = { start: st.start, end: st.end };
      }, section);
      ScrollTrigger.refresh();

      revert = () => {
        unsubscribe();
        offScroll?.();
        ctx.revert();
      };
    };

    setup();
    mq.addEventListener("change", setup);
    return () => {
      cancelled = true;
      mq.removeEventListener("change", setup);
      revert?.();
    };
  }, []);

  const onFocus = (e: React.FocusEvent) => {
    if (!pinned || !trigger.current || !track.current) return;
    const panel = (e.target as HTMLElement).closest<HTMLElement>("[data-panel]");
    if (!panel) return;
    const max = track.current.scrollWidth - window.innerWidth;
    const progress = max > 0 ? Math.min(1, panel.offsetLeft / max) : 0;
    const y = trigger.current.start + (trigger.current.end - trigger.current.start) * progress;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo({ top: y });
  };

  return (
    <div ref={section} className={cn("relative", pinned && "h-svh overflow-clip", className)} onFocus={onFocus}>
      <div
        ref={track}
        className={cn(pinned ? "flex h-full w-max items-stretch will-change-transform" : "grid gap-px bg-line md:grid-cols-2")}
      >
        {children}
      </div>
    </div>
  );
}
