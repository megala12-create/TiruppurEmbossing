"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PortfolioItem } from "@/data/portfolio";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, ArrowRight } from "@/components/ui/Icons";
import { PhotoPicker, adminRequest, fieldClass, type Notify } from "./shared";

type Option = { id: string; label: string };
type Props = { samples: PortfolioItem[]; categories: Option[]; services: Option[]; notify: Notify };

type Draft = { title: string; category: string; service: string; summary: string; alt: string };

const toDraft = (s?: PortfolioItem): Draft => ({
  title: s?.title ?? "",
  category: s?.category ?? "",
  service: s?.service ?? "",
  summary: s?.summary ?? "",
  alt: s?.illustrative ? "" : (s?.image.alt ?? ""),
});

export function SamplesManager({ samples, categories, services, notify }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const move = async (index: number, dir: -1 | 1) => {
    const order = samples.map((s) => s.slug);
    const j = index + dir;
    if (j < 0 || j >= order.length) return;
    [order[index], order[j]] = [order[j], order[index]];
    setBusy(true);
    const res = await adminRequest("/api/admin/samples", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order }),
    });
    setBusy(false);
    if (!res.ok) return notify(res.message, "error");
    router.refresh();
  };

  return (
    <div className="space-y-10">
      <NewSample categories={categories} services={services} notify={notify} />

      <section aria-labelledby="samples-list">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 id="samples-list" className="t-h3">
            Samples on the website ({samples.length})
          </h2>
          <p className="text-sm text-mute">Shown in this order on the Portfolio page.</p>
        </div>
        {samples.length === 0 ? (
          <p className="border border-dashed border-line p-8 text-mute">No samples yet. Add the first one above.</p>
        ) : (
          <ol className="space-y-3">
            {samples.map((s, i) => (
              <SampleRow
                key={s.slug}
                sample={s}
                index={i}
                total={samples.length}
                categories={categories}
                services={services}
                notify={notify}
                onMove={move}
                reordering={busy}
              />
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function SampleFields({
  id,
  draft,
  setDraft,
  categories,
  services,
}: {
  id: string;
  draft: Draft;
  setDraft: (d: Draft) => void;
  categories: Option[];
  services: Option[];
}) {
  const field = (key: keyof Draft, label: string, input: React.ReactNode) => (
    <div>
      <label htmlFor={`${id}-${key}`} className="t-label text-mute">
        {label}
      </label>
      <div className="mt-1">{input}</div>
    </div>
  );
  const set = (key: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setDraft({ ...draft, [key]: e.target.value });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {field("title", "Title *", <input id={`${id}-title`} className={fieldClass} maxLength={80} value={draft.title} onChange={set("title")} />)}
      {field(
        "category",
        "Category *",
        <select id={`${id}-category`} className={fieldClass} value={draft.category} onChange={set("category")}>
          <option value="">Choose a category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>,
      )}
      {field(
        "service",
        "Related service *",
        <select id={`${id}-service`} className={fieldClass} value={draft.service} onChange={set("service")}>
          <option value="">Choose a service</option>
          {services.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>,
      )}
      {field(
        "alt",
        "Photo description (alt text) *",
        <input id={`${id}-alt`} className={fieldClass} maxLength={200} value={draft.alt} onChange={set("alt")} placeholder="What the photo shows" />,
      )}
      <div className="sm:col-span-2">
        {field(
          "summary",
          "Short description",
          <textarea id={`${id}-summary`} rows={2} maxLength={300} className={fieldClass} value={draft.summary} onChange={set("summary")} />,
        )}
      </div>
    </div>
  );
}

const toForm = (draft: Draft, file: File | null) => {
  const data = new FormData();
  Object.entries(draft).forEach(([k, v]) => data.set(k, v));
  if (file) data.set("file", file);
  return data;
};

function NewSample({ categories, services, notify }: { categories: Option[]; services: Option[]; notify: Notify }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(toDraft());
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!file) return notify("Choose a photo for the new sample.", "error");
    setBusy(true);
    const res = await adminRequest("/api/admin/samples", { method: "POST", body: toForm(draft, file) });
    setBusy(false);
    if (!res.ok) return notify(res.message, "error");
    notify(`“${draft.title}” added to the portfolio.`);
    setDraft(toDraft());
    setFile(null);
    setOpen(false);
    router.refresh();
  };

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} size="lg">
        Add a new sample
      </Button>
    );
  }

  return (
    <section aria-labelledby="new-sample" className="border border-teal-deep bg-ink p-5 md:p-6">
      <h2 id="new-sample" className="t-h3 mb-5">
        New sample
      </h2>
      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <PhotoPicker id="new-sample-file" file={file} onChange={setFile} required />
        <SampleFields id="new" draft={draft} setDraft={setDraft} categories={categories} services={services} />
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button onClick={save} disabled={busy} icon={false}>
          {busy ? "Uploading…" : "Publish sample"}
        </Button>
        <Button onClick={() => setOpen(false)} disabled={busy} variant="outline" icon={false}>
          Cancel
        </Button>
      </div>
    </section>
  );
}

function SampleRow({
  sample,
  index,
  total,
  categories,
  services,
  notify,
  onMove,
  reordering,
}: {
  sample: PortfolioItem;
  index: number;
  total: number;
  categories: Option[];
  services: Option[];
  notify: Notify;
  onMove: (i: number, dir: -1 | 1) => void;
  reordering: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Draft>(toDraft(sample));
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const url = `/api/admin/samples/${sample.slug}`;
  const categoryLabel = categories.find((c) => c.id === sample.category)?.label ?? sample.category;

  const save = async () => {
    setBusy(true);
    const res = await adminRequest(url, { method: "POST", body: toForm(draft, file) });
    setBusy(false);
    if (!res.ok) return notify(res.message, "error");
    notify(`“${draft.title}” updated.`);
    setFile(null);
    setEditing(false);
    router.refresh();
  };

  const remove = async () => {
    if (!confirm(`Delete “${sample.title}” from the portfolio? This cannot be undone.`)) return;
    setBusy(true);
    const res = await adminRequest(url, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) return notify(res.message, "error");
    notify(`“${sample.title}” deleted.`);
    router.refresh();
  };

  return (
    <li className={cn("border bg-ink", editing ? "border-teal-deep" : "border-line")}>
      <div className="flex flex-wrap items-center gap-4 p-3">
        <span className="t-label w-7 text-mute">{String(index + 1).padStart(2, "0")}</span>
        {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
        <img src={sample.image.src} alt="" className="h-16 w-20 shrink-0 bg-graphite object-cover" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{sample.title}</p>
          <p className="t-label mt-1 text-mute">
            {categoryLabel}
            {sample.illustrative && <span className="ml-2 text-orange-deep">· Illustrative placeholder</span>}
          </p>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onMove(index, -1)}
            disabled={index === 0 || reordering}
            className="flex size-10 rotate-90 items-center justify-center border border-line disabled:opacity-30"
            aria-label={`Move ${sample.title} up`}
          >
            <ArrowLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => onMove(index, 1)}
            disabled={index === total - 1 || reordering}
            className="flex size-10 rotate-90 items-center justify-center border border-line disabled:opacity-30"
            aria-label={`Move ${sample.title} down`}
          >
            <ArrowRight size={16} />
          </button>
          <button
            type="button"
            onClick={() => setEditing((e) => !e)}
            className="t-label min-h-10 border border-line px-3 hover:border-teal-deep"
            aria-expanded={editing}
          >
            {editing ? "Close" : "Edit"}
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="t-label min-h-10 border border-line px-3 text-red hover:border-red"
          >
            Delete
          </button>
        </div>
      </div>

      {editing && (
        <div className="border-t border-line p-4 md:p-5">
          <div className="grid gap-6 md:grid-cols-[280px_1fr]">
            <PhotoPicker id={`edit-${sample.slug}`} file={file} onChange={setFile} current={sample.image} />
            <SampleFields
              id={`edit-${sample.slug}`}
              draft={draft}
              setDraft={setDraft}
              categories={categories}
              services={services}
            />
          </div>
          {sample.illustrative && !file && (
            <p className="mt-4 text-sm text-orange-deep">
              This is a generated placeholder. Upload a real photo to replace it.
            </p>
          )}
          <div className="mt-5 flex gap-2">
            <Button onClick={save} disabled={busy} icon={false}>
              {busy ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}
