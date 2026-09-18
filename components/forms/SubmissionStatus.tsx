"use client";

import { site, whatsappHref } from "@/data/site";
import { Alert, Check, Mail, Phone, WhatsApp } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";

export function SubmissionSuccess({
  reference,
  title,
  body,
  onReset,
}: {
  reference: string;
  title: string;
  body: string;
  onReset: () => void;
}) {
  return (
    <div role="status" className="border border-line bg-carbon p-8 md:p-12" tabIndex={-1} data-status-panel>
      <span className="flex size-12 items-center justify-center bg-teal text-white">
        <Check size={22} />
      </span>
      <h2 className="t-h2 mt-8 text-[clamp(2rem,4vw,3.5rem)]">{title}</h2>
      <p className="mt-4 max-w-lg text-mute">{body}</p>
      <p className="t-label mt-6 text-mute">
        Reference <span className="ml-2 tabular-nums text-bone">{reference}</span>
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={onReset} variant="outline" icon={false}>
          Send another enquiry
        </Button>
        <Button href="/services" variant="ghost">
          Explore services
        </Button>
      </div>
    </div>
  );
}

/** Failure panel with direct contact alternatives - the user's input is preserved. */
export function SubmissionError({
  message,
  whatsappMessage,
  onRetry,
}: {
  message: string;
  whatsappMessage: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="border border-red/60 bg-red/5 p-6 md:p-8" tabIndex={-1} data-status-panel>
      <div className="flex items-start gap-4">
        <Alert size={22} className="mt-0.5 shrink-0 text-red" />
        <div>
          <p className="font-medium text-bone">Your enquiry was not sent.</p>
          <p className="mt-1 text-mute">{message}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-2 sm:grid-cols-3">
        <a
          href={whatsappHref(whatsappMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="t-label flex min-h-12 items-center justify-center gap-2 bg-teal-deep text-white hover:bg-bone"
        >
          <WhatsApp size={18} /> WhatsApp
        </a>
        <a
          href={`tel:${site.contact.phones[0].e164}`}
          className="t-label flex min-h-12 items-center justify-center gap-2 border border-line hover:border-bone"
        >
          <Phone size={18} /> Call
        </a>
        <a
          href={`mailto:${site.contact.email}?subject=${encodeURIComponent("Printing enquiry")}&body=${encodeURIComponent(whatsappMessage)}`}
          className="t-label flex min-h-12 items-center justify-center gap-2 border border-line hover:border-bone"
        >
          <Mail size={18} /> Email
        </a>
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className="t-label link-underline mt-5 text-bone">
          Try submitting again
        </button>
      )}
    </div>
  );
}
