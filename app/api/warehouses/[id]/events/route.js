import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/mongodb";
import Event from "@/lib/models/Event";
import { requireRole } from "@/lib/apiAuth";
import { listEvents, listUpcomingEvents } from "@/lib/data/events";

const createSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required.").max(200),
    description: z.string().trim().max(1000).optional().default(""),
    location: z.string().trim().max(120).optional().default(""),
    startDate: z.coerce.date({ errorMap: () => ({ message: "A valid start date is required." }) }),
    endDate: z.coerce.date({ errorMap: () => ({ message: "A valid end date is required." }) }),
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: "End date must be on or after the start date.",
    path: ["endDate"],
  });

export async function GET(req, { params }) {
  const auth = await requireRole(params.id, "viewer");
  if (auth.error) return auth.error;

  const url = new URL(req.url);

  if (url.searchParams.get("upcoming") === "true") {
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const events = await listUpcomingEvents(params.id, { limit });
    return NextResponse.json({ events });
  }

  const q = url.searchParams.get("q")?.trim();
  const status = url.searchParams.get("status");

  const events = await listEvents(params.id, { q, status });
  return NextResponse.json({ events });
}

export async function POST(req, { params }) {
  const auth = await requireRole(params.id, "editor");
  if (auth.error) return auth.error;

  const body = await req.json().catch(() => ({}));
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
  }

  await dbConnect();
  const event = await Event.create({
    ...parsed.data,
    warehouse: params.id,
    createdBy: auth.user.id,
    status: "planning",
  });

  return NextResponse.json({ id: event._id.toString() }, { status: 201 });
}
