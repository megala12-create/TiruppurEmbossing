import { ViewTransition, type ReactNode } from "react";

/**
 * Page-level transition using React's <ViewTransition> + the browser View
 * Transitions API. Zero client JavaScript; unsupported browsers simply swap
 * pages. Animations are defined in globals.css (.page-in / .page-out) and
 * disabled for prefers-reduced-motion.
 *
 * Wrap each page's content (not the layout - layouts persist across navigations).
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page-in" exit="page-out" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
