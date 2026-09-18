import Image from "next/image";
import Link from "next/link";
import { getMachines } from "@/lib/content/store";
import { getService } from "@/data/services";
import { MachineDiagram } from "./MachineDiagram";
import { HorizontalScroll } from "./HorizontalScroll";

/** Numbered production systems - pinned horizontal story on desktop, stacked on mobile. */
export async function MachineShowcase() {
  const productionMachines = await getMachines();
  return (
    <HorizontalScroll className="border-y border-line">
      <div
        data-panel
        className="flex flex-col justify-between gap-10 bg-ink p-6 md:col-span-2 md:p-10 lg:h-full lg:w-[min(46vw,640px)] lg:border-r lg:border-line lg:p-14 lg:pt-32"
      >
        <div>
          <p className="t-label mb-6 text-mute">Production machines</p>
          <h2 className="t-h2">
            {String(productionMachines.length).padStart(2, "0")} print
            <br />
            systems
          </h2>
        </div>
        <p className="max-w-sm text-mute">
          Each system is part of one production ecosystem, so a design can move from sampling to bulk, or combine
          techniques, without changing partners.
        </p>
        <p className="t-label hidden items-center gap-3 text-mute lg:flex" aria-hidden>
          Scroll
          <span className="h-px w-16 bg-orange" />
        </p>
      </div>

      {productionMachines.map((m) => (
        <article
          key={m.slug}
          data-panel
          aria-labelledby={`machine-${m.slug}`}
          className="grid gap-8 bg-ink p-6 md:p-10 lg:h-full lg:w-[min(80vw,1120px)] lg:grid-cols-12 lg:gap-10 lg:border-r lg:border-line lg:p-14 lg:pt-32"
        >
          <div className="flex flex-col lg:col-span-5">
            <span className="t-number text-[clamp(4.5rem,9vw,9rem)] text-line" aria-hidden>
              {m.number}
            </span>
            <h3 id={`machine-${m.slug}`} className="t-h2 mt-4 text-[clamp(2rem,4vw,4rem)]">
              {m.name}
            </h3>
            <p className="mt-5 max-w-md text-mute">{m.summary}</p>
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Technical characteristics">
              {m.labels.map((l) => (
                <li key={l} className="t-label border border-line px-2.5 py-1.5 text-[0.62rem] text-teal-light">
                  {l}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-8">
              <p className="t-label mb-3 text-mute">Used for</p>
              <ul className="flex flex-wrap gap-x-5 gap-y-2">
                {m.services.map((slug) => {
                  const s = getService(slug);
                  return s ? (
                    <li key={slug}>
                      <Link href={`/services/${slug}`} className="link-underline text-bone hover:text-teal-deep">
                        {s.shortTitle}
                      </Link>
                    </li>
                  ) : null;
                })}
              </ul>
            </div>
          </div>

          <figure className="lg:col-span-7">
            <div className="relative flex aspect-[4/3] items-center justify-center border border-dashed border-line bg-carbon lg:aspect-auto lg:h-[calc(100%-2.5rem)]">
              {m.photo ? (
                <Image src={m.photo.src} alt={m.photo.alt} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
              ) : (
                <MachineDiagram kind={m.diagram} className="w-[82%] max-w-[560px]" />
              )}
              <span className="t-label absolute left-3 top-3 text-[0.6rem] text-mute">Sys. {m.number}</span>
              <span className="absolute right-3 top-3 size-2 bg-teal" aria-hidden />
            </div>
            <figcaption className="t-label mt-3 text-[0.62rem] text-mute">
              {m.photo ? m.photo.alt : "Schematic illustration · machine photography pending from client"}
            </figcaption>
          </figure>
        </article>
      ))}
    </HorizontalScroll>
  );
}
