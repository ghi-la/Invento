import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireRole } from "@/lib/apiAuth";

// Cold starts on this route stack a fresh MongoDB connection (inside requireRole)
// on top of the blob upload itself, which can occasionally outrun the platform's
// default function timeout. Give it more headroom than that default.
export const maxDuration = 30;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
// A correctly resized product photo should land around 15-40KB — this ceiling
// only exists to catch a bypassed/failed client-side resize, not to constrain normal use.
const MAX_SIZE = 1 * 1024 * 1024;

export async function POST(req, { params }) {
  const auth = await requireRole(params.id, "editor");
  if (auth.error) return auth.error;

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported image type." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Image is too large." }, { status: 400 });
  }

  try {
    const blob = await put(`products/${params.id}/${crypto.randomUUID()}.jpg`, file, {
      access: "public",
      contentType: file.type,
    });
    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("Blob upload failed:", err);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
