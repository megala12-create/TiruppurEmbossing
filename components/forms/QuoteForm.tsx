"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import {
  ARTWORK_EXTENSIONS,
  REFERENCE_EXTENSIONS,
  SAMPLE_OPTIONS,
  UPLOAD_LIMITS,
  formatBytes,
  normalizeQuote,
  todayISO,
  validateQuote,
  type FieldErrors,
  type QuoteField,
  type QuoteFields,
} from "@/lib/forms/schema";
import { submitForm } from "@/lib/forms/submit";
import { Button } from "@/components/ui/Button";
import { Field, FieldError, Honeypot, describedBy, inputClass } from "./Field";
import { FileUpload } from "./FileUpload";
import { SubmissionError, SubmissionSuccess } from "./SubmissionStatus";

export type QuoteServiceOption = { slug: string; title: string; subServices: string[] };

const EMPTY: QuoteFields = {
  name: "",
  company: "",
  email: "",
  phone: "",
  service: "",
  subService: "",
  quantity: "",
  fabric: "",
  placement: [],
  deliveryDate: "",
  needSample: "",
  requirements: "",
};

type Status =
  | { state: "idle" }
  | { state: "submitting"; progress: number }
  | { state: "success"; reference: string }
  | { state: "error"; message: string };

export function QuoteForm({ services, placements }: { services: QuoteServiceOption[]; placements: string[] }) {
  const [values, setValues] = useState<QuoteFields>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors<QuoteField>>({});
  const [artwork, setArtwork] = useState<File[]>([]);
  const [reference, setReference] = useState<File[]>([]);
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const started = useRef(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Prefill service from ?service=slug (e.g. links from service pages).
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("service");
    if (slug && services.some((s) => s.slug === slug)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from the URL (external source)
      setValues((v) => ({ ...v, service: slug }));
    }
  }, [services]);

  useEffect(() => {
    if (status.state === "success" || status.state === "error") {
      document.querySelector<HTMLElement>("[data-status-panel]")?.focus();
    }
  }, [status.state]);

  const markStarted = () => {
    if (started.current) return;
    started.current = true;
    track("quote_form_start");
  };

  const set = <K extends keyof QuoteFields>(key: K, value: QuoteFields[K]) => {
    markStarted();
    setValues((v) => ({ ...v, [key]: value, ...(key === "service" ? { subService: "" } : {}) }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const selectedService = services.find((s) => s.slug === values.service);
  const totalBytes = [...artwork, ...reference].reduce((n, f) => n + f.size, 0);
  const submitting = status.state === "submitting";

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const clean = normalizeQuote(values as unknown as Record<string, unknown>);
    const found: FieldErrors<QuoteField> = validateQuote(clean, {
      serviceSlugs: services.map((s) => s.slug),
      subServicesFor: (slug) => services.find((s) => s.slug === slug)?.subServices ?? [],
      placements,
      today: todayISO(),
    });
    if (totalBytes > UPLOAD_LIMITS.maxTotalBytes) {
      found.artwork = `Total attachments exceed ${formatBytes(UPLOAD_LIMITS.maxTotalBytes)}. Please email large files instead.`;
    }
    setErrors(found);
    if (Object.values(found).some(Boolean)) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    const data = new FormData(formRef.current ?? undefined);
    // Controlled values are authoritative; files come from component state.
    Object.entries(clean).forEach(([k, v]) => {
      data.delete(k);
      if (Array.isArray(v)) v.forEach((item) => data.append(k, item));
      else data.set(k, v);
    });
    data.delete("artwork");
    data.delete("reference");
    artwork.forEach((f) => data.append("artwork", f, f.name));
    reference.forEach((f) => data.append("reference", f, f.name));

    setStatus({ state: "submitting", progress: 0 });
    const result = await submitForm("/api/quote", data, (p) => setStatus({ state: "submitting", progress: p }));

    if (result.ok) {
      track("quote_form_submit", { service: clean.service, files: artwork.length + reference.length });
      setStatus({ state: "success", reference: result.reference });
      return;
    }
    if (result.fieldErrors) setErrors(result.fieldErrors as FieldErrors<QuoteField>);
    setStatus({ state: "error", message: result.message });
  };

  const reset = () => {
    setValues(EMPTY);
    setArtwork([]);
    setReference([]);
    setErrors({});
    setStatus({ state: "idle" });
    started.current = false;
  };

  if (status.state === "success") {
    return (
      <SubmissionSuccess
        reference={status.reference}
        title="Enquiry received."
        body="Thank you. The Tiruppur Embossing team will review your design and requirements and contact you using the details you provided."
        onReset={reset}
      />
    );
  }

  const errorList = Object.entries(errors).filter(([, v]) => v) as [QuoteField, string][];
  const whatsappSummary = [
    "Hello Tiruppur Embossing, I'd like a quote.",
    values.name && `Name: ${values.name}`,
    values.company && `Company: ${values.company}`,
    selectedService && `Service: ${selectedService.title}${values.subService ? ` (${values.subService})` : ""}`,
    values.quantity && `Quantity: ${values.quantity}`,
    values.fabric && `Fabric: ${values.fabric}`,
    values.placement.length > 0 && `Placement: ${values.placement.join(", ")}`,
    values.deliveryDate && `Target date: ${values.deliveryDate}`,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="relative" aria-describedby="quote-required-note">
      <Honeypot />

      {errorList.length > 0 && (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="mb-10 border border-red/60 bg-red/5 p-6">
          <p className="font-medium">Please check {errorList.length === 1 ? "one field" : `${errorList.length} fields`}:</p>
          <ul className="mt-3 space-y-1 text-sm">
            {errorList.map(([field, message]) => (
              <li key={field}>
                <a href={`#quote-${field}`} className="link-underline text-red">
                  {message}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p id="quote-required-note" className="mb-10 text-sm text-mute">
        Fields marked <span className="text-red">*</span> are required. Everything else helps us quote accurately.
      </p>

      {/* 01 - Contact */}
      <FormStep index="01" title="About you">
        <div className="grid gap-8 md:grid-cols-2">
          <Field id="quote-name" label="Name" required error={errors.name}>
            <input
              id="quote-name"
              name="name"
              autoComplete="name"
              className={inputClass}
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={describedBy("quote-name", errors.name)}
              required
            />
          </Field>
          <Field id="quote-company" label="Company" error={errors.company}>
            <input
              id="quote-company"
              name="company"
              autoComplete="organization"
              className={inputClass}
              value={values.company}
              onChange={(e) => set("company", e.target.value)}
            />
          </Field>
          <Field id="quote-phone" label="Phone / WhatsApp" required error={errors.phone} hint="We'll usually reply here.">
            <input
              id="quote-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+91"
              className={inputClass}
              value={values.phone}
              onChange={(e) => set("phone", e.target.value)}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={describedBy("quote-phone", errors.phone, "We'll usually reply here.")}
              required
            />
          </Field>
          <Field id="quote-email" label="Email" error={errors.email}>
            <input
              id="quote-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              className={inputClass}
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={describedBy("quote-email", errors.email)}
            />
          </Field>
        </div>
      </FormStep>

      {/* 02 - The job */}
      <FormStep index="02" title="The print job">
        <div className="grid gap-8 md:grid-cols-2">
          <Field id="quote-service" label="Printing service" required error={errors.service}>
            <select
              id="quote-service"
              name="service"
              className={cn(inputClass, "appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2212%22%20height=%228%22%3E%3Cpath%20d=%22M1%201l5%205%205-5%22%20stroke=%22%23a3a09a%22%20fill=%22none%22/%3E%3C/svg%3E')] bg-[length:12px] bg-[right_0.25rem_center] bg-no-repeat pr-8 [&>option]:bg-carbon")}
              value={values.service}
              onChange={(e) => set("service", e.target.value)}
              aria-invalid={Boolean(errors.service)}
              aria-describedby={describedBy("quote-service", errors.service)}
              required
            >
              <option value="">Select a service</option>
              {services.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.title}
                </option>
              ))}
              <option value="not-sure">Not sure, recommend a process</option>
            </select>
          </Field>
          <Field
            id="quote-subService"
            label="Variation"
            error={errors.subService}
            hint={selectedService ? undefined : "Choose a service first."}
          >
            <select
              id="quote-subService"
              name="subService"
              className={cn(inputClass, "appearance-none pr-8 [&>option]:bg-carbon")}
              value={values.subService}
              onChange={(e) => set("subService", e.target.value)}
              disabled={!selectedService}
              aria-describedby={describedBy("quote-subService", errors.subService, selectedService ? undefined : "Choose a service first.")}
            >
              <option value="">{selectedService ? "Any / not sure" : "Select a service first"}</option>
              {selectedService?.subServices.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </Field>
          <Field id="quote-quantity" label="Quantity" hint="Approximate is fine, e.g. 500 pcs.">
            <input
              id="quote-quantity"
              name="quantity"
              className={inputClass}
              value={values.quantity}
              onChange={(e) => set("quantity", e.target.value)}
              aria-describedby="quote-quantity-hint"
            />
          </Field>
          <Field id="quote-fabric" label="Fabric / material" hint="e.g. 100% cotton single jersey, polyester.">
            <input
              id="quote-fabric"
              name="fabric"
              className={inputClass}
              value={values.fabric}
              onChange={(e) => set("fabric", e.target.value)}
              aria-describedby="quote-fabric-hint"
            />
          </Field>
          <Field id="quote-deliveryDate" label="Target delivery date" error={errors.deliveryDate}>
            <input
              id="quote-deliveryDate"
              name="deliveryDate"
              type="date"
              min={todayISO()}
              className={cn(inputClass)}
              value={values.deliveryDate}
              onChange={(e) => set("deliveryDate", e.target.value)}
              aria-invalid={Boolean(errors.deliveryDate)}
              aria-describedby={describedBy("quote-deliveryDate", errors.deliveryDate)}
            />
          </Field>

          <fieldset>
            <legend className="t-label mb-3 text-mute">
              Need a sample? <span className="normal-case tracking-normal text-mute">(optional)</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_OPTIONS.map((opt) => (
                <label key={opt} className="relative">
                  <input
                    type="radio"
                    name="needSample"
                    value={opt}
                    checked={values.needSample === opt}
                    onChange={() => set("needSample", opt)}
                    className="peer sr-only"
                  />
                  <span className="t-label flex min-h-12 cursor-pointer items-center border border-line px-5 transition-colors peer-checked:border-teal-deep peer-checked:bg-teal-deep peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-teal-deep hover:border-bone">
                    {opt}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <fieldset className="mt-10" id="quote-placement" aria-describedby={errors.placement ? "quote-placement-error" : undefined}>
          <legend className="t-label mb-3 text-mute">
            Placement <span className="normal-case tracking-normal text-mute">(optional · choose any)</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {placements.map((p) => {
              const checked = values.placement.includes(p);
              return (
                <label key={p} className="relative">
                  <input
                    type="checkbox"
                    name="placement"
                    value={p}
                    checked={checked}
                    onChange={() =>
                      set("placement", checked ? values.placement.filter((x) => x !== p) : [...values.placement, p])
                    }
                    className="peer sr-only"
                  />
                  <span className="t-label flex min-h-11 cursor-pointer items-center border border-line px-4 transition-colors peer-checked:border-teal-deep peer-checked:bg-teal-deep peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-teal-deep hover:border-bone">
                    {p}
                  </span>
                </label>
              );
            })}
          </div>
          <FieldError id="quote-placement-error" error={errors.placement} />
        </fieldset>
      </FormStep>

      {/* 03 - Files & notes */}
      <FormStep index="03" title="Artwork & details" last>
        <div className="grid gap-8 md:grid-cols-2">
          <div id="quote-artwork">
            <FileUpload
              id="quote-artwork-input"
              label="Artwork"
              hint={`AI, EPS, PDF, SVG, PSD, CDR, PNG, JPG or ZIP · up to ${formatBytes(UPLOAD_LIMITS.maxFileBytes)} each`}
              extensions={ARTWORK_EXTENSIONS}
              files={artwork}
              onChange={(f) => {
                markStarted();
                setArtwork(f);
                setErrors((e) => ({ ...e, artwork: undefined }));
              }}
              error={errors.artwork}
              disabled={submitting}
            />
          </div>
          <div id="quote-reference">
            <FileUpload
              id="quote-reference-input"
              label="Reference images"
              hint={`Photos of a reference sample or finish · JPG, PNG, WEBP or PDF`}
              extensions={REFERENCE_EXTENSIONS}
              files={reference}
              onChange={(f) => {
                markStarted();
                setReference(f);
                setErrors((e) => ({ ...e, reference: undefined }));
              }}
              error={errors.reference}
              disabled={submitting}
            />
          </div>
        </div>

        <Field
          id="quote-requirements"
          label="Additional requirements"
          className="mt-10"
          hint="Colours, finish, size, wash or packing requirements: anything that matters."
        >
          <textarea
            id="quote-requirements"
            name="requirements"
            rows={5}
            className={cn(inputClass, "min-h-36 resize-y")}
            value={values.requirements}
            onChange={(e) => set("requirements", e.target.value)}
            aria-describedby="quote-requirements-hint"
          />
        </Field>
      </FormStep>

      {status.state === "error" && (
        <div className="mt-10">
          <SubmissionError message={status.message} whatsappMessage={whatsappSummary} />
        </div>
      )}

      <div className="mt-12 flex flex-col gap-6 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-md text-sm text-mute">
          By submitting, you agree that we may contact you about this enquiry. Files are used only to prepare your
          quotation.
        </p>
        <div className="flex flex-col items-stretch gap-3 sm:items-end">
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? "Sending…" : "Submit Enquiry"}
          </Button>
          {submitting && (
            <div className="w-full sm:w-56" role="status" aria-live="polite">
              <div className="h-0.5 bg-line">
                <div
                  className="h-full origin-left bg-orange transition-transform"
                  style={{ transform: `scaleX(${Math.max(0.04, status.progress)})` }}
                />
              </div>
              <p className="t-label mt-2 text-mute">
                {status.progress < 1 && totalBytes > 0
                  ? `Uploading ${Math.round(status.progress * 100)}%`
                  : "Sending enquiry…"}
              </p>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}

function FormStep({ index, title, children, last }: { index: string; title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <section className={cn("grid gap-6 lg:grid-cols-12", !last && "mb-14 border-b border-line pb-14")}>
      <div className="lg:col-span-3">
        <p className="t-label text-red">{index}</p>
        <h2 className="mt-2 font-display text-2xl font-bold uppercase leading-none [font-variation-settings:'wdth'_80]">
          {title}
        </h2>
      </div>
      <div className="lg:col-span-9">{children}</div>
    </section>
  );
}
