/**
 * Vendor-neutral analytics abstraction.
 *
 * Events are pushed to `window.dataLayer` (GA4 / GTM compatible) and also
 * dispatched as a `te:analytics` DOM event so any provider can subscribe later.
 * No vendor script is loaded here.
 */

export type AnalyticsEvent =
  | "quote_cta_click"
  | "whatsapp_click"
  | "phone_click"
  | "email_click"
  | "service_view"
  | "portfolio_interaction"
  | "quote_form_start"
  | "quote_form_submit"
  | "contact_form_submit"
  | "file_upload";

export type AnalyticsParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function track(event: AnalyticsEvent, params: AnalyticsParams = {}) {
  if (typeof window === "undefined") return;
  const payload = { event, ...params };
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);
  window.dispatchEvent(new CustomEvent("te:analytics", { detail: payload }));
  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", event, params);
  }
}
