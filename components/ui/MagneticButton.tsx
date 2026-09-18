"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Desktop-only magnetic hover. Inactive for touch/coarse pointers and
 * reduced-motion users - the child renders as a normal element.
 */
export function MagneticButton({ children, strength = 0.28 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!mq.matches) return;

    let frame = 0;
    const set = (x: number, y: number) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      set((e.clientX - (r.left + r.width / 2)) * strength, (e.clientY - (r.top + r.height / 2)) * strength);
    };
    const onLeave = () => set(0, 0);

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [strength]);

  return (
    <div ref={ref} className="inline-flex transition-transform duration-500 ease-[var(--ease-out-expo)] will-change-transform">
      {children}
    </div>
  );
}
