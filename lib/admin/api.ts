import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { sanitizeText } from "@/lib/forms/schema";
import { isAdmin } from "./auth";
import { UploadError } from "./media";

export const fail = (status: number, message: string) => NextResponse.json({ ok: false, message }, { status });
export const ok = (data: Record<string, unknown> = {}) => NextResponse.json({ ok: true, ...data });

/** Wraps an admin route handler: requires a valid session and maps errors to JSON. */
export function adminRoute<Args extends unknown[]>(handler: (...args: Args) => Promise<Response>) {
  return async (...args: Args) => {
    if (!(await isAdmin())) return fail(401, "Your session has expired. Please sign in again.");
    try {
      return await handler(...args);
    } catch (err) {
      if (err instanceof UploadError) return fail(422, err.message);
      console.error("[admin]", err);
      return fail(500, "Something went wrong while saving. Please try again.");
    }
  };
}

/** Regenerates every public page so admin changes appear immediately. */
export const revalidateSite = () => revalidatePath("/", "layout");

export const text = (form: FormData, key: string, max: number, multiline = false) =>
  sanitizeText(form.get(key), max, multiline);

export const fileFrom = (form: FormData, key: string) => {
  const v = form.get(key);
  return v && typeof v !== "string" && v.size > 0 ? v : null;
};
