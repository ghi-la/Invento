import { del } from "@vercel/blob";

export function isOwnedBlobUrl(url) {
  if (!url) return false;
  try {
    return new URL(url).hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

/** Best-effort cleanup — never throws, so a blob delete failure can't block a product save/delete. */
export async function deleteBlobIfOwned(url) {
  if (!isOwnedBlobUrl(url)) return;
  try {
    await del(url);
  } catch {
    // orphaned blob is an acceptable outcome; the product mutation already succeeded
  }
}
