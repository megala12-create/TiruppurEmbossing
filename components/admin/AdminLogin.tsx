"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { LogoLockup } from "@/components/ui/Brand";
import { inputClass } from "@/components/forms/Field";

export function AdminLogin({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password) return setError("Please enter the password.");
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).catch(() => null);
    const body = (await res?.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
    setBusy(false);
    if (res?.ok && body?.ok) {
      setPassword("");
      router.refresh();
    } else {
      setError(body?.message ?? "Could not reach the server. Please try again.");
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-carbon px-4 py-16">
      <div className="w-full max-w-md border border-line bg-ink p-8 md:p-10">
        <LogoLockup />
        <h1 className="t-h3 mt-10">Admin sign in</h1>
        <p className="mt-2 text-sm text-mute">View enquiries and manage photos for services, samples and machines.</p>

        {!configured ? (
          <p role="alert" className="mt-8 border-l-2 border-red bg-red/5 p-4 text-sm">
            Admin access is not configured. Set <code>ADMIN_PASSWORD</code> in the server environment.
          </p>
        ) : (
          <form onSubmit={submit} noValidate className="mt-8 space-y-6">
            <div>
              <label htmlFor="admin-password" className="t-label text-mute">
                Password
              </label>
              <div className="flex items-end gap-2">
                <input
                  id="admin-password"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  autoFocus
                  className={inputClass}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "admin-login-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="t-label min-h-12 shrink-0 px-2 text-teal-deep"
                  aria-pressed={show}
                >
                  {show ? "Hide" : "Show"}
                </button>
              </div>
              {error && (
                <p id="admin-login-error" role="alert" className="mt-2 text-sm text-red">
                  {error}
                </p>
              )}
            </div>
            <Button type="submit" size="lg" disabled={busy} className="w-full justify-between">
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
