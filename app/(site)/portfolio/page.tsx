import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { categoryLabel, portfolioCategories, type PortfolioItem } from "@/data/portfolio";
import { getPortfolio } from "@/lib/content/store";
import { services } from "@/data/services";
import { buildMetadata } from "@/lib/seo";
import { PageTransition } from "@/components/motion/PageTransition";
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid";
import { CtaBand } from "@/components/sections/CtaBand";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SplitText } from "@/components/ui/SplitText";

export const metadata: Metadata = buildMetadata({
  title: "Portfolio",
  description:
    "A visual index of textile print finishes: emboss, silicone HD, HD, DTF, sublimation, screen, specialty, transfer, sticker and combination printing.",
  path: "/portfolio",
});

/** Server-rendered fallback (no JS / before hydration): the full, unfiltered gallery. */
function StaticGallery({ portfolio }: { portfolio: PortfolioItem[] }) {
  return (
    <div className="columns-1 gap-4 sm:columns-2 md:gap-6 lg:columns-3">
      {portfolio.map((item) => (
        <figure key={item.slug} className="mb-4 break-inside-avoid md:mb-6">
          <Image
            src={item.image.src}
            alt={item.image.alt}
            width={item.image.width}
            height={item.image.height}
            sizes="(min-width: 1024px) 31vw, (min-width: 640px) 48vw, 100vw"
            className="h-auto w-full bg-graphite"
          />
          <figcaption className="flex justify-between gap-4 pt-3">
            <span className="font-display text-lg font-bold uppercase">{item.title}</span>
            <span className="t-label text-mute">{categoryLabel(item.category)}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export default async function PortfolioPage() {
  const portfolio = await getPortfolio();
  const serviceTitles = Object.fromEntries(services.map((s) => [s.slug, s.title]));
  const hasIllustrative = portfolio.some((p) => p.illustrative);

  return (
    <PageTransition>
      <section aria-labelledby="portfolio-title" className="pt-28 lg:pt-36">
        <div className="container-x">
          <Breadcrumbs items={[{ name: "Portfolio", path: "/portfolio" }]} />
          <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-12">
              <p className="t-label mb-5 flex gap-3 text-mute animate-fade">
                <span className="text-bone">03</span> / Portfolio
              </p>
              <SplitText as="h1" id="portfolio-title" reveal="hero" text={"Surface,\nstudied."} className="t-display" />
            </div>
            <p className="t-lead text-mute lg:col-span-4 lg:col-start-9 animate-fade [animation-delay:400ms]">
              Texture, colour, gloss and depth, explored across every printing technique in the Tiruppur Embossing
              ecosystem.
            </p>
          </div>

          {hasIllustrative && (
            <div className="mt-12 flex gap-4 border-l-2 border-orange bg-carbon p-5 md:items-center md:p-6" role="note">
              <span className="t-label shrink-0 text-red">Note</span>
              <p className="text-sm text-bone/85">
                Client project photography is being prepared. The visuals below are illustrative, generated material
                studies of each process. They are not photographs of client work.
              </p>
            </div>
          )}
        </div>
      </section>

      <section aria-label="Gallery" className="pb-24 pt-12 md:pb-32 md:pt-16">
        <div className="container-x">
          <Suspense fallback={<StaticGallery portfolio={portfolio} />}>
            <PortfolioGrid items={portfolio} categories={portfolioCategories} serviceTitles={serviceTitles} />
          </Suspense>
        </div>
      </section>

      <CtaBand title="Seen a finish you like?" body="Tell us about your garment and we'll plan the process." />
    </PageTransition>
  );
}
