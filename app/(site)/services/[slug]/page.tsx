import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryLabel } from "@/data/portfolio";
import { services } from "@/data/services";
import { getPortfolio, getServiceBySlug, getServices } from "@/lib/content/store";
import { serviceJsonLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import { TrackView } from "@/components/motion/AnalyticsListener";
import { PageTransition } from "@/components/motion/PageTransition";
import { CtaBand } from "@/components/sections/CtaBand";
import { PlacementDiagram } from "@/components/services/PlacementDiagram";
import { ServiceCard } from "@/components/services/ServiceCard";
import { ServiceHero } from "@/components/services/ServiceHero";
import { ServiceNavigation } from "@/components/services/ServiceNavigation";
import { IllustrativeTag } from "@/components/ui/Brand";
import { JsonLd } from "@/components/ui/JsonLd";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SplitText } from "@/components/ui/SplitText";

// Unknown slugs render notFound(); on-demand params are required for admin-triggered regeneration.
export const dynamicParams = true;

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return {};
  return buildMetadata({
    title: service.title,
    description: `${service.shortDescription} Variations: ${service.subServices.join(", ")}.`.slice(0, 300),
    path: `/services/${service.slug}`,
    image: { url: service.image.src, width: service.image.width, height: service.image.height, alt: service.image.alt },
  });
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const all = await getServices();
  const service = all.find((s) => s.slug === slug);
  if (!service) notFound();

  const related = service.related.map((r) => all.find((s) => s.slug === r)).filter((s) => s !== undefined);
  const portfolio = await getPortfolio();
  const examples = service.portfolioCategory
    ? portfolio.filter((p) => p.category === service.portfolioCategory).slice(0, 3)
    : [];

  return (
    <PageTransition>
      <JsonLd data={serviceJsonLd(service)} />
      <TrackView event="service_view" params={{ service: service.slug }} />

      <ServiceHero service={service} />

      {/* What it is */}
      <section aria-labelledby="what-title" className="section-y">
        <div className="container-x grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <SectionLabel index="01" label="What it is" accent={service.accent} />
            <h2 id="what-title" className="sr-only">
              What is {service.title}?
            </h2>
          </div>
          <div className="lg:col-span-8 lg:col-start-5">
            <p className="t-statement text-[clamp(1.5rem,2.6vw,2.6rem)]" data-reveal="fade">
              {service.description[0]}
            </p>
            {service.description.slice(1).map((p) => (
              <p key={p.slice(0, 24)} className="t-lead mt-8 max-w-2xl text-mute" data-reveal="fade">
                {p}
              </p>
            ))}
            <ul className="mt-10 flex flex-wrap gap-2" aria-label="Process">
              {service.process.map((step, i) => (
                <li key={step} className="t-label flex items-center gap-2 border border-line px-3 py-2">
                  <span className="text-mute">{String(i + 1).padStart(2, "0")}</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Variations */}
      <section id="variations" aria-labelledby="variations-title" className="scroll-mt-24 border-t border-line bg-carbon section-y">
        <div className="container-x">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <SectionLabel index="02" label="Available variations" accent={service.accent} className="mb-6" />
              <SplitText id="variations-title" as="h2" text={`${service.subServices.length} ways to\napply ${service.shortTitle}.`} className="t-h2" />
            </div>
          </div>
          <ol className="mt-14 grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-3" data-reveal="stagger">
            {service.subServices.map((sub, i) => (
              <li key={sub} className="group flex min-h-40 flex-col justify-between gap-8 border-b border-r border-line bg-carbon p-6 transition-colors hover:bg-graphite md:p-8">
                <span className="t-label text-mute">
                  {service.number}.{String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-[clamp(1.6rem,2.6vw,2.5rem)] font-extrabold uppercase leading-[0.95] [font-variation-settings:'wdth'_74] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-2">
                  {sub}
                </span>
              </li>
            ))}
          </ol>

          {service.feature === "placement-diagram" && (
            <div className="mt-20 border-t border-line pt-16">
              <h3 className="t-h3 mb-10">Placement guide</h3>
              <PlacementDiagram placements={service.subServices} />
            </div>
          )}
        </div>
      </section>

      {/* Applications */}
      <section aria-labelledby="applications-title" className="section-y">
        <div className="container-x grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionLabel index="03" label="Suitable applications" accent={service.accent} className="mb-6" />
            <SplitText id="applications-title" as="h2" text="Where it works." className="t-h2" />
          </div>
          <ul className="border-t border-line lg:col-span-7 lg:col-start-6" data-reveal="stagger">
            {service.applications.map((a, i) => (
              <li key={a} className="flex items-baseline gap-6 border-b border-line py-5">
                <span className="t-label w-8 text-mute">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[clamp(1.15rem,1.8vw,1.5rem)]">{a}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Considerations */}
      <section aria-labelledby="considerations-title" className="bg-paper text-bone section-y">
        <div className="container-x">
          <SectionLabel index="04" label="Considerations" accent={service.accent} tone="light" className="mb-6" />
          <SplitText id="considerations-title" as="h2" text={"Plan the print\nbefore production."} className="t-h2 max-w-4xl" />
          <div className="mt-14 grid gap-px bg-paper-line md:grid-cols-2">
            {[
              { title: "Material & fabric", items: service.materialConsiderations },
              { title: "Production", items: service.productionConsiderations },
            ].map((block) => (
              <div key={block.title} className="bg-paper p-6 md:p-10" data-reveal="fade">
                <h3 className="t-label mb-6 text-paper-mute">{block.title}</h3>
                <ul className="space-y-4">
                  {block.items.map((item) => (
                    <li key={item} className="flex gap-4 text-lg leading-snug">
                      <span className="mt-2.5 size-1.5 shrink-0 bg-red" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual examples */}
      <section aria-labelledby="examples-title" className="section-y">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <SectionLabel index="05" label="Visual examples" accent={service.accent} className="mb-6" />
              <SplitText id="examples-title" as="h2" text="In material." className="t-h2" />
            </div>
            <Link
              href={service.portfolioCategory ? `/portfolio?category=${service.portfolioCategory}` : "/portfolio"}
              className="t-label link-underline text-bone"
            >
              View in portfolio
            </Link>
          </div>

          {examples.length > 0 ? (
            <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {examples.map((item) => (
                <li key={item.slug} className="group">
                  <Link href={`/portfolio?item=${item.slug}`} className="block">
                    <div className="relative aspect-[4/5] overflow-hidden bg-graphite" data-reveal="clip">
                      <Image
                        src={item.image.src}
                        alt={item.image.alt}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                      />
                      {item.illustrative && <IllustrativeTag className="absolute bottom-3 left-3" />}
                    </div>
                    <p className="mt-3 flex justify-between gap-4">
                      <span className="font-display text-lg font-bold uppercase [font-variation-settings:'wdth'_80]">{item.title}</span>
                      <span className="t-label text-mute">{categoryLabel(item.category)}</span>
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              <div className="relative aspect-[16/10] overflow-hidden bg-graphite" data-reveal="clip">
                <Image src={service.image.src} alt={service.image.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                {service.image.illustrative && <IllustrativeTag className="absolute bottom-3 left-3" />}
              </div>
              <div className="flex flex-col justify-center border border-dashed border-line p-8">
                <p className="t-h3">Project photography coming soon.</p>
                <p className="mt-3 text-mute">
                  Examples for {service.title.toLowerCase()} are being prepared. Ask the team for relevant samples.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Related */}
      <section aria-labelledby="related-title" className="border-t border-line section-y">
        <div className="container-x">
          <SectionLabel index="06" label="Related services" accent={service.accent} className="mb-6" />
          <SplitText id="related-title" as="h2" text="Pairs well with." className="t-h2" />
          <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <ServiceCard key={r.slug} service={r} />
            ))}
          </div>
        </div>
      </section>

      <ServiceNavigation slug={service.slug} />

      <CtaBand
        title="Have a design in mind?"
        body="Let's determine the right printing process."
        service={service.slug}
      />
    </PageTransition>
  );
}
