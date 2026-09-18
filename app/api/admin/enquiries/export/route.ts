import { adminRoute } from "@/lib/admin/api";
import { listEnquiries } from "@/lib/admin/enquiries";

const COLUMNS = [
  ["reference", "Reference"],
  ["submittedAt", "Submitted (IST)"],
  ["kind", "Type"],
  ["status", "Status"],
  ["name", "Name"],
  ["company", "Company"],
  ["phone", "Phone / WhatsApp"],
  ["email", "Email"],
  ["serviceTitle", "Service"],
  ["subService", "Variation"],
  ["quantity", "Quantity"],
  ["fabric", "Fabric"],
  ["placement", "Placement"],
  ["deliveryDate", "Target date"],
  ["needSample", "Need sample"],
  ["requirements", "Requirements"],
  ["message", "Message"],
  ["attachments", "Attachments"],
] as const;

/** Escapes a CSV cell and neutralises spreadsheet formula injection. */
const cell = (value: string) => {
  let v = value.replace(/\r?\n/g, " ");
  // Plain phone numbers (e.g. +91 98403 37054) cannot be formulas; leave them as-is.
  if (/^[=+\-@\t]/.test(v) && !/^\+?[\d\s()-]+$/.test(v)) v = `'${v}`;
  return `"${v.replace(/"/g, '""')}"`;
};

const ist = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });

export const GET = adminRoute(async () => {
  const rows = (await listEnquiries()).map((e) => {
    const values: Record<string, string> = {
      reference: e.reference,
      submittedAt: ist(e.submittedAt),
      kind: e.kind === "quote" ? "Quote" : "Contact",
      status: e.status,
      attachments: e.attachments.map((a) => a.name).join("; "),
    };
    for (const [k, v] of Object.entries(e.fields)) values[k] = Array.isArray(v) ? v.join(", ") : String(v ?? "");
    return COLUMNS.map(([key]) => cell(values[key] ?? "")).join(",");
  });
  const csv = "﻿" + [COLUMNS.map(([, label]) => cell(label)).join(","), ...rows].join("\r\n");
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="enquiries-${date}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
});
