import { getImageProps } from "next/image";
import { site } from "@/data/site";
import { services } from "@/data/services";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { SplitText } from "@/components/ui/SplitText";
import { RegMark } from "@/components/ui/Brand";
import { HeroVisual } from "./HeroVisual";

const layers = ["Woven base", "Emboss relief", "Ink layer", "Silicone gloss", "Transfer film"];

function HeroPoster() {
  const common = { alt: "", sizes: "100vw", quality: 75 };
  const {
    props: { srcSet: desktop },
  } = getImageProps({ ...common, src: "/assets/hero/material-poster-light.webp", width: 1600, height: 1000 });
  const {
    props: { srcSet: mobile, ...rest },
  } = getImageProps({ ...common, src: "/assets/hero/material-poster-light-mobile.webp", width: 900, height: 1200 });

  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={desktop} />
      <source media="(max-width: 767px)" srcSet={mobile} />
      <img
        {...rest}
        alt=""
        fetchPriority="high"
        loading="eager"
        className="absolute inset-0 size-full object-cover object-[70%_50%] opacity-80 md:object-center"
      />
    </picture>
  );
}

export function Hero() {
  return (
    <section
      data-hero
      data-layer="0"
      aria-labelledby="hero-title"
      className="group/hero relative flex min-h-[100svh] flex-col overflow-hidden bg-ink"
    >
      <div className="absolute inset-0" aria-hidden>
        <HeroPoster />
        <HeroVisual />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.94)_0%,rgba(255,255,255,.6)_45%,rgba(255,255,255,0)_75%)] max-lg:bg-[linear-gradient(180deg,rgba(255,255,255,.3)_0%,rgba(255,255,255,.65)_45%,rgba(255,255,255,.96)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />
      </div>

      {/* Technical frame */}
      <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden>
        <RegMark className="absolute left-[clamp(1rem,3.6vw,3.5rem)] top-28 opacity-60" />
        <RegMark className="absolute right-[clamp(1rem,3.6vw,3.5rem)] top-28 opacity-60" />
      </div>

      <div className="container-x relative flex flex-1 flex-col justify-end pb-8 pt-32 md:pb-10 lg:pt-28">
        <p className="t-label mb-6 flex items-center gap-3 text-mute animate-fade [animation-delay:200ms]">
          <span className="text-bone">00</span>
          <span aria-hidden>/</span>
          Textile printing · {site.contact.location.city}, {site.contact.location.region}
        </p>

        <div data-parallax="-14">
          <SplitText
            as="h1"
            id="hero-title"
            text={"Printing\nInnovation\nat Its Finest"}
            reveal="hero"
            delay={120}
            className="t-display max-w-[14ch] md:text-[clamp(5rem,min(11.5vw,15svh),13rem)]"
            highlight={{ words: ["Finest"], className: "text-red" }}
          />
        </div>

        <div className="mt-8 grid gap-10 lg:mt-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7 xl:col-span-6">
            <p className="t-lead max-w-md text-bone/85 animate-fade [animation-delay:650ms]">
              Advanced textile printing technologies for brands, manufacturers and apparel businesses.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 animate-fade [animation-delay:800ms]">
              <MagneticButton>
                <Button href="/services" size="lg" variant="light">
                  Explore Services
                </Button>
              </MagneticButton>
              <Button href="/request-a-quote" size="lg" variant="outline" track="quote_cta_click" trackLabel="hero">
                Request a Quote
              </Button>
            </div>
          </div>

          {/* Scroll-linked material layer readout */}
          <div className="hidden bg-ink/70 px-5 py-4 backdrop-blur-md lg:col-span-4 lg:col-start-9 lg:block animate-fade [animation-delay:1000ms]" aria-hidden>
            <p className="t-label mb-3 text-mute">Surface layers</p>
            <ol className="border-t border-line">
              {layers.map((layer, i) => (
                <li
                  key={layer}
                  className={cn(
                    "t-label flex items-center justify-between border-b border-line py-2 text-mute transition-colors duration-500",
                    [
                      "group-data-[layer=0]/hero:text-bone",
                      "group-data-[layer=1]/hero:text-bone",
                      "group-data-[layer=2]/hero:text-bone",
                      "group-data-[layer=3]/hero:text-bone",
                      "group-data-[layer=4]/hero:text-bone",
                    ][i],
                  )}
                  data-i={i}
                >
                  <span>
                    <span className="mr-3 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    {layer}
                  </span>
                  <span
                    className={cn(
                      "size-1.5 bg-line transition-colors duration-500",
                      [
                        "group-data-[layer=0]/hero:bg-teal-light",
                        "group-data-[layer=1]/hero:bg-teal-light",
                        "group-data-[layer=2]/hero:bg-orange",
                        "group-data-[layer=3]/hero:bg-orange",
                        "group-data-[layer=4]/hero:bg-red",
                      ][i],
                    )}
                  />
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-10 flex items-end justify-between gap-6 border-t border-line pt-5 animate-fade [animation-delay:1100ms] lg:mt-6">
          <p className="t-label text-mute">
            <span className="text-bone">{String(services.length).padStart(2, "0")}</span> printing technologies
            <span className="hidden sm:inline"> · one production partner</span>
          </p>
          <a href="#intro" className="t-label group/scroll flex shrink-0 items-center gap-3 whitespace-nowrap text-bone">
            Scroll to explore
            <span className="relative block h-10 w-px overflow-hidden bg-line" aria-hidden>
              <span className="absolute inset-x-0 top-0 h-1/2 bg-orange motion-safe:animate-[scroll-cue_1.8s_var(--ease-in-out-quart)_infinite]" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
