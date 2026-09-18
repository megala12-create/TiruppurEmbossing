import Link from "next/link";
import { footerNav, legalNav } from "@/data/navigation";
import { services } from "@/data/services";
import { mapsHref, site, whatsappHref } from "@/data/site";
import { ColorBar, LogoLockup } from "@/components/ui/Brand";
import { Button } from "@/components/ui/Button";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-line bg-carbon" data-site-footer>
      <div className="container-x pt-20 md:pt-28">
        {/* Editorial sign-off */}
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-9">
            <p className="t-label mb-6 text-mute">{site.name}</p>
            <p className="t-display text-[clamp(2.6rem,9.6vw,10.5rem)]">
              <span className="block">Printing</span>
              <span className="block">
                Innovation <span className="text-mute">at</span>
              </span>
              <span className="block">
                Its <span className="text-red">Finest</span>
              </span>
            </p>
          </div>
          <div className="lg:col-span-3">
            <p className="mb-6 max-w-xs text-mute">
              One production partner across multiple printing techniques, built for sampling and production.
            </p>
            <Button href="/request-a-quote" size="lg" track="quote_cta_click" trackLabel="footer">
              Request a Quote
            </Button>
          </div>
        </div>

        <ColorBar className="mt-16 md:mt-24" labels />

        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <LogoLockup />
            <p className="mt-6 max-w-xs text-sm text-mute">
              Textile and garment printing services in {site.contact.location.locality}, {site.contact.location.city},{" "}
              {site.contact.location.region}.
            </p>
          </div>

          <nav aria-label="Footer" className="lg:col-span-2">
            <h2 className="t-label mb-5 text-mute">Navigate</h2>
            <ul className="space-y-2.5">
              {footerNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="link-underline text-bone/90 hover:text-bone">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Services" className="lg:col-span-4">
            <h2 className="t-label mb-5 text-mute">Services</h2>
            <ul className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`} className="link-underline text-bone/90 hover:text-bone">
                    {s.shortTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h2 className="t-label mb-5 text-mute">Contact</h2>
            <address className="space-y-4 not-italic">
              <ul className="space-y-2.5">
                {site.contact.phones.map((p) => (
                  <li key={p.e164}>
                    <a href={`tel:${p.e164}`} className="link-underline tabular-nums text-bone/90 hover:text-bone">
                      {p.display}
                    </a>
                  </li>
                ))}
              </ul>
              <p>
                <a href={`mailto:${site.contact.email}`} className="link-underline break-all text-bone/90 hover:text-bone">
                  {site.contact.email}
                </a>
              </p>
              <p>
                <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="link-underline text-bone/90 hover:text-bone">
                  WhatsApp
                </a>
              </p>
              <p>
                <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="link-underline text-bone/90 hover:text-bone">
                  {site.contact.location.locality}, {site.contact.location.city}
                </a>
              </p>
            </address>
            {site.social.length > 0 && (
              <ul className="mt-6 flex gap-4">
                {site.social.map((s) => (
                  <li key={s.href}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="t-label link-underline">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-line py-8 pb-10 text-sm text-mute md:flex-row md:items-center md:justify-between lg:pb-8">
          <p>
            © {year} {site.name}. All rights reserved.
          </p>
          <ul className="flex gap-6">
            {legalNav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link-underline hover:text-bone">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
