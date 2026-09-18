"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getLenis, prefersReducedMotion, setLenis } from "./lenis-store";

/**
 * Lenis smooth scrolling for wheel/trackpad input.
 * - Native touch scrolling is preserved (syncTouch off).
 * - Disabled entirely for prefers-reduced-motion.
 * - Loaded after hydration so it never blocks rendering.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let destroyed = false;
    let lenis: import("lenis").default | null = null;

    import("lenis").then(({ default: Lenis }) => {
      if (destroyed) return;
      lenis = new Lenis({
        autoRaf: true,
        lerp: 0.11,
        anchors: { offset: -96 },
        allowNestedScroll: true,
        prevent: (node) => Boolean(node.closest?.("[data-lenis-prevent], dialog")),
      });
      setLenis(lenis);
    });

    return () => {
      destroyed = true;
      lenis?.destroy();
      setLenis(null);
    };
  }, []);

  // After client navigation the router sets the scroll position natively;
  // sync Lenis to it so an in-flight smooth scroll can't pull the page back.
  useEffect(() => {
    const lenis = getLenis();
    if (!lenis) return;
    const id = requestAnimationFrame(() => {
      lenis.scrollTo(window.scrollY, { immediate: true, force: true });
      lenis.resize();
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
