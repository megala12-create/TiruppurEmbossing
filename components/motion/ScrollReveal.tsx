"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { onLenis, prefersReducedMotion } from "./lenis-store";

/**
 * Global scroll choreography (GSAP + ScrollTrigger), driven by data attributes
 * so page and section components can stay Server Components:
 *
 *   data-reveal="words"   masked word rise (SplitText output)
 *   data-reveal="fade"    fade + lift
 *   data-reveal="stagger" children fade + lift in sequence
 *   data-reveal="clip"    clip-path image/media reveal with inner scale
 *   data-reveal="draw"    SVG `.draw-path` stroke drawing
 *   data-count="11"       number counter
 *   data-parallax="-12"   scrubbed yPercent drift (desktop only)
 *
 * Only elements BELOW the fold at load are animated, so there is no flash of
 * hidden content and LCP is unaffected. GSAP is dynamically imported after
 * hydration and skipped for prefers-reduced-motion.
 */
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      let offScroll: (() => void) | undefined;
      const unsubscribe = onLenis((lenis) => {
        offScroll?.();
        offScroll = lenis?.on("scroll", ScrollTrigger.update);
      });
      const root = document.getElementById("main") ?? document.body;
      const vh = window.innerHeight;
      const belowFold = (el: Element) => el.getBoundingClientRect().top > vh * 0.9;
      const once = (trigger: Element, start = "top 88%") => ({ trigger, start, once: true });
      const all = <T extends Element = HTMLElement>(sel: string) => gsap.utils.toArray<T>(sel, root);

      const ctx = gsap.context(() => {
        all("[data-reveal='words']").forEach((el) => {
          if (!belowFold(el)) return;
          gsap.from(el.querySelectorAll("[data-word]"), {
            yPercent: 115,
            duration: 1.05,
            ease: "expo.out",
            stagger: 0.035,
            scrollTrigger: once(el),
          });
        });

        all("[data-reveal='fade']").forEach((el) => {
          if (!belowFold(el)) return;
          gsap.from(el, { autoAlpha: 0, y: 28, duration: 0.9, ease: "expo.out", scrollTrigger: once(el, "top 92%") });
        });

        all("[data-reveal='stagger']").forEach((el) => {
          const children = Array.from(el.children).filter(belowFold);
          if (!children.length) return;
          gsap.from(children, {
            autoAlpha: 0,
            y: 36,
            duration: 0.9,
            ease: "expo.out",
            stagger: 0.07,
            scrollTrigger: once(el, "top 90%"),
          });
        });

        all("[data-reveal='clip']").forEach((el) => {
          if (!belowFold(el)) return;
          const media = el.querySelector("img, canvas, svg");
          const tl = gsap.timeline({ scrollTrigger: once(el, "top 90%") });
          tl.fromTo(
            el,
            { clipPath: "inset(14% 8% 14% 8%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "expo.out" },
          );
          if (media) tl.from(media, { scale: 1.18, duration: 1.6, ease: "expo.out" }, 0);
        });

        all("[data-reveal='draw']").forEach((el) => {
          if (!belowFold(el)) return;
          gsap.from(el.querySelectorAll(".draw-path"), {
            strokeDashoffset: 1,
            duration: 1.6,
            ease: "power2.inOut",
            stagger: 0.06,
            scrollTrigger: once(el, "top 85%"),
          });
        });

        all("[data-count]").forEach((el) => {
          if (!belowFold(el)) return;
          const target = Number(el.dataset.count);
          if (!Number.isFinite(target)) return;
          const pad = el.textContent?.trim().length ?? 0;
          const state = { v: 0 };
          gsap.to(state, {
            v: target,
            duration: 1.6,
            ease: "power3.out",
            scrollTrigger: once(el, "top 92%"),
            onUpdate: () => {
              el.textContent = String(Math.round(state.v)).padStart(pad, "0");
            },
          });
        });

        const mm = gsap.matchMedia();
        mm.add("(min-width: 1024px)", () => {
          all("[data-parallax]").forEach((el) => {
            gsap.to(el, {
              yPercent: Number(el.dataset.parallax) || -10,
              ease: "none",
              scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true },
            });
          });
        });
      }, root);

      const refresh = () => ScrollTrigger.refresh();
      document.fonts?.ready.then(refresh);
      window.addEventListener("load", refresh, { once: true });

      cleanup = () => {
        unsubscribe();
        offScroll?.();
        window.removeEventListener("load", refresh);
        ctx.revert();
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [pathname]);

  return null;
}
