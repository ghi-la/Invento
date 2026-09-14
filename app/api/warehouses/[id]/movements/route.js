import { NextResponse } from "next/server";
import { requireRole } from "@/lib/apiAuth";
import { listMovements } from "@/lib/data/movements";

export async function GET(req, { params }) {
  const auth = await requireRole(params.id, "viewer");
  if (auth.error) return auth.error;

  const url = new URL(req.url);
  const limit = Math.min(50, parseInt(url.searchParams.get("limit") || "15", 10));
  const productId = url.searchParams.get("product");

  const movements = await listMovements(params.id, { productId, limit });
  return NextResponse.json({ movements });
}
