import type { Metadata } from "next";
import { site } from "@/data/site";
import { buildMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/sections/LegalPage";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Use",
  description: `Terms for using the ${site.name} website.`,
  path: "/terms",
  noIndex: true,
});

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" path="/terms">
      <h2>Website information</h2>
      <p>
        Content on this website describes the printing services offered by {site.name}. Suitability of any printing process
        depends on fabric composition, design and production requirements, and is confirmed for each job.
      </p>
      <h2>Quotations</h2>
      <p>Submitting an enquiry does not create an order. Pricing, timelines and terms are confirmed in a quotation.</p>
      <h2>Visual content</h2>
      <p>
        Some visuals on this website are illustrative material studies and are labelled as such. They do not represent
        specific client work.
      </p>
    </LegalPage>
  );
}
