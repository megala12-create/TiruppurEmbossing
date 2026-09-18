"use client";

import { useEffect, useState, type FormEvent } from "react";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { normalizeContact, validateContact, type ContactFields, type FieldErrors } from "@/lib/forms/schema";
import { submitForm } from "@/lib/forms/submit";
import { Button } from "@/components/ui/Button";
import { Field, Honeypot, describedBy, inputClass } from "./Field";
import { SubmissionError, SubmissionSuccess } from "./SubmissionStatus";

const EMPTY: ContactFields = { name: "", phone: "", email: "", message: "" };

type Status = { state: "idle" } | { state: "submitting" } | { state: "success"; reference: string } | { state: "error"; message: string };

export function ContactForm() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<FieldErrors<keyof ContactFields>>({});
  const [status, setStatus] = useState<Status>({ state: "idle" });

  useEffect(() => {
    if (status.state === "success" || status.state === "error") {
      document.querySelector<HTMLElement>("[data-status-panel]")?.focus();
    }
  }, [status.state]);

  const set = (key: keyof ContactFields, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const clean = normalizeContact(values);
    const found = validateContact(clean);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(`contact-${first}`)?.focus();
      return;
    }
    const data = new FormData();
    Object.entries(clean).forEach(([k, v]) => data.set(k, v));
    data.set("website", (document.querySelector<HTMLInputElement>("#contact-form [name=website]")?.value ?? ""));
    setStatus({ state: "submitting" });
    const result = await submitForm("/api/contact", data);
    if (result.ok) {
      track("contact_form_submit");
      setStatus({ state: "success", reference: result.reference });
    } else {
      if (result.fieldErrors) setErrors(result.fieldErrors);
      setStatus({ state: "error", message: result.message });
    }
  };

  if (status.state === "success") {
    return (
      <SubmissionSuccess
        reference={status.reference}
        title="Message received."
        body="Thank you for getting in touch. The team will reply using the contact details you shared."
        onReset={() => {
          setValues(EMPTY);
          setStatus({ state: "idle" });
        }}
      />
    );
  }

  return (
    <form id="contact-form" onSubmit={onSubmit} noValidate className="relative space-y-8">
      <Honeypot />
      <Field id="contact-name" label="Name" required error={errors.name}>
        <input
          id="contact-name"
          autoComplete="name"
          className={inputClass}
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={describedBy("contact-name", errors.name)}
        />
      </Field>
      <div className="grid gap-8 sm:grid-cols-2">
        <Field id="contact-phone" label="Phone / WhatsApp" error={errors.phone} hint="Phone or email is required.">
          <input
            id="contact-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className={inputClass}
            value={values.phone}
            onChange={(e) => set("phone", e.target.value)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={describedBy("contact-phone", errors.phone, "Phone or email is required.")}
          />
        </Field>
        <Field id="contact-email" label="Email" error={errors.email}>
          <input
            id="contact-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            className={inputClass}
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy("contact-email", errors.email)}
          />
        </Field>
      </div>
      <Field id="contact-message" label="Message" required error={errors.message}>
        <textarea
          id="contact-message"
          rows={5}
          className={cn(inputClass, "min-h-36 resize-y")}
          value={values.message}
          onChange={(e) => set("message", e.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={describedBy("contact-message", errors.message)}
        />
      </Field>

      {status.state === "error" && (
        <SubmissionError
          message={status.message}
          whatsappMessage={`Hello Tiruppur Embossing,\n${values.message}\n- ${values.name}`}
        />
      )}

      <Button type="submit" size="lg" disabled={status.state === "submitting"}>
        {status.state === "submitting" ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}
