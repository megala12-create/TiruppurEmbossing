"use client";

import { useEffect } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics";

/**
 * Delegated click tracking so Server Components can be tracked without
 * becoming Client Components. Uses `data-track` when present, otherwise infers
 * phone / WhatsApp / email / quote-CTA clicks from the link href.
 */
export function AnalyticsListener() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("a, button");
      if (!el) return;
      const href = el.getAttribute("href") ?? "";
      const label = el.dataset.trackLabel ?? el.textContent?.trim().slice(0, 60);
      const page = window.location.pathname;

      let event = el.dataset.track as AnalyticsEvent | undefined;
      if (!event) {
        if (href.startsWith("tel:")) event = "phone_click";
        else if (href.includes("wa.me/")) event = "whatsapp_click";
        else if (href.startsWith("mailto:")) event = "email_click";
        else if (href.startsWith("/request-a-quote")) event = "quote_cta_click";
      }
      if (event) track(event, { label, href: href || undefined, page });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}

export function TrackView({ event, params }: { event: AnalyticsEvent; params?: Record<string, string> }) {
  const key = JSON.stringify(params);
  useEffect(() => {
    track(event, JSON.parse(key ?? "{}"));
  }, [event, key]);
  return null;
}
