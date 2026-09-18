import { NextResponse } from "next/server";
import { SESSION_COOKIE, adminConfigured, checkPassword, cookieOptions, createSessionToken } from "@/lib/admin/auth";
import { clientIp, rateLimited } from "@/lib/server/guards";

export async function POST(request: Request) {
  if (!adminConfigured()) {
    return NextResponse.json({ ok: false, message: "Admin access is not configured on this server." }, { status: 503 });
  }
  if (rateLimited(`admin-login:${clientIp(request)}`)) {
    return NextResponse.json({ ok: false, message: "Too many attempts. Please wait a few minutes." }, { status: 429 });
  }
  const body = (await request.json().catch(() => ({}))) as { password?: unknown };
  const password = typeof body.password === "string" ? body.password : "";
  if (!checkPassword(password)) {
    return NextResponse.json({ ok: false, message: "Incorrect password." }, { status: 401 });
  }
  const { token, maxAge } = createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, cookieOptions(maxAge));
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", cookieOptions(0));
  return res;
}
