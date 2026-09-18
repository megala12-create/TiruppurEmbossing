import type { Metadata } from "next";
import { numberWord, services } from "@/data/services";
import { site } from "@/data/site";
import { buildMetadata } from "@/lib/seo";
import { Hero } from "@/components/home/hero/Hero";
import { PageTransition } from "@/components/motion/PageTransition";
import { CapabilitiesPreview } from "@/components/sections/CapabilitiesPreview";
import { CtaBand } from "@/components/sections/CtaBand";
import { IntroStatement } from "@/components/sections/IntroStatement";
import { PortfolioPreview } from "@/components/sections/PortfolioPreview";
import { ProductionSection } from "@/components/sections/ProductionSection";
import { ServiceExperience } from "@/components/services/ServiceExperience";
import { Button } from "@/components/ui/Button";
import { Marquee } from "@/components/ui/Marquee";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  ...buildMetadata({
    title: `${site.name} | ${site.tagline}`,
    description:
      "Advanced textile printing technologies for brands, manufacturers and apparel businesses: emboss, silicone HD, HD, DTF, sublimation, screen, specialty, transfer and sticker printing in Tiruppur.",
    path: "/",
  }),
  title: { absolute: `${site.name} | ${site.tagline}` },
};

export default function HomePage() {
  const variations = services.flatMap((s) => s.subServices);

  return (
    <PageTransition>
      <Hero />
      <IntroStatement />

      <div className="border-y border-line py-6 md:py-8" aria-hidden>
        <Marquee
          items={variations}
          duration={140}
          className="font-display text-[clamp(1.6rem,3.6vw,3.4rem)] font-extrabold uppercase leading-none text-bone/90 [font-variation-settings:'wdth'_72]"
        />
      </div>

      <section aria-labelledby="services-title" className="section-y">
        <div className="container-x">
          <SectionHeading
            id="services-title"
            index="02"
            label="Services"
            accent="orange"
            title={`${numberWord(services.length)} technologies.\nOne production partner.`}
            intro="Explore each printing process: what it is, where it works best and the variations available."
            aside={
              <div className="mt-8">
                <Button href="/services" variant="outline">
                  All services
                </Button>
              </div>
            }
          />
          <div className="mt-16 lg:mt-24">
            <ServiceExperience />
          </div>
        </div>
      </section>

      <CapabilitiesPreview />
      <ProductionSection index="04" />
      <PortfolioPreview index="05" />
      <CtaBand index="06" />
    </PageTransition>
  );
}
