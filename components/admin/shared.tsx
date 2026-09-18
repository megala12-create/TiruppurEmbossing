"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export const ACCEPT = ".jpg,.jpeg,.png,.webp,.avif";

export type Notify = (message: string, tone?: "ok" | "error") => void;

/** POSTs/DELETEs to an admin endpoint and returns a user-facing message on failure. */
export async function adminRequest(url: string, init: RequestInit): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch(url, init);
    const body = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
    if (res.status === 401) window.location.reload();
    return { ok: res.ok && Boolean(body.ok), message: body.message ?? (res.ok ? "" : "Something went wrong.") };
  } catch {
    return { ok: false, message: "Could not reach the server. Please check your connection." };
  }
}

export const fieldClass =
  "block w-full min-h-11 border border-line bg-ink px-3 py-2 text-sm text-bone focus:border-teal-deep focus:outline-none";

/** File picker with a live preview of the chosen photo. */
export function PhotoPicker({
  id,
  file,
  onChange,
  current,
  required,
}: {
  id: string;
  file: File | null;
  onChange: (f: File | null) => void;
  current?: { src: string; alt: string; width: number; height: number };
  required?: boolean;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url); // eslint-disable-line react-hooks/set-state-in-effect -- object URL lifecycle
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const shown = file ? preview : current?.src;

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden border border-line bg-graphite">
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element -- local preview / admin thumbnail
          file ? <img src={shown} alt="Selected photo preview" className="size-full object-cover" /> : (
            <Image src={shown} alt={current?.alt ?? ""} fill sizes="320px" className="object-cover" unoptimized />
          )
        ) : (
          <span className="flex size-full items-center justify-center text-sm text-mute">No photo yet</span>
        )}
        {file && <span className="t-label absolute left-2 top-2 bg-orange px-2 py-1 text-[0.6rem] text-bone">New photo</span>}
      </div>
      <label
        htmlFor={id}
        className={cn(
          "t-label mt-2 flex min-h-11 cursor-pointer items-center justify-center border border-dashed border-line px-3 text-center hover:border-teal-deep",
        )}
      >
        {file ? `Change: ${file.name}` : current ? "Choose new photo" : "Choose photo"}
        {required && !current && <span className="ml-1 text-red">*</span>}
      </label>
      <input
        id={id}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(e) => {
          onChange(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />
    </div>
  );
}
