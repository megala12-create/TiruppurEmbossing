/**
 * Client-side submission API.
 *
 * All forms submit through `submitForm`, which posts multipart FormData to an
 * internal route handler (/api/quote, /api/contact). The handler validates the
 * payload and hands it to a delivery adapter (lib/server/delivery.ts), so the
 * backend / storage provider can change without touching UI components.
 */

export type SubmitResult =
  | { ok: true; reference: string }
  | {
      ok: false;
      status: number;
      code: "validation" | "not_configured" | "rate_limited" | "failed" | "network";
      message: string;
      fieldErrors?: Record<string, string>;
    };

export function submitForm(
  endpoint: "/api/quote" | "/api/contact",
  data: FormData,
  onProgress?: (fraction: number) => void,
): Promise<SubmitResult> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint);
    xhr.responseType = "json";
    xhr.timeout = 120_000;
    if (onProgress) {
      xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    }
    xhr.onload = () => {
      const body = (xhr.response ?? {}) as Partial<SubmitResult> & { reference?: string };
      if (xhr.status >= 200 && xhr.status < 300 && body.ok && body.reference) {
        resolve({ ok: true, reference: body.reference });
        return;
      }
      const failure = body as Extract<SubmitResult, { ok: false }>;
      resolve({
        ok: false,
        status: xhr.status,
        code: failure.code ?? "failed",
        message: failure.message ?? "Something went wrong while sending your enquiry.",
        fieldErrors: failure.fieldErrors,
      });
    };
    const networkError = () =>
      resolve({
        ok: false,
        status: 0,
        code: "network",
        message: "We couldn't reach the server. Please check your connection and try again.",
      });
    xhr.onerror = networkError;
    xhr.ontimeout = networkError;
    xhr.send(data);
  });
}
