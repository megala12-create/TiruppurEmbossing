import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export const inputClass =
  "block w-full min-h-14 border-0 border-b border-line bg-transparent px-0 py-3 text-lg text-bone placeholder:text-mute/60 transition-colors focus:border-teal-deep focus:outline-none focus-visible:outline-none aria-[invalid=true]:border-red disabled:opacity-50";

export function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("group/field", className)}>
      <label htmlFor={id} className="t-label flex items-center gap-2 text-mute group-focus-within/field:text-teal-deep">
        {label}
        {required ? (
          <span className="text-red" aria-hidden>
            *
          </span>
        ) : (
          <span className="normal-case tracking-normal text-mute">(optional)</span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-2 text-sm text-mute">
          {hint}
        </p>
      )}
      <FieldError id={`${id}-error`} error={error} />
    </div>
  );
}

export function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={id} className="mt-2 flex items-start gap-2 text-sm text-red">
      <span aria-hidden className="mt-1.5 size-1.5 shrink-0 bg-red" />
      {error}
    </p>
  );
}

export const describedBy = (id: string, error?: string, hint?: string) =>
  [error ? `${id}-error` : null, hint && !error ? `${id}-hint` : null].filter(Boolean).join(" ") || undefined;

/** Honeypot field - hidden from people and assistive tech, filled only by bots. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}
