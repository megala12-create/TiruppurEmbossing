"use client";

import { useState } from "react";
import { services } from "@/data/services";
import { SAMPLE_OPTIONS, isEmail, isPhone } from "@/lib/forms/schema";
import { cn } from "@/lib/cn";
import { Check } from "@/components/ui/Icons";

export type QuoteDraft = {
  name: string;
  company: string;
  email: string;
  phone: string;
  service: string;
  fabric: string;
  garmentType: string;
  quantity: string;
  placement: string;
  deliveryDate: string;
  needSample: string;
  requirements: string;
  consent: boolean;
};

const EMPTY: QuoteDraft = {
  name: "",
  company: "",
  email: "",
  phone: "",
  service: "",
  fabric: "",
  garmentType: "",
  quantity: "",
  placement: "",
  deliveryDate: "",
  needSample: "",
  requirements: "",
  consent: false,
};

const inputClass =
  "block w-full min-h-10 border border-line bg-ink px-3 py-2 text-sm text-bone focus:border-teal-deep focus:outline-none";
const labelClass = "t-label mb-1 block text-[0.65rem] text-mute";

type Step = 0 | 1 | 2;

export function QuoteForm({
  onCancel,
  onSubmit,
  submitting,
  error,
}: {
  onCancel: () => void;
  onSubmit: (draft: QuoteDraft) => void;
  submitting: boolean;
  error: string | null;
}) {
  const [step, setStep] = useState<Step>(0);
  const [draft, setDraft] = useState<QuoteDraft>(EMPTY);
  const set = <K extends keyof QuoteDraft>(key: K, value: QuoteDraft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const step0Valid = draft.name.trim().length >= 2 && (isPhone(draft.phone) || isEmail(draft.email));
  const step1Valid = Boolean(draft.service);

  return (
    <div className="border border-line bg-carbon p-4 text-sm">
      <p className="t-label mb-3 text-teal-deep">Request a quotation · Step {step + 1} of 3</p>

      {step === 0 && (
        <div className="space-y-3">
          <Field label="Your name *">
            <input className={inputClass} value={draft.name} onChange={(e) => set("name", e.target.value)} maxLength={120} />
          </Field>
          <Field label="Company">
            <input className={inputClass} value={draft.company} onChange={(e) => set("company", e.target.value)} maxLength={160} />
          </Field>
          <Field label="Phone (or WhatsApp)">
            <input
              className={inputClass}
              value={draft.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+91 98765 43210"
              maxLength={30}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              className={inputClass}
              value={draft.email}
              onChange={(e) => set("email", e.target.value)}
              maxLength={200}
            />
          </Field>
          <p className="text-xs text-mute">Share at least a phone number or an email so the team can reach you.</p>
          <StepButtons onNext={() => setStep(1)} nextDisabled={!step0Valid} onCancel={onCancel} />
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <Field label="Printing service *">
            <select className={inputClass} value={draft.service} onChange={(e) => set("service", e.target.value)}>
              <option value="">Choose a service…</option>
              {services.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.title}
                </option>
              ))}
              <option value="not-sure">Not sure yet</option>
            </select>
          </Field>
          <Field label="Fabric / material">
            <input className={inputClass} value={draft.fabric} onChange={(e) => set("fabric", e.target.value)} maxLength={200} />
          </Field>
          <Field label="Garment type">
            <input
              className={inputClass}
              value={draft.garmentType}
              onChange={(e) => set("garmentType", e.target.value)}
              placeholder="T-shirt, hoodie, jersey…"
              maxLength={120}
            />
          </Field>
          <Field label="Quantity">
            <input
              className={inputClass}
              value={draft.quantity}
              onChange={(e) => set("quantity", e.target.value)}
              placeholder="e.g. 500 pieces"
              maxLength={80}
            />
          </Field>
          <Field label="Placement">
            <input
              className={inputClass}
              value={draft.placement}
              onChange={(e) => set("placement", e.target.value)}
              placeholder="Left chest, back, sleeve…"
              maxLength={120}
            />
          </Field>
          <Field label="Need a sample?">
            <select className={inputClass} value={draft.needSample} onChange={(e) => set("needSample", e.target.value)}>
              <option value="">Not sure</option>
              {SAMPLE_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Target delivery date">
            <input type="date" className={inputClass} value={draft.deliveryDate} onChange={(e) => set("deliveryDate", e.target.value)} />
          </Field>
          <StepButtons onBack={() => setStep(0)} onNext={() => setStep(2)} nextDisabled={!step1Valid} onCancel={onCancel} />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <Field label="Special requirements">
            <textarea
              className={cn(inputClass, "min-h-20 resize-y py-2")}
              value={draft.requirements}
              onChange={(e) => set("requirements", e.target.value)}
              maxLength={3000}
              placeholder="Artwork status, colours, reference samples, anything else the team should know…"
            />
          </Field>

          <div className="border border-dashed border-line bg-ink p-3 text-xs">
            <p className="t-label mb-2 text-mute">Please confirm this is correct</p>
            <SummaryRow label="Name" value={draft.name} />
            <SummaryRow label="Company" value={draft.company} />
            <SummaryRow label="Phone" value={draft.phone} />
            <SummaryRow label="Email" value={draft.email} />
            <SummaryRow label="Service" value={services.find((s) => s.slug === draft.service)?.title ?? draft.service} />
            <SummaryRow label="Fabric" value={draft.fabric} />
            <SummaryRow label="Garment" value={draft.garmentType} />
            <SummaryRow label="Quantity" value={draft.quantity} />
            <SummaryRow label="Placement" value={draft.placement} />
            <SummaryRow label="Sample needed" value={draft.needSample} />
            <SummaryRow label="Target date" value={draft.deliveryDate} />
            <SummaryRow label="Requirements" value={draft.requirements} />
          </div>

          <label className="flex items-start gap-2 text-xs text-mute">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={draft.consent}
              onChange={(e) => set("consent", e.target.checked)}
            />
            I agree to be contacted about this enquiry using the details above. No artwork files are attached here &mdash;
            I&rsquo;ll email them or use the Request a Quote page if needed.
          </label>

          {error && <p className="text-red">{error}</p>}

          <StepButtons
            onBack={() => setStep(1)}
            onNext={() => onSubmit(draft)}
            nextLabel={submitting ? "Sending…" : "Send enquiry"}
            nextDisabled={!draft.consent || submitting}
            onCancel={onCancel}
            nextIcon={<Check size={16} />}
          />
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <p className="flex justify-between gap-3 border-t border-line py-1 first:border-t-0">
      <span className="text-mute">{label}</span>
      <span className="text-right text-bone">{value}</span>
    </p>
  );
}

function StepButtons({
  onBack,
  onNext,
  onCancel,
  nextDisabled,
  nextLabel = "Next",
  nextIcon,
}: {
  onBack?: () => void;
  onNext: () => void;
  onCancel: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  nextIcon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 pt-1">
      <button type="button" onClick={onCancel} className="t-label text-[0.65rem] text-mute hover:text-red">
        Cancel
      </button>
      <div className="flex gap-2">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="t-label min-h-9 border border-line px-3 text-[0.65rem] hover:border-teal-deep"
          >
            Back
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className="t-label inline-flex min-h-9 items-center gap-1.5 bg-teal-deep px-3 text-[0.65rem] text-white hover:bg-bone disabled:cursor-not-allowed disabled:opacity-40"
        >
          {nextLabel}
          {nextIcon}
        </button>
      </div>
    </div>
  );
}
