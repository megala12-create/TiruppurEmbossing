import Image from "next/image";
import Link from "next/link";
import { getServices } from "@/lib/content/store";
import { AccordionItem } from "@/components/ui/Accordion";
import { IllustrativeTag } from "@/components/ui/Brand";
import { ArrowRight } from "@/components/ui/Icons";
import { ServiceList, type ServiceListItem } from "./ServiceList";

/**
 * Service discovery: interactive editorial list on desktop, accessible
 * accordion on mobile/tablet. Only the fields the client list needs are
 * serialised to the browser.
 */
export async function ServiceExperience() {
  const services = await getServices();
  const items: ServiceListItem[] = services.map((s) => ({
    slug: s.slug,
    number: s.number,
    title: s.title,
    shortDescription: s.shortDescription,
    process: s.process,
    subServices: s.subServices,
    image: { src: s.image.src, alt: s.image.alt, illustrative: s.image.illustrative },
  }));

  return (
    <>
      <div className="hidden lg:block">
        <ServiceList items={items} />
      </div>

      <div className="border-t border-line lg:hidden">
        {services.map((s) => (
          <AccordionItem
            key={s.slug}
            name="services"
            summary={
              <span className="flex items-baseline gap-4">
                <span className="t-label w-6 shrink-0 text-mute">{s.number}</span>
                <span className="font-display text-[clamp(1.6rem,7vw,2.6rem)] font-extrabold uppercase leading-[0.95] [font-variation-settings:'wdth'_72]">
                  {s.shortTitle}
                </span>
              </span>
            }
          >
            <div className="grid gap-6 pl-10 sm:grid-cols-2">
              <div className="relative aspect-[4/3] overflow-hidden bg-graphite">
                <Image src={s.image.src} alt={s.image.alt} fill sizes="(min-width: 640px) 45vw, 90vw" className="object-cover" />
                {s.image.illustrative && <IllustrativeTag className="absolute bottom-2 left-2" />}
              </div>
              <div>
                <p className="text-mute">{s.shortDescription}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {s.subServices.map((sub) => (
                    <li key={sub} className="t-label border border-line px-2.5 py-1.5 text-[0.62rem]">
                      {sub}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/services/${s.slug}`}
                  className="t-label mt-6 inline-flex min-h-12 items-center gap-3 text-red"
                >
                  View {s.title}
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </AccordionItem>
        ))}
      </div>
    </>
  );
}
