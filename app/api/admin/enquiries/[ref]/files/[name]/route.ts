import { readFile } from "node:fs/promises";
import path from "node:path";
import { adminRoute, fail } from "@/lib/admin/api";
import { attachmentPath } from "@/lib/admin/enquiries";

const TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
};

/** Admin-only download of an enquiry attachment. Images/PDFs open inline; other files download. */
export const GET = adminRoute(async (request: Request, ctx: RouteContext<"/api/admin/enquiries/[ref]/files/[name]">) => {
  const { ref, name } = await ctx.params;
  const file = await attachmentPath(ref, decodeURIComponent(name));
  if (!file) return fail(404, "File not found.");
  const ext = path.extname(file).toLowerCase();
  const inline = ext in TYPES && !new URL(request.url).searchParams.has("download");
  const data = await readFile(file);
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": TYPES[ext] ?? "application/octet-stream",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${path.basename(file).replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      // Uploaded files are untrusted: never let them run scripts.
      "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",
    },
  });
});
