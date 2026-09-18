/**
 * Client FAQ - the 15 questions supplied by Tiruppur Embossing.
 *
 * IMPORTANT: answers must not be invented. Each entry has:
 *  - `answer`: the verified client answer. Leave `null` until confirmed.
 *  - `guidance`: an interim, non-committal response that routes the visitor
 *    to the right next step without stating unverified facts.
 *
 * To publish a verified answer, set `answer` (plain text, paragraphs split by
 * blank lines). Verified answers are automatically included in FAQPage JSON-LD.
 */

export type FaqGroup = "process" | "pricing" | "sampling" | "production" | "quality" | "artwork";

export type Faq = {
  id: string;
  question: string;
  group: FaqGroup;
  answer: string | null;
  guidance: string;
  next: "quote" | "contact";
};

export const faqGroups: Record<FaqGroup, string> = {
  process: "Process & fabric",
  pricing: "Pricing & quantity",
  sampling: "Sampling",
  production: "Production & delivery",
  quality: "Quality & compliance",
  artwork: "Artwork",
};

export const faqs: Faq[] = [
  {
    id: "which-process",
    question: "What printing process is suitable for my design?",
    group: "process",
    answer: null,
    guidance:
      "The right process depends on your artwork, fabric, the finish you want and your quantity. Share your design and requirements through a quote request and our team will review it and recommend suitable printing options.",
    next: "quote",
  },
  {
    id: "best-price",
    question: "What is the best price for this design?",
    group: "pricing",
    answer: null,
    guidance:
      "Pricing depends on the printing process, design complexity, print size, placement, fabric and quantity. Send your artwork and details through a quote request so the team can prepare a quotation for your specific job.",
    next: "quote",
  },
  {
    id: "moq",
    question: "What is your MOQ?",
    group: "pricing",
    answer: null,
    guidance:
      "Minimum order quantity can vary by printing process and job type. Include your expected quantity in a quote request and the team will confirm what is possible for your design.",
    next: "quote",
  },
  {
    id: "my-fabric",
    question: "Can you print this on my fabric?",
    group: "process",
    answer: null,
    guidance:
      "Suitability depends on fabric composition, design and production requirements. Share your fabric details (and a fabric sample where possible) so the team can review it for the process you have in mind.",
    next: "quote",
  },
  {
    id: "make-sample",
    question: "Can you make a sample?",
    group: "sampling",
    answer: null,
    guidance:
      "Tiruppur Embossing supports sampling as part of the production process. Select “Need sample? Yes” in the quote request and include your artwork and fabric details.",
    next: "quote",
  },
  {
    id: "sample-cost",
    question: "How much does the sample cost?",
    group: "sampling",
    answer: null,
    guidance:
      "Sample cost depends on the process and the design. The team will confirm sampling cost along with your quotation.",
    next: "quote",
  },
  {
    id: "sampling-time",
    question: "How long will sampling take?",
    group: "sampling",
    answer: null,
    guidance:
      "Sampling time depends on the process, design and whether moulds or screens need to be prepared. Share your target date in the quote request and the team will confirm a timeline.",
    next: "quote",
  },
  {
    id: "bulk-time",
    question: "How long will bulk production take?",
    group: "production",
    answer: null,
    guidance:
      "Bulk production timelines depend on quantity, process, design complexity and the current production schedule. Add your target delivery date to the quote request so it can be reviewed.",
    next: "quote",
  },
  {
    id: "rate-quantity",
    question: "What is the rate for my quantity?",
    group: "pricing",
    answer: null,
    guidance:
      "Rates are calculated per job based on quantity, process, print size and placement. Request a quote with your quantity and artwork to receive a rate for your order.",
    next: "quote",
  },
  {
    id: "match-reference",
    question: "Can you match this reference sample?",
    group: "quality",
    answer: null,
    guidance:
      "Upload photos of your reference sample with your enquiry. The team will review the finish, process and fabric to advise how closely it can be matched, usually confirmed through sampling.",
    next: "quote",
  },
  {
    id: "wash",
    question: "Will the print withstand washing?",
    group: "quality",
    answer: null,
    guidance:
      "Wash performance depends on the printing process, inks, fabric and garment care. Discuss your wash and care requirements with the team so the process can be planned and sampled accordingly.",
    next: "contact",
  },
  {
    id: "bulk-quantity",
    question: "Can you handle my bulk quantity?",
    group: "production",
    answer: null,
    guidance:
      "Share your total quantity, process and delivery date in a quote request. The team will review production planning for your order and confirm.",
    next: "quote",
  },
  {
    id: "artwork-files",
    question: "What artwork file do you need?",
    group: "artwork",
    answer: null,
    guidance:
      "Upload the artwork files you have when you request a quote. The team will check whether the files are production-ready for the selected process and let you know if anything else is needed.",
    next: "quote",
  },
  {
    id: "delivery-date",
    question: "Can you meet my delivery date?",
    group: "production",
    answer: null,
    guidance:
      "Add your target delivery date to the quote request. Feasibility depends on quantity, process, sampling approval and the production schedule, and will be confirmed by the team.",
    next: "quote",
  },
  {
    id: "compliance",
    question: "Can you provide compliance/certification documents?",
    group: "quality",
    answer: null,
    guidance:
      "Please contact the team directly with the specific compliance or certification documents your order requires.",
    next: "contact",
  },
];

export const verifiedFaqs = faqs.filter((f) => f.answer);
