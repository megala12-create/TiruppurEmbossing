import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { services } from "@/data/services";
import { getServices } from "@/lib/content/store";
import { site } from "@/data/site";
import { buildMetadata } from "@/lib/seo";
import { PageTransition } from "@/components/motion/PageTransition";
import { CtaBand } from "@/components/sections/CtaBand";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { IllustrativeTag } from "@/components/ui/Brand";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SplitText } from "@/components/ui/SplitText";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    "Tiruppur Embossing is a textile printing and production partner in Ammapalayam, Tiruppur, bringing multiple printing technologies, sampling and bulk production support under one roof.",
  path: "/about",
});

const pillars = [
  {
    title: "Printing expertise",
    body: "Focused on textile and garment printing, from tactile emboss and raised silicone to full-colour digital transfers and sublimation.",
  },
  {
    title: "Multiple technologies",
    body: "Emboss, silicone HD, HD, DTF, sublimation, screen, specialty, transfer and sticker printing, combined when a design needs more than one.",
  },
  {
    title: "Production infrastructure",
    body: "Print systems supported by equipment for screen preparation, film finishing, curing, pressing and inspection.",
    link: { href: "/capabilities", label: "See capabilities" },
  },
  {
    title: "Quality commitment",
    body: "Quality assurance is built into the way work moves: sample approval sets the reference, and prints are checked before dispatch.",
  },
  {
    title: "Sampling to bulk",
    body: "Support for both sampling and bulk requirements, so an approved design can move into production with a clear reference.",
  },
  {
    title: "Focus on innovation",
    body: "Exploring new finishes, combinations and value-added techniques that give garments a distinctive surface.",
  },
];

export default async function AboutPage() {
  const merged = await getServices();
  const visuals = ["emboss-printing", "silicone-hd-printing", "sublimation-printing"]
    .map((slug) => merged.find((s) => s.slug === slug))
    .filter((s) => s !== undefined);

  return (
    <PageTransition>
      <section aria-labelledby="about-title" className="pt-28 lg:pt-36">
        <div className="container-x">
          <Breadcrumbs items={[{ name: "About", path: "/about" }]} />
          <p className="t-label mt-10 flex gap-3 text-mute animate-fade lg:mt-14">
            <span className="text-bone">04</span> / About
          </p>
          <SplitText
            as="h1"
            id="about-title"
            reveal="hero"
            text={"A printing\ntechnology partner,\nrooted in Tiruppur."}
            className="t-h1 mt-6 max-w-[16ch]"
            highlight={{ words: ["Tiruppur."], className: "text-red" }}
          />
        </div>

        <div className="container-x mt-14">
          <div className="grid gap-px bg-line md:grid-cols-3">
            {visuals.map((s, i) => (
              <div key={s.slug} className="relative aspect-[4/3] overflow-hidden bg-graphite md:aspect-[3/4]" data-reveal="clip">
                <Image
                  src={s.image.src}
                  alt={s.image.alt}
                  fill
                  preload={i === 0}
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover"
                />
                {s.image.illustrative && <IllustrativeTag className="absolute bottom-3 left-3" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="ecosystem-heading" className="section-y">
        <div className="container-x grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionLabel index="01" label="The Tiruppur ecosystem" accent="maroon" />
          </div>
          <div className="lg:col-span-8">
            <h2 id="ecosystem-heading" className="t-statement text-[clamp(1.6rem,2.8vw,2.8rem)]" data-reveal="fade">
              Tiruppur is one of India&rsquo;s best-known knitwear and garment manufacturing centres. Tiruppur Embossing
              works inside that ecosystem, alongside the brands, manufacturers and apparel businesses that rely on print.
            </h2>
            <p className="t-lead mt-8 max-w-2xl text-mute" data-reveal="fade">
              Based in {site.contact.location.locality}, {site.contact.location.city}, the business is positioned as a
              one-point printing solution: a single production partner across multiple printing techniques, from first
              sample to production run.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="pillars-heading" className="border-t border-line bg-carbon section-y">
        <div className="container-x">
          <SectionLabel index="02" label="What defines us" accent="teal" className="mb-6" />
          <SplitText id="pillars-heading" as="h2" text={"One point.\nEvery print."} className="t-h1" />
          <ol className="mt-16 grid gap-px bg-line md:grid-cols-2 lg:grid-cols-3" data-reveal="stagger">
            {pillars.map((p, i) => (
              <li key={p.title} className="flex flex-col gap-10 bg-carbon p-6 md:p-10">
                <span className="t-number text-6xl text-line">{String(i + 1).padStart(2, "0")}</span>
                <div className="mt-auto">
                  <h3 className="font-display text-3xl font-extrabold uppercase leading-none [font-variation-settings:'wdth'_74]">
                    {p.title}
                  </h3>
                  <p className="mt-4 text-mute">{p.body}</p>
                  {p.link && (
                    <Link href={p.link.href} className="t-label link-underline mt-5 inline-block text-red">
                      {p.link.label}
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="tech-heading" className="section-y">
        <div className="container-x grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionLabel index="03" label="Technologies" accent="orange" className="mb-6" />
            <h2 id="tech-heading" className="t-h2">
              Under one
              <br />
              roof.
            </h2>
          </div>
          <ul className="border-t border-line lg:col-span-8">
            {services.map((s) => (
              <li key={s.slug} className="border-b border-line">
                <Link
                  href={`/services/${s.slug}`}
                  className="group flex min-h-16 items-baseline gap-6 py-4 transition-colors hover:text-teal-deep"
                >
                  <span className="t-label w-8 text-mute">{s.number}</span>
                  <span className="flex-1 font-display text-[clamp(1.4rem,2.6vw,2.3rem)] font-extrabold uppercase leading-none [font-variation-settings:'wdth'_74] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-2">
                    {s.title}
                  </span>
                  <span className="t-label hidden text-mute sm:inline">{s.subServices.length} variations</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="facts-heading" className="bg-paper text-bone section-y">
        <div className="container-x grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionLabel index="04" label="At a glance" accent="red" tone="light" className="mb-6" />
            <h2 id="facts-heading" className="t-h2">
              The
              <br />
              essentials.
            </h2>
          </div>
          <dl className="grid gap-px bg-paper-line sm:grid-cols-2 lg:col-span-8">
            {[
              ["Location", `${site.contact.location.locality}, ${site.contact.location.city}, ${site.contact.location.region}`],
              ["Focus", "Textile and garment printing"],
              ["Service categories", `${services.length} printing technologies`],
              ["Supports", "Sampling and bulk production"],
            ].map(([k, v]) => (
              <div key={k} className="bg-paper p-6 md:p-8">
                <dt className="t-label text-paper-mute">{k}</dt>
                <dd className="mt-3 text-xl font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <CtaBand title="Let's print something exceptional." body={site.tagline + "."} />
    </PageTransition>
  );
}
