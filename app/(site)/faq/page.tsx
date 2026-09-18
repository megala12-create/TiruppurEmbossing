import type { Metadata } from "next";
import { faqGroups, faqs, verifiedFaqs } from "@/data/faqs";
import { faqJsonLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import { FaqExplorer } from "@/components/faq/FaqExplorer";
import { PageTransition } from "@/components/motion/PageTransition";
import { CtaBand } from "@/components/sections/CtaBand";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/ui/JsonLd";
import { SplitText } from "@/components/ui/SplitText";

export const metadata: Metadata = buildMetadata({
  title: "FAQ",
  description:
    "Answers to common questions about printing processes, fabrics, sampling, MOQ, pricing, artwork files, production timelines and delivery at Tiruppur Embossing.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <PageTransition>
      <JsonLd data={faqJsonLd(verifiedFaqs)} />
      <section aria-labelledby="faq-title" className="pt-28 lg:pt-36">
        <div className="container-x">
          <Breadcrumbs items={[{ name: "FAQ", path: "/faq" }]} />
          <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-12">
              <p className="t-label mb-5 flex gap-3 text-mute animate-fade">
                <span className="text-bone">05</span> / FAQ
              </p>
              <SplitText as="h1" id="faq-title" reveal="hero" text={"Questions,\nanswered."} className="t-display" />
            </div>
            <p className="t-lead text-mute lg:col-span-4 lg:col-start-9 animate-fade [animation-delay:400ms]">
              Most printing questions depend on your design, fabric and quantity. Here&rsquo;s where to start, and how to
              get a precise answer for your job.
            </p>
          </div>
        </div>
      </section>

      <section aria-label="Frequently asked questions" className="section-y">
        <div className="container-x">
          <FaqExplorer faqs={faqs} groups={faqGroups} />
        </div>
      </section>

      <CtaBand
        title="Need a specific answer?"
        body="Send your artwork and requirements and the team will review your job."
      />
    </PageTransition>
  );
}
