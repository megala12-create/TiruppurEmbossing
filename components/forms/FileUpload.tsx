"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { UPLOAD_LIMITS, acceptAttr, formatBytes, validateUpload } from "@/lib/forms/schema";
import { Close, FileIcon, Upload } from "@/components/ui/Icons";
import { FieldError } from "./Field";

type Props = {
  id: string;
  label: string;
  hint: string;
  extensions: string[];
  files: File[];
  onChange: (files: File[]) => void;
  error?: string;
  disabled?: boolean;
};

/**
 * Accessible file picker + drag-and-drop zone. Files are validated client-side
 * (type, size, count) and kept in state; the parent form appends them to
 * FormData so any backend / storage provider can receive them later.
 */
export function FileUpload({ id, label, hint, extensions, files, onChange, error, disabled }: Props) {
  const [dragging, setDragging] = useState(false);
  const [rejections, setRejections] = useState<string[]>([]);

  const add = (incoming: FileList | File[]) => {
    const list = Array.from(incoming);
    const errors: string[] = [];
    const next = [...files];
    for (const file of list) {
      const problem = validateUpload(file, extensions);
      if (problem) {
        errors.push(problem);
        continue;
      }
      if (next.some((f) => f.name === file.name && f.size === file.size)) continue;
      if (next.length >= UPLOAD_LIMITS.maxFilesPerField) {
        errors.push(`Up to ${UPLOAD_LIMITS.maxFilesPerField} files can be attached here.`);
        break;
      }
      next.push(file);
    }
    setRejections(errors);
    if (next.length !== files.length) {
      onChange(next);
      track("file_upload", { field: id, count: next.length - files.length });
    }
  };

  const remove = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
    setRejections([]);
  };

  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div>
      <p className="t-label mb-3 flex items-center gap-2 text-mute" id={`${id}-label`}>
        {label} <span className="normal-case tracking-normal text-mute">(optional)</span>
      </p>

      <div className="relative">
        <input
          id={id}
          type="file"
          multiple
          accept={acceptAttr(extensions)}
          disabled={disabled}
          className="peer sr-only"
          aria-labelledby={`${id}-label ${id}-cta`}
          aria-describedby={[hintId, error || rejections.length ? errorId : ""].filter(Boolean).join(" ")}
          onChange={(e) => {
            if (e.target.files) add(e.target.files);
            e.target.value = "";
          }}
        />
        <label
          htmlFor={id}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (!disabled && e.dataTransfer.files.length) add(e.dataTransfer.files);
          }}
          className={cn(
            "flex min-h-32 cursor-pointer flex-col items-center justify-center gap-3 border border-dashed px-6 py-8 text-center transition-colors",
            "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-teal-deep",
            dragging ? "border-teal-deep bg-teal/5" : "border-line hover:border-bone",
            (error || rejections.length > 0) && "border-red",
          )}
        >
          <Upload size={22} className="text-red" />
          <span id={`${id}-cta`} className="text-bone">
            <span className="underline decoration-orange underline-offset-4">Choose files</span>
            <span className="hidden sm:inline"> or drag and drop</span>
          </span>
          <span id={hintId} className="text-sm text-mute">
            {hint}
          </span>
        </label>
      </div>

      {files.length > 0 && (
        <ul className="mt-3 divide-y divide-line border border-line" aria-label={`${label}: selected files`}>
          {files.map((f, i) => (
            <li key={`${f.name}-${f.size}`} className="flex items-center gap-3 px-4 py-3">
              <FileIcon size={18} className="shrink-0 text-mute" />
              <span className="min-w-0 flex-1 truncate text-sm">{f.name}</span>
              <span className="text-sm tabular-nums text-mute">{formatBytes(f.size)}</span>
              <button
                type="button"
                onClick={() => remove(i)}
                disabled={disabled}
                className="flex size-10 items-center justify-center text-mute hover:text-bone"
                aria-label={`Remove ${f.name}`}
              >
                <Close size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <FieldError id={errorId} error={[...rejections, error].filter(Boolean).join(" ") || undefined} />
    </div>
  );
}
