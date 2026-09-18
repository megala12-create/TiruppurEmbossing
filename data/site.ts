/**
 * Core business information.
 *
 * Source: the current public website (tiruppurembossing.com) and the
 * client build specification. Every item marked `verified: false` MUST be
 * confirmed with the client before production deployment.
 */

export type ContactPhone = {
  label: string;
  display: string;
  /** E.164 format, used for tel: links */
  e164: string;
  verified: boolean;
};

export const site = {
  name: "Tiruppur Embossing",
  shortName: "TE",
  tagline: "Printing Innovation at Its Finest",
  description:
    "Tiruppur Embossing is a textile printing partner in Tiruppur offering emboss, silicone HD, high-density, DTF, sublimation, screen, specialty and transfer printing for brands, manufacturers and apparel businesses.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.tiruppurembossing.com").replace(/\/$/, ""),
  locale: "en_IN",

  contact: {
    // TODO(client): verify all phone numbers before launch.
    phones: [
      { label: "Primary", display: "+91 98403 37054", e164: "+919840337054", verified: false },
      { label: "Production desk", display: "+91 80150 25002", e164: "+918015025002", verified: false },
      { label: "Office", display: "+91 97892 68002", e164: "+919789268002", verified: false },
    ] satisfies ContactPhone[],
    // TODO(client): confirm which number is connected to WhatsApp Business.
    whatsapp: { display: "+91 98403 37054", number: "919840337054", verified: false },
    email: "tiruppurembossing@gmail.com",
    location: {
      locality: "Ammapalayam",
      city: "Tiruppur",
      region: "Tamil Nadu",
      country: "IN",
      countryName: "India",
      // TODO(client): add full street address and postal code once verified.
      mapQuery: "Ammapalayam, Tiruppur, Tamil Nadu",
    },
  },

  /**
   * Social profiles are only rendered when a verified URL is supplied.
   * The current site links Instagram and Facebook, but exact URLs are unverified.
   */
  social: [] as { label: string; href: string }[],
} as const;

export const whatsappHref = (message?: string) =>
  `https://wa.me/${site.contact.whatsapp.number}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

export const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  site.contact.location.mapQuery,
)}`;
