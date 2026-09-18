import { site } from "@/data/site";
import type { ServiceCategory } from "@/data/services";
import type { Faq } from "@/data/faqs";
import { absoluteUrl } from "./seo";

const orgId = `${site.url}/#organization`;

/** Organization + LocalBusiness - only verified/public fields are included. */
export const organizationJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": ["Organization", "LocalBusiness"],
  "@id": orgId,
  name: site.name,
  slogan: site.tagline,
  description: site.description,
  url: site.url,
  logo: absoluteUrl("/assets/brand/logo-mark.png"),
  image: absoluteUrl("/assets/brand/logo-mark.png"),
  email: site.contact.email,
  telephone: site.contact.phones[0].e164,
  address: {
    "@type": "PostalAddress",
    addressLocality: `${site.contact.location.locality}, ${site.contact.location.city}`,
    addressRegion: site.contact.location.region,
    addressCountry: site.contact.location.country,
  },
  areaServed: "IN",
  ...(site.social.length > 0 && { sameAs: site.social.map((s) => s.href) }),
});

export const breadcrumbJsonLd = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
});

export const serviceJsonLd = (service: ServiceCategory) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  name: service.title,
  serviceType: service.title,
  description: service.shortDescription,
  url: absoluteUrl(`/services/${service.slug}`),
  provider: { "@id": orgId },
  areaServed: "IN",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: `${service.title} variations`,
    itemListElement: service.subServices.map((name) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name },
    })),
  },
});

/** FAQPage schema - only for answers verified by the client. */
export const faqJsonLd = (faqs: Faq[]) =>
  faqs.length === 0
    ? null
    : {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      };
