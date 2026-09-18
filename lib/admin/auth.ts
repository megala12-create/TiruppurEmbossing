/**
 * Admin authentication (server only).
 *
 * Password comes from ADMIN_PASSWORD (set in .env.local, never in source).
 * A successful login sets an httpOnly, signed session cookie valid for 8 hours.
 */

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "te_admin";
const SESSION_HOURS = 8;

const password = () => process.env.ADMIN_PASSWORD ?? "";

/** Signing key: ADMIN_SESSION_SECRET, or derived from the password so changing it logs everyone out. */
const key = () => process.env.ADMIN_SESSION_SECRET || createHash("sha256").update(`te-admin:${password()}`).digest("hex");

const sign = (value: string) => createHmac("sha256", key()).update(value).digest("base64url");

const safeEqual = (a: string, b: string) => {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
};

export const adminConfigured = () => password().length > 0;

export const checkPassword = (input: string) => adminConfigured() && safeEqual(input, password());

export function createSessionToken() {
  const exp = Date.now() + SESSION_HOURS * 3600_000;
  return { token: `v1.${exp}.${sign(`v1.${exp}`)}`, maxAge: SESSION_HOURS * 3600 };
}

export function verifySessionToken(token: string | undefined) {
  if (!token || !adminConfigured()) return false;
  const [v, exp, sig] = token.split(".");
  if (v !== "v1" || !exp || !sig) return false;
  if (!safeEqual(sig, sign(`v1.${exp}`))) return false;
  return Number(exp) > Date.now();
}

export async function isAdmin() {
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}

export const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge,
});
