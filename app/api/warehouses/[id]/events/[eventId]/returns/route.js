import { NextResponse } from "next/server";
import { requireRole } from "@/lib/apiAuth";
import { listEventReturns } from "@/lib/data/events";

export async function GET(req, { params }) {
  const auth = await requireRole(params.id, "viewer");
  if (auth.error) return auth.error;

  const url = new URL(req.url);
  const limit = Math.min(50, parseInt(url.searchParams.get("limit") || "15", 10));

  const returns = await listEventReturns(params.id, params.eventId, { limit });
  return NextResponse.json({ returns });
}
