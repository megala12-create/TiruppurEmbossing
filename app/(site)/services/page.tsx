import type { Metadata } from "next";
import { productionMachines } from "@/data/capabilities";
import { getService, numberWord, services, totalVariations } from "@/data/services";
import { buildMetadata } from "@/lib/seo";
import { getServices } from "@/lib/content/store";
import { PageTransition } from "@/components/motion/PageTransition";
import { CtaBand } from "@/components/sections/CtaBand";
import { ServiceGrid } from "@/components/services/ServiceGrid";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SplitText } from "@/components/ui/SplitText";

export const metadata: Metadata = buildMetadata({
  title: "Printing Services",
  description: `Explore ${services.length} textile printing services (emboss, silicone HD, HD, DTF, sublimation, screen, specialty, heat transfer, sticker, combination and placement printing) with ${totalVariations} variations.`,
  path: "/services",
});

export default async function ServicesPage() {
  const items = await getServices();
  return (
    <PageTransition>
      <section aria-labelledby="services-page-title" className="pt-28 lg:pt-36">
        <div className="container-x">
          <Breadcrumbs items={[{ name: "Services", path: "/services" }]} />
          <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-12">
              <p className="t-label mb-5 flex gap-3 text-mute animate-fade">
                <span className="text-bone">01</span> / Services
              </p>
              <SplitText
                as="h1"
                id="services-page-title"
                reveal="hero"
                text={`${numberWord(services.length)} print\ntechnologies.`}
                className="t-display"
              />
            </div>
            <div className="lg:col-span-4 lg:col-start-9 animate-fade [animation-delay:400ms]">
              <p className="t-lead text-mute">
                Emboss to sublimation, silicone to screen: every major textile printing process under one production
                ecosystem.
              </p>
            </div>
          </div>

          <dl className="mt-14 grid grid-cols-2 gap-px border-y border-line bg-line md:grid-cols-4">
            {[
              [String(services.length), "Categories"],
              [String(totalVariations), "Variations"],
              [String(productionMachines.length).padStart(2, "0"), "Production systems"],
              [String(getService("placement-printing")?.subServices.length ?? 0), "Placement options"],
            ].map(([v, l]) => (
              <div key={l} className="bg-ink py-6 md:px-6">
                <dt className="t-label text-mute">{l}</dt>
                <dd className="t-number mt-3 text-5xl">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-label="All services" className="section-y">
        <div className="container-x">
          <ServiceGrid items={items} />
        </div>
      </section>

      <CtaBand title="Not sure which process fits?" body="Share your design and fabric, and we'll recommend the right printing technique." />
    </PageTransition>
  );
}
