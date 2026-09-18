import { whatsappHref } from "@/data/site";
import { Button } from "@/components/ui/Button";
import { WhatsApp } from "@/components/ui/Icons";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SplitText } from "@/components/ui/SplitText";

export function CtaBand({
  title = "Have a design in mind?",
  body = "Let's determine the right printing process.",
  service,
  index,
}: {
  title?: string;
  body?: string;
  service?: string;
  index?: string;
}) {
  return (
    <section aria-label="Request a quote" className="relative overflow-hidden border-t border-line bg-ink">
      <div className="container-x section-y relative z-10">
        <SectionLabel index={index} label="Start a project" accent="orange" className="mb-8" />
        <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <SplitText as="h2" text={title} className="t-h1" />
            <p className="t-statement mt-6 text-mute">{body}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:col-span-4 lg:flex-col lg:items-end">
            <MagneticButton>
              <Button
                href={service ? `/request-a-quote?service=${service}` : "/request-a-quote"}
                size="lg"
                track="quote_cta_click"
                trackLabel={service ? `cta-band:${service}` : "cta-band"}
              >
                Request a Quote
              </Button>
            </MagneticButton>
            <Button
              href={whatsappHref("Hello Tiruppur Embossing, I have a printing enquiry.")}
              external
              size="lg"
              variant="outline"
              icon={<WhatsApp size={18} />}
            >
              WhatsApp us
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
