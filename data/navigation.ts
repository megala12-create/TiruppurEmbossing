export type NavItem = {
  label: string;
  href: string;
  /** Editorial index shown in overlay menus, e.g. "01" */
  index: string;
  description?: string;
};

/** Primary navigation (header + mobile menu). */
export const primaryNav: NavItem[] = [
  { index: "01", label: "Services", href: "/services", description: "Eleven printing technologies" },
  { index: "02", label: "Capabilities", href: "/capabilities", description: "Machines & production" },
  { index: "03", label: "Portfolio", href: "/portfolio", description: "Print & material studies" },
  { index: "04", label: "About", href: "/about", description: "Company & approach" },
  { index: "05", label: "FAQ", href: "/faq", description: "Common questions" },
  { index: "06", label: "Contact", href: "/contact", description: "Call, WhatsApp, visit" },
];

export const quoteCta = { label: "Request a Quote", mobileLabel: "Get a Quote", href: "/request-a-quote" };

export const footerNav: NavItem[] = [
  { index: "00", label: "Home", href: "/" },
  ...primaryNav,
  { index: "07", label: "Request a Quote", href: "/request-a-quote" },
];

export const legalNav = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Use", href: "/terms" },
];
