import Image from "next/image";
import type { ServiceCategory } from "@/data/services";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { IllustrativeTag } from "@/components/ui/Brand";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { SplitText } from "@/components/ui/SplitText";

const accentText = {
  teal: "text-teal-deep",
  red: "text-red",
  orange: "text-orange-deep",
  amber: "text-orange-deep",
  maroon: "text-maroon",
} as const;

export function ServiceHero({ service }: { service: ServiceCategory }) {
  return (
    <section aria-labelledby="service-title" className="pt-28 lg:pt-36">
      <div className="container-x">
        <Breadcrumbs
          items={[
            { name: "Services", path: "/services" },
            { name: service.shortTitle, path: `/services/${service.slug}` },
          ]}
        />

        <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-9">
            <p className="t-label mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-mute animate-fade">
              <span className={accentText[service.accent]}>Service {service.number}</span>
              <span aria-hidden>/</span>
              <span>{service.process.join(" · ")}</span>
            </p>
            <SplitText as="h1" id="service-title" text={service.title} reveal="hero" className="t-h1" />
          </div>
          <div className="hidden lg:col-span-3 lg:block" aria-hidden>
            <span className="t-number block text-[clamp(5rem,14vw,14rem)] text-line lg:text-right">{service.number}</span>
          </div>
        </div>

        <div className="mt-8 grid gap-8 border-t border-line pt-8 lg:grid-cols-12">
          <p className="t-statement text-[clamp(1.4rem,2.6vw,2.4rem)] text-bone/90 lg:col-span-7 animate-fade [animation-delay:300ms]">
            {service.tagline}
          </p>
          <div className="flex flex-wrap items-start gap-3 lg:col-span-5 lg:justify-end animate-fade [animation-delay:450ms]">
            <MagneticButton>
              <Button
                href={`/request-a-quote?service=${service.slug}`}
                size="lg"
                track="quote_cta_click"
                trackLabel={`service-hero:${service.slug}`}
              >
                Request a Quote
              </Button>
            </MagneticButton>
            <Button href="#variations" size="lg" variant="outline" icon={false}>
              {service.subServices.length} variations
            </Button>
          </div>
        </div>
      </div>

      <div className="container-x mt-12 lg:mt-16">
        <figure>
          <div className="relative aspect-[4/3] overflow-hidden bg-graphite sm:aspect-[16/9] lg:aspect-[21/9]">
            <Image
              src={service.image.src}
              alt={service.image.alt}
              fill
              preload
              sizes="(min-width: 1760px) 1650px, 100vw"
              className="object-cover animate-fade"
            />
            {service.image.illustrative && <IllustrativeTag className="absolute bottom-4 left-4" />}
          </div>
          <figcaption className="t-label mt-3 flex justify-between gap-4 text-mute">
            <span>{service.image.illustrative ? "Material study: generated, not client work" : service.image.alt}</span>
            <span className="hidden sm:inline">Fig. {service.number}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
