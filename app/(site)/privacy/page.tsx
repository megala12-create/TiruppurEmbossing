import type { Metadata } from "next";
import { site } from "@/data/site";
import { buildMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/sections/LegalPage";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: `How ${site.name} handles information submitted through this website.`,
  path: "/privacy",
  noIndex: true,
});

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" path="/privacy">
      <h2>Information you submit</h2>
      <p>
        When you send an enquiry or request a quote, we receive the details you enter, such as your name, company, phone
        number, email address, job requirements and any files you attach, so that we can respond to your enquiry.
      </p>
      <h2>How it is used</h2>
      <p>Information is used to review your requirements, prepare quotations and contact you about your enquiry.</p>
      <h2>Analytics</h2>
      <p>
        This website may use analytics to understand how pages are used. {/* TODO(client): name the provider once chosen. */}
      </p>
      <h2>Contact</h2>
      <p>
        For privacy questions, email <a className="link-underline text-red" href={`mailto:${site.contact.email}`}>{site.contact.email}</a>.
      </p>
    </LegalPage>
  );
}
