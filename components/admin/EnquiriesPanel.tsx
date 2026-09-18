"use client";

import { useRouter } from "next/navigation";
import { useDeferredValue, useMemo, useState } from "react";
import type { EnquiryStatus, StoredEnquiry } from "@/lib/admin/enquiries";
import { cn } from "@/lib/cn";
import { FileIcon, Mail, Phone, Search, WhatsApp } from "@/components/ui/Icons";
import { adminRequest, fieldClass, type Notify } from "./shared";

const STATUS: Record<EnquiryStatus, { label: string; className: string }> = {
  new: { label: "New", className: "bg-red text-white" },
  "in-progress": { label: "In progress", className: "bg-orange text-bone" },
  done: { label: "Done", className: "bg-teal-deep text-white" },
};

const FIELD_LABELS: [string, string][] = [
  ["company", "Company"],
  ["serviceTitle", "Printing service"],
  ["subService", "Variation"],
  ["quantity", "Quantity"],
  ["fabric", "Fabric / material"],
  ["placement", "Placement"],
  ["deliveryDate", "Target delivery date"],
  ["needSample", "Need sample"],
  ["requirements", "Additional requirements"],
  ["message", "Message"],
];

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });

const fieldText = (v: string | string[] | undefined) => (Array.isArray(v) ? v.join(", ") : (v ?? ""));

const sizeLabel = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export function EnquiriesPanel({ enquiries, notify }: { enquiries: StoredEnquiry[]; notify: Notify }) {
  const [status, setStatus] = useState<EnquiryStatus | "all">("all");
  const [kind, setKind] = useState<"all" | "quote" | "contact">("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const q = useDeferredValue(query.trim().toLowerCase());

  const counts = useMemo(() => {
    const c = { all: enquiries.length, new: 0, "in-progress": 0, done: 0 };
    enquiries.forEach((e) => c[e.status]++);
    return c;
  }, [enquiries]);

  const visible = useMemo(
    () =>
      enquiries.filter((e) => {
        if (status !== "all" && e.status !== status) return false;
        if (kind !== "all" && e.kind !== kind) return false;
        if (!q) return true;
        const hay = `${e.reference} ${Object.values(e.fields).map(fieldText).join(" ")}`.toLowerCase();
        return hay.includes(q);
      }),
    [enquiries, status, kind, q],
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
          {(["all", "new", "in-progress", "done"] as const).map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={status === s}
              onClick={() => setStatus(s)}
              className={cn(
                "t-label inline-flex min-h-10 items-center gap-2 border px-3",
                status === s ? "border-teal-deep bg-teal-deep text-white" : "border-line bg-ink hover:border-teal-deep",
              )}
            >
              {s === "all" ? "All" : STATUS[s].label}
              <span className={status === s ? "text-white/70" : "text-mute"}>{counts[s]}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- CSV file download from an API route, not a page
          onClick={() => window.location.assign("/api/admin/enquiries/export")}
          disabled={enquiries.length === 0}
          className="t-label inline-flex min-h-10 items-center border border-line bg-ink px-3 hover:border-teal-deep disabled:opacity-40"
        >
          Export to Excel (CSV)
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <label className="relative min-w-60 flex-1">
          <span className="sr-only">Search enquiries</span>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone, company, service, reference…"
            className={cn(fieldClass, "pl-9")}
          />
        </label>
        <label>
          <span className="sr-only">Enquiry type</span>
          <select className={fieldClass} value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>
            <option value="all">All types</option>
            <option value="quote">Quote requests</option>
            <option value="contact">Contact messages</option>
          </select>
        </label>
      </div>

      <p className="t-label mt-6 text-mute" aria-live="polite">
        {visible.length} {visible.length === 1 ? "enquiry" : "enquiries"}
      </p>

      {visible.length === 0 ? (
        <p className="mt-3 border border-dashed border-line bg-ink p-8 text-mute">
          {enquiries.length === 0
            ? "No enquiries yet. Quote requests and contact messages from the website will appear here."
            : "No enquiries match these filters."}
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {visible.map((e) => (
            <EnquiryRow
              key={e.reference}
              enquiry={e}
              open={open === e.reference}
              onToggle={() => setOpen(open === e.reference ? null : e.reference)}
              notify={notify}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function EnquiryRow({
  enquiry: e,
  open,
  onToggle,
  notify,
}: {
  enquiry: StoredEnquiry;
  open: boolean;
  onToggle: () => void;
  notify: Notify;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const f = e.fields;
  const name = fieldText(f.name) || "(no name)";
  const phone = fieldText(f.phone);
  const email = fieldText(f.email);
  const digits = phone.replace(/\D/g, "");
  const waNumber = digits.length === 10 ? `91${digits}` : digits;
  const summary = e.kind === "quote" ? fieldText(f.serviceTitle) || "Quote request" : "Contact message";
  const base = `/api/admin/enquiries/${e.reference}`;

  const changeStatus = async (next: EnquiryStatus) => {
    setBusy(true);
    const res = await adminRequest(base, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setBusy(false);
    if (!res.ok) return notify(res.message, "error");
    notify(`${e.reference} marked as ${STATUS[next].label.toLowerCase()}.`);
    router.refresh();
  };

  const remove = async () => {
    if (!confirm(`Delete enquiry ${e.reference} from ${name}, including attachments? This cannot be undone.`)) return;
    setBusy(true);
    const res = await adminRequest(base, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) return notify(res.message, "error");
    notify(`${e.reference} deleted.`);
    router.refresh();
  };

  return (
    <li className={cn("border bg-ink", open ? "border-teal-deep" : "border-line")}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-1 p-4 text-left hover:bg-carbon md:grid-cols-[110px_1.3fr_1.2fr_150px_auto]"
      >
        <span className={cn("t-label w-fit px-2 py-1 text-[0.6rem]", STATUS[e.status].className)}>
          {STATUS[e.status].label}
        </span>
        <span className="min-w-0">
          <span className="block truncate font-medium">{name}</span>
          <span className="block truncate text-sm text-mute md:hidden">{summary}</span>
        </span>
        <span className="hidden truncate text-sm md:block">
          {summary}
          {fieldText(f.quantity) && <span className="text-mute"> · {fieldText(f.quantity)}</span>}
        </span>
        <span className="hidden text-sm text-mute md:block">{fmt(e.submittedAt)}</span>
        <span className="t-label text-teal-deep">{open ? "Close" : "Open"}</span>
      </button>

      {open && (
        <div className="border-t border-line p-4 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="t-label text-mute">
                {e.kind === "quote" ? "Quote request" : "Contact message"} · {e.reference}
              </p>
              <h3 className="mt-1 text-xl font-medium">{name}</h3>
              <p className="text-sm text-mute">Received {fmt(e.submittedAt)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {phone && (
                <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="t-label flex min-h-10 items-center gap-2 border border-line px-3 hover:border-teal-deep">
                  <Phone size={16} /> {phone}
                </a>
              )}
              {digits && (
                <a
                  href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hello ${name}, thank you for your enquiry (${e.reference}) with Tiruppur Embossing.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="t-label flex min-h-10 items-center gap-2 bg-teal-deep px-3 text-white hover:bg-bone"
                >
                  <WhatsApp size={16} /> WhatsApp
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}?subject=${encodeURIComponent(`Your enquiry ${e.reference} - Tiruppur Embossing`)}`}
                  className="t-label flex min-h-10 items-center gap-2 border border-line px-3 hover:border-teal-deep"
                >
                  <Mail size={16} /> <span className="normal-case tracking-normal">{email}</span>
                </a>
              )}
            </div>
          </div>

          <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {FIELD_LABELS.filter(([k]) => fieldText(f[k])).map(([k, label]) => (
              <div key={k} className={k === "requirements" || k === "message" ? "sm:col-span-2" : undefined}>
                <dt className="t-label text-mute">{label}</dt>
                <dd className="mt-1 whitespace-pre-line">
                  {k === "deliveryDate"
                    ? new Date(fieldText(f[k])).toLocaleDateString("en-IN", { dateStyle: "medium" })
                    : fieldText(f[k])}
                </dd>
              </div>
            ))}
          </dl>

          {e.attachments.length > 0 && (
            <div className="mt-6">
              <p className="t-label text-mute">Attachments ({e.attachments.length})</p>
              <ul className="mt-2 flex flex-wrap gap-3">
                {e.attachments.map((a) => {
                  const url = `${base}/files/${encodeURIComponent(a.name)}`;
                  return (
                    <li key={a.name} className="w-44 border border-line">
                      <a href={url} target="_blank" rel="noopener noreferrer" className="block">
                        {a.isImage ? (
                          // eslint-disable-next-line @next/next/no-img-element -- private, authenticated attachment
                          <img src={url} alt={a.name} className="h-28 w-full bg-graphite object-cover" />
                        ) : (
                          <span className="flex h-28 items-center justify-center bg-graphite text-mute">
                            <FileIcon size={32} />
                          </span>
                        )}
                      </a>
                      <div className="p-2 text-xs">
                        <p className="truncate" title={a.name}>
                          {a.name.replace(/^(artwork|reference)-\d+-/, "")}
                        </p>
                        <p className="mt-0.5 flex justify-between text-mute">
                          <span className="capitalize">{a.field}</span>
                          <span>{sizeLabel(a.size)}</span>
                        </p>
                        <a href={`${url}?download`} className="t-label mt-2 inline-block text-teal-deep">
                          Download
                        </a>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-line pt-5">
            <span className="t-label mr-2 text-mute">Mark as</span>
            {(Object.keys(STATUS) as EnquiryStatus[]).map((s) => (
              <button
                key={s}
                type="button"
                disabled={busy || e.status === s}
                onClick={() => changeStatus(s)}
                aria-pressed={e.status === s}
                className={cn(
                  "t-label min-h-10 border px-3 disabled:cursor-default",
                  e.status === s ? cn("border-transparent", STATUS[s].className) : "border-line hover:border-teal-deep",
                )}
              >
                {STATUS[s].label}
              </button>
            ))}
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="t-label ml-auto min-h-10 border border-line px-3 text-red hover:border-red"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
