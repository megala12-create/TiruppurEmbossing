"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { PhotoPicker, adminRequest, fieldClass, type Notify } from "./shared";

export type ImageSlot = {
  kind: "services" | "machines";
  slug: string;
  number: string;
  title: string;
  image?: { src: string; alt: string; width: number; height: number };
  custom: boolean;
};

/** One replaceable photo: a service category or a production machine. */
export function ImageSlotCard({ slot, notify }: { slot: ImageSlot; notify: Notify }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState(slot.custom ? (slot.image?.alt ?? "") : "");
  const [busy, setBusy] = useState(false);
  const url = `/api/admin/images/${slot.kind}/${slot.slug}`;
  const inputId = `${slot.kind}-${slot.slug}`;

  const save = async () => {
    if (!file && !slot.custom) return notify(`${slot.title}: choose a photo first.`, "error");
    if (!alt.trim()) return notify(`${slot.title}: add a short photo description.`, "error");
    const data = new FormData();
    if (file) data.set("file", file);
    data.set("alt", alt);
    setBusy(true);
    const res = await adminRequest(url, { method: "POST", body: data });
    setBusy(false);
    if (!res.ok) return notify(`${slot.title}: ${res.message}`, "error");
    setFile(null);
    notify(`${slot.title}: photo saved and published.`);
    router.refresh();
  };

  const reset = async () => {
    if (!confirm(`Remove the uploaded photo for ${slot.title} and restore the default visual?`)) return;
    setBusy(true);
    const res = await adminRequest(url, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) return notify(`${slot.title}: ${res.message}`, "error");
    setAlt("");
    notify(`${slot.title}: default visual restored.`);
    router.refresh();
  };

  return (
    <li className="flex flex-col gap-4 border border-line bg-ink p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="t-label text-mute">{slot.number}</p>
          <h3 className="mt-1 font-display text-lg font-bold uppercase leading-tight [font-variation-settings:'wdth'_80]">
            {slot.title}
          </h3>
        </div>
        <span
          className={`t-label shrink-0 px-2 py-1 text-[0.6rem] ${slot.custom ? "bg-teal-deep text-white" : "bg-graphite text-mute"}`}
        >
          {slot.custom ? "Client photo" : slot.image ? "Default visual" : "Placeholder"}
        </span>
      </div>

      <PhotoPicker id={inputId} file={file} onChange={setFile} current={slot.image} />

      <div>
        <label htmlFor={`${inputId}-alt`} className="t-label text-mute">
          Photo description (alt text)
        </label>
        <input
          id={`${inputId}-alt`}
          className={`${fieldClass} mt-1`}
          value={alt}
          maxLength={200}
          placeholder="e.g. Raised logo emboss on a black cotton T-shirt"
          onChange={(e) => setAlt(e.target.value)}
        />
      </div>

      <div className="mt-auto flex flex-wrap gap-2">
        <Button onClick={save} disabled={busy} icon={false} className="flex-1 justify-center">
          {busy ? "Saving…" : "Save"}
        </Button>
        {slot.custom && (
          <Button onClick={reset} disabled={busy} variant="outline" icon={false}>
            Reset
          </Button>
        )}
      </div>
    </li>
  );
}
