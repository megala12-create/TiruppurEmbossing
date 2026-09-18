import type { Metadata } from "next";
import { getService, services } from "@/data/services";
import { site, whatsappHref } from "@/data/site";
import { buildMetadata } from "@/lib/seo";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { PageTransition } from "@/components/motion/PageTransition";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Mail, Phone, WhatsApp } from "@/components/ui/Icons";
import { SplitText } from "@/components/ui/SplitText";

export const metadata: Metadata = buildMetadata({
  title: "Request a Quote",
  description:
    "Request a printing quote from Tiruppur Embossing. Share your artwork, fabric, quantity, placement and delivery date for emboss, silicone HD, DTF, sublimation, screen and specialty printing.",
  path: "/request-a-quote",
});

const nextSteps = [
  { title: "Review", body: "The team reviews your design, fabric and quantity." },
  { title: "Recommendation", body: "Suitable printing options are recommended for your job." },
  { title: "Quotation & sample", body: "You receive a quotation, with sampling where needed." },
];

export default function RequestQuotePage() {
  const serviceOptions = services.map((s) => ({ slug: s.slug, title: s.title, subServices: s.subServices }));
  const placements = getService("placement-printing")?.subServices ?? [];

  return (
    <PageTransition>
      <section aria-labelledby="quote-title" className="pt-28 lg:pt-36">
        <div className="container-x">
          <Breadcrumbs items={[{ name: "Request a Quote", path: "/request-a-quote" }]} />
          <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-12">
              <p className="t-label mb-5 flex gap-3 text-mute animate-fade">
                <span className="text-bone">07</span> / Request a Quote
              </p>
              <SplitText as="h1" id="quote-title" reveal="hero" text={"Tell us about\nthe print."} className="t-h1" />
            </div>
            <p className="t-lead text-mute lg:col-span-4 lg:col-start-9 animate-fade [animation-delay:400ms]">
              A few details about your design and garment is all it takes. Only three fields are required.
            </p>
          </div>
        </div>
      </section>

      <section aria-label="Quote form" className="section-y pt-14 md:pt-20">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <QuoteForm services={serviceOptions} placements={placements} />
          </div>

          <aside className="lg:col-span-3 lg:col-start-10" aria-label="What happens next">
            <div className="space-y-10 lg:sticky lg:top-28">
              <div>
                <h2 className="t-label mb-5 text-mute">What happens next</h2>
                <ol className="space-y-5 border-l border-line pl-5">
                  {nextSteps.map((s, i) => (
                    <li key={s.title} className="relative">
                      <span className="absolute -left-[25px] top-1.5 size-2 bg-orange" aria-hidden />
                      <p className="t-label text-bone">
                        {String(i + 1).padStart(2, "0")} · {s.title}
                      </p>
                      <p className="mt-1 text-sm text-mute">{s.body}</p>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="border-t border-line pt-8">
                <h2 className="t-label mb-5 text-mute">Prefer to talk?</h2>
                <ul className="space-y-2">
                  <li>
                    <a
                      href={whatsappHref("Hello Tiruppur Embossing, I'd like a quote.")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-12 items-center gap-3 border border-line px-4 transition-colors hover:border-bone"
                    >
                      <WhatsApp size={18} className="text-red" /> WhatsApp
                    </a>
                  </li>
                  <li>
                    <a
                      href={`tel:${site.contact.phones[0].e164}`}
                      className="flex min-h-12 items-center gap-3 border border-line px-4 tabular-nums transition-colors hover:border-bone"
                    >
                      <Phone size={18} className="text-red" /> {site.contact.phones[0].display}
                    </a>
                  </li>
                  <li>
                    <a
                      href={`mailto:${site.contact.email}`}
                      className="flex min-h-12 items-center gap-3 break-all border border-line px-4 text-sm transition-colors hover:border-bone"
                    >
                      <Mail size={18} className="shrink-0 text-red" /> {site.contact.email}
                    </a>
                  </li>
                </ul>
                <p className="mt-4 text-sm text-mute">Large artwork files can also be sent by email.</p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </PageTransition>
  );
}
