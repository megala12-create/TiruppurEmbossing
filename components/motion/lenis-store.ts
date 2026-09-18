import type Lenis from "lenis";

/** Module-level handle so menus/overlays can pause smooth scrolling. */
let instance: Lenis | null = null;
const listeners = new Set<(l: Lenis | null) => void>();

export const getLenis = () => instance;

export function setLenis(l: Lenis | null) {
  instance = l;
  listeners.forEach((fn) => fn(l));
}

export function onLenis(fn: (l: Lenis | null) => void) {
  listeners.add(fn);
  fn(instance);
  return () => listeners.delete(fn);
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
