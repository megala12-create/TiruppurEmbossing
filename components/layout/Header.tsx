"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { primaryNav, quoteCta } from "@/data/navigation";
import { cn } from "@/lib/cn";
import { LogoLockup } from "@/components/ui/Brand";
import { Button } from "@/components/ui/Button";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openedFor, setOpenedFor] = useState(pathname);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close the menu when the route changes (state derived during render).
  if (openedFor !== pathname) {
    setOpenedFor(pathname);
    if (menuOpen) setMenuOpen(false);
  }

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > 360 && y > lastY + 2);
      if (Math.abs(y - lastY) > 2) lastY = y;
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

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    toggleRef.current?.focus();
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color] duration-500 ease-[var(--ease-out-expo)] [view-transition-name:site-header]",
          scrolled && !menuOpen ? "border-b border-line/70 bg-ink/80 backdrop-blur-md" : "border-b border-transparent",
          hidden && !menuOpen && "-translate-y-full",
        )}
      >
        <div className="container-x flex h-[72px] items-center justify-between gap-6 lg:h-[88px]">
          <LogoLockup />

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1 xl:gap-3">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "t-label link-underline inline-flex py-2 px-2.5 transition-colors hover:text-bone xl:px-3",
                      isActive(item.href) ? "text-bone" : "text-mute",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden lg:block">
              <MagneticButton>
                <Button href={quoteCta.href} track="quote_cta_click" trackLabel="header">
                  {quoteCta.label}
                </Button>
              </MagneticButton>
            </div>

            <button
              ref={toggleRef}
              type="button"
              className="t-label flex min-h-12 items-center gap-3 border border-line px-4 transition-colors hover:border-bone lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span>{menuOpen ? "Close" : "Menu"}</span>
              <span className="relative block h-3 w-5" aria-hidden>
                <span
                  className={cn(
                    "absolute left-0 h-px w-full bg-current transition-transform duration-500 ease-[var(--ease-out-expo)]",
                    menuOpen ? "top-1.5 rotate-45" : "top-0",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 h-px w-full bg-current transition-transform duration-500 ease-[var(--ease-out-expo)]",
                    menuOpen ? "top-1.5 -rotate-45" : "top-3",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={closeMenu} isActive={isActive} />
    </>
  );
}
