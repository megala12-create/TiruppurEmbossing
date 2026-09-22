import type { ReactNode } from "react";
import { organizationJsonLd } from "@/lib/jsonld";
import { AnalyticsListener } from "@/components/motion/AnalyticsListener";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { JsonLd } from "@/components/ui/JsonLd";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { StickyQuoteCta } from "./StickyQuoteCta";

/** Public-site chrome: header, footer, motion, analytics. Not used by /admin. */
export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="t-label fixed left-4 top-4 z-[80] -translate-y-24 bg-teal-deep px-4 py-3 text-white transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <ScrollProgress />
      <Header />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer />
      <StickyQuoteCta />
      <ChatWidget />
      <SmoothScroll />
      <ScrollReveal />
      <AnalyticsListener />
      <JsonLd data={organizationJsonLd()} />
    </>
  );
}
