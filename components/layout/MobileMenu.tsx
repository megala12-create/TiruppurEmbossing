"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { primaryNav, quoteCta } from "@/data/navigation";
import { site, whatsappHref } from "@/data/site";
import { cn } from "@/lib/cn";
import { ColorBar } from "@/components/ui/Brand";
import { Button } from "@/components/ui/Button";
import { Mail, Phone, WhatsApp } from "@/components/ui/Icons";
import { getLenis } from "@/components/motion/lenis-store";

type Props = { open: boolean; onClose: () => void; isActive: (href: string) => boolean };

/** Full-screen mobile/tablet navigation overlay with large touch targets. */
export function MobileMenu({ open, onClose, isActive }: Props) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const lenis = getLenis();
    lenis?.stop();
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    // Wait until the panel is no longer visibility:hidden before moving focus into it.
    const focusTimer = window.setTimeout(
      () => panel.current?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true }),
      60,
    );

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !panel.current) return;
      // Keep focus inside the menu (header toggle remains reachable).
      const toggle = document.querySelector<HTMLElement>("[aria-controls='mobile-menu']");
      const focusables = [
        ...(toggle ? [toggle] : []),
        ...panel.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
      ];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prevOverflow;
      lenis?.start();
    };
  }, [open, onClose]);

  return (
    <div
      id="mobile-menu"
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      inert={!open}
      className={cn(
        "fixed inset-0 z-40 flex flex-col bg-ink pt-[72px] transition-[clip-path,visibility] duration-700 ease-[var(--ease-in-out-quart)] lg:hidden",
        open ? "visible [clip-path:inset(0_0_0_0)]" : "invisible [clip-path:inset(0_0_100%_0)]",
      )}
    >
      <div className="container-x flex flex-1 flex-col overflow-y-auto pb-8" data-lenis-prevent>
        <nav aria-label="Mobile" className="flex-1 pt-6">
          <ul>
            <li>
              <MenuLink href="/" index="00" label="Home" active={isActive("/")} open={open} i={0} />
            </li>
            {primaryNav.map((item, i) => (
              <li key={item.href}>
                <MenuLink
                  href={item.href}
                  index={item.index}
                  label={item.label}
                  description={item.description}
                  active={isActive(item.href)}
                  open={open}
                  i={i + 1}
                />
              </li>
            ))}
          </ul>
        </nav>

        <div
          className={cn(
            "mt-8 space-y-6 transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)]",
            open ? "translate-y-0 opacity-100 delay-300" : "translate-y-4 opacity-0",
          )}
        >
          <Button href={quoteCta.href} size="lg" className="w-full justify-between" track="quote_cta_click" trackLabel="mobile-menu">
            {quoteCta.label}
          </Button>
          <div className="grid grid-cols-3 gap-2">
            <QuickAction href={`tel:${site.contact.phones[0].e164}`} label="Call" icon={<Phone size={18} />} />
            <QuickAction href={whatsappHref()} label="WhatsApp" icon={<WhatsApp size={18} />} external />
            <QuickAction href={`mailto:${site.contact.email}`} label="Email" icon={<Mail size={18} />} />
          </div>
          <ColorBar />
        </div>
      </div>
    </div>
  );
}

function MenuLink({
  href,
  index,
  label,
  description,
  active,
  open,
  i,
}: {
  href: string;
  index: string;
  label: string;
  description?: string;
  active: boolean;
  open: boolean;
  i: number;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className="group flex min-h-16 items-center gap-4 border-b border-line py-3"
    >
      <span className="t-label w-7 text-mute">{index}</span>
      <span className="mask-line flex-1">
        <span
          className={cn(
            "block font-display text-[clamp(2rem,9vw,3.4rem)] font-extrabold uppercase leading-[0.95] [font-variation-settings:'wdth'_72] transition-[transform,color] duration-700 ease-[var(--ease-out-expo)] group-hover:text-teal-deep",
            active ? "text-red" : "text-bone",
            open ? "translate-y-0" : "translate-y-full",
          )}
          style={{ transitionDelay: open ? `${120 + i * 45}ms` : "0ms" }}
        >
          {label}
        </span>
      </span>
      {description && <span className="hidden text-right text-sm text-mute sm:block">{description}</span>}
    </Link>
  );
}

function QuickAction({ href, label, icon, external }: { href: string; label: string; icon: React.ReactNode; external?: boolean }) {
  return (
    <a
      href={href}
      {...(external && { target: "_blank", rel: "noopener noreferrer" })}
      className="t-label flex min-h-14 flex-col items-center justify-center gap-1.5 border border-line text-[0.65rem] transition-colors hover:border-bone"
    >
      {icon}
      {label}
    </a>
  );
}
