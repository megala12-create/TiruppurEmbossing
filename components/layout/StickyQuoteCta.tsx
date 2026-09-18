"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { quoteCta } from "@/data/navigation";
import { whatsappHref } from "@/data/site";
import { cn } from "@/lib/cn";
import { ArrowRight, WhatsApp } from "@/components/ui/Icons";

const HIDDEN_ON = ["/request-a-quote", "/contact"];

/**
 * Mobile/tablet sticky CTA. Appears after the first viewport, hides when the
 * footer (with its own CTA) is visible so it never covers closing content.
 */
export function StickyQuoteCta() {
  const pathname = usePathname();
  const [pastHero, setPastHero] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const footer = document.querySelector("[data-site-footer]");
    const io = new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting), { rootMargin: "0px 0px -40px 0px" });
    if (footer) io.observe(footer);
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, [pathname]);

  const visible = pastHero && !footerVisible && !HIDDEN_ON.some((p) => pathname.startsWith(p));

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ink/90 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md transition-transform duration-500 ease-[var(--ease-out-expo)] lg:hidden",
        visible ? "translate-y-0" : "translate-y-full",
      )}
      inert={!visible}
    >
      <div className="flex gap-2">
        <Link
          href={quoteCta.href}
          className="t-label flex min-h-12 flex-1 items-center justify-between bg-red px-5 text-white"
          data-track="quote_cta_click"
          data-track-label="sticky-mobile"
        >
          {quoteCta.mobileLabel}
          <ArrowRight size={18} />
        </Link>
        <a
          href={whatsappHref("Hello Tiruppur Embossing, I have a printing enquiry.")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-12 w-14 items-center justify-center border border-line text-bone"
          aria-label="Chat on WhatsApp"
        >
          <WhatsApp size={22} />
        </a>
      </div>
    </div>
  );
}
