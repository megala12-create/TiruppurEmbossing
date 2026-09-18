import { readFile } from "node:fs/promises";
import path from "node:path";
import { MEDIA_DIR } from "@/lib/content/store";

const TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".avif": "image/avif",
};

/**
 * Serves images uploaded from /admin (stored outside /public, because files
 * added to /public after the build are not served in production).
 * File names contain a random id, so they can be cached permanently.
 */
export async function GET(_req: Request, ctx: RouteContext<"/media/[...path]">) {
  const { path: parts } = await ctx.params;
  const name = path.basename(parts.join("/"));
  const type = TYPES[path.extname(name).toLowerCase()];
  if (!type || name !== parts.join("/")) return new Response("Not found", { status: 404 });
  try {
    const data = await readFile(path.join(MEDIA_DIR, name));
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
