/**
 * Image processing for admin uploads (server only).
 * Every upload is decoded with sharp (rejecting anything that is not a real
 * image), auto-rotated, resized to a web-friendly size and saved as WebP.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { MEDIA_DIR, type StoredImage } from "@/lib/content/store";

export const ADMIN_UPLOAD = {
  maxBytes: 20 * 1024 * 1024,
  accept: ["image/jpeg", "image/png", "image/webp", "image/avif"],
  acceptAttr: ".jpg,.jpeg,.png,.webp,.avif",
  maxDimension: 2400,
};

export class UploadError extends Error {}

export async function saveUploadedImage(file: File, prefix: string, alt: string): Promise<StoredImage> {
  if (file.size === 0) throw new UploadError("The selected file is empty.");
  if (file.size > ADMIN_UPLOAD.maxBytes) throw new UploadError("Photos must be 20 MB or smaller.");
  if (file.type && !ADMIN_UPLOAD.accept.includes(file.type)) {
    throw new UploadError("Please upload a JPG, PNG, WebP or AVIF photo.");
  }

  let output: { data: Buffer; info: { width: number; height: number } };
  try {
    output = await sharp(Buffer.from(await file.arrayBuffer()), { failOn: "error" })
      .rotate()
      .resize({ width: ADMIN_UPLOAD.maxDimension, height: ADMIN_UPLOAD.maxDimension, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
  } catch {
    throw new UploadError("That file could not be read as an image.");
  }

  const safePrefix = prefix.toLowerCase().replace(/[^a-z0-9-]+/g, "-").slice(0, 60);
  const name = `${safePrefix}-${crypto.randomUUID().slice(0, 8)}.webp`;
  await mkdir(MEDIA_DIR, { recursive: true });
  await writeFile(path.join(MEDIA_DIR, name), output.data);

  return { src: `/media/${name}`, width: output.info.width, height: output.info.height, alt };
}
