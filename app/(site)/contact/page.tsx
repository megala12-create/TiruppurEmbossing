import type { Metadata } from "next";
import { mapsHref, site, whatsappHref } from "@/data/site";
import { buildMetadata } from "@/lib/seo";
import { MapEmbed } from "@/components/contact/MapEmbed";
import { ContactForm } from "@/components/forms/ContactForm";
import { PageTransition } from "@/components/motion/PageTransition";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { ArrowUpRight, Mail, Phone, Pin, WhatsApp } from "@/components/ui/Icons";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SplitText } from "@/components/ui/SplitText";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description: `Contact Tiruppur Embossing in ${site.contact.location.locality}, ${site.contact.location.city}. Call, WhatsApp or email the team, or send an enquiry online.`,
  path: "/contact",
});

export default function ContactPage() {
  const { phones, email, location } = site.contact;

  const channels = [
    {
      icon: <Phone size={22} />,
      label: "Call",
      value: phones[0].display,
      href: `tel:${phones[0].e164}`,
      note: phones.slice(1).map((p) => p.display).join(" · "),
    },
    {
      icon: <WhatsApp size={22} />,
      label: "WhatsApp",
      value: site.contact.whatsapp.display,
      href: whatsappHref("Hello Tiruppur Embossing, I have a printing enquiry."),
      external: true,
      note: "Share artwork and photos directly",
    },
    { icon: <Mail size={22} />, label: "Email", value: email, href: `mailto:${email}`, note: "For files and detailed briefs" },
    {
      icon: <Pin size={22} />,
      label: "Location",
      value: `${location.locality}, ${location.city}`,
      href: mapsHref,
      external: true,
      note: `${location.region}, ${location.countryName}`,
    },
  ];

  return (
    <PageTransition>
      <section aria-labelledby="contact-title" className="pt-28 lg:pt-36">
        <div className="container-x">
          <Breadcrumbs items={[{ name: "Contact", path: "/contact" }]} />
          <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-12">
              <p className="t-label mb-5 flex gap-3 text-mute animate-fade">
                <span className="text-bone">06</span> / Contact
              </p>
              <SplitText as="h1" id="contact-title" reveal="hero" text={"Let's talk\nprint."} className="t-display" />
            </div>
            <div className="lg:col-span-4 lg:col-start-9 animate-fade [animation-delay:400ms]">
              <p className="t-lead text-mute">Call, WhatsApp or email the team, or send a message below.</p>
              <div className="mt-6">
                <Button href="/request-a-quote" track="quote_cta_click" trackLabel="contact-hero">
                  Request a Quote
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Contact channels" className="mt-14 md:mt-20">
        <div className="container-x">
          <ul className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
            {channels.map((c) => (
              <li key={c.label} className="bg-ink">
                <a
                  href={c.href}
                  {...(c.external && { target: "_blank", rel: "noopener noreferrer" })}
                  className="group flex h-full min-h-56 flex-col justify-between gap-8 p-6 transition-colors hover:bg-carbon md:p-8"
                >
                  <span className="flex items-center justify-between">
                    <span className="flex size-12 items-center justify-center border border-line text-red transition-colors group-hover:border-teal-deep">
                      {c.icon}
                    </span>
                    <ArrowUpRight size={20} className="text-mute transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-bone" />
                  </span>
                  <span>
                    <span className="t-label block text-mute">{c.label}</span>
                    <span className="mt-2 block text-lg font-medium tabular-nums [overflow-wrap:anywhere] xl:text-xl">{c.value}</span>
                    {c.note && <span className="mt-2 block text-sm text-mute">{c.note}</span>}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        {phones.length > 1 && (
          <div className="container-x mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-mute">
            <span className="t-label">All numbers:</span>
            {phones.map((p) => (
              <a key={p.e164} href={`tel:${p.e164}`} className="link-underline tabular-nums hover:text-bone">
                {p.display}
              </a>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="message-title" className="section-y">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionLabel index="01" label="Send a message" accent="teal" className="mb-6" />
            <h2 id="message-title" className="t-h2">
              Write
              <br />
              to us.
            </h2>
            <p className="mt-6 max-w-sm text-mute">
              For general questions. For pricing on a specific design, the quote form captures the details the team needs.
            </p>
            <div className="mt-10">
              <ContactForm />
            </div>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <SectionLabel index="02" label="Visit" accent="amber" className="mb-6" />
            <h2 className="t-h2">
              {location.locality},
              <br />
              {location.city}.
            </h2>
            <div className="mt-10">
              <MapEmbed />
            </div>
            <p className="mt-4 text-sm text-mute">
              Please call ahead before visiting so the right person is available to meet you.
            </p>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
