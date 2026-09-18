"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { useMediaQuery } from "@/lib/hooks";

const HeroCanvas = dynamic(() => import("./HeroCanvas"), { ssr: false });

/**
 * Progressive enhancement for the hero: the server-rendered poster image is
 * always present; on capable desktops the WebGL material fades in over it.
 * Mobile, reduced-motion and no-WebGL visitors keep the static poster.
 */
export function HeroVisual() {
  const capable = useMediaQuery("(min-width: 1024px) and (prefers-reduced-motion: no-preference)");
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  // Scroll-linked layer readout (runs on all devices, no re-renders).
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>("[data-hero]");
    if (!hero) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const p = Math.min(0.999, Math.max(0, window.scrollY / (hero.offsetHeight * 0.85)));
      hero.dataset.layer = String(Math.floor(p * 5));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (!capable) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 transition-opacity duration-[1400ms] ease-out",
        ready ? "opacity-100" : "opacity-0",
      )}
      aria-hidden
    >
      <HeroCanvas onReady={onReady} />
    </div>
  );
}
