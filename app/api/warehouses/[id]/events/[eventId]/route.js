import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/mongodb";
import Event from "@/lib/models/Event";
import EventItem from "@/lib/models/EventItem";
import { requireRole } from "@/lib/apiAuth";
import { getEventDetail } from "@/lib/data/events";

const patchSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(1000).optional(),
  location: z.string().trim().max(120).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  // Completing an event must go through the dedicated /close route, since
  // that's what triggers the shortage write-off — never allowed here.
  status: z.enum(["planning", "active"]).optional(),
});

export async function GET(req, { params }) {
  const auth = await requireRole(params.id, "viewer");
  if (auth.error) return auth.error;

  const event = await getEventDetail(params.id, params.eventId, auth.membership.role);
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  return NextResponse.json(event);
}

export async function PATCH(req, { params }) {
  const auth = await requireRole(params.id, "editor");
  if (auth.error) return auth.error;

  const body = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
  }

  await dbConnect();
  const event = await Event.findOne({ _id: params.eventId, warehouse: params.id });
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
  if (event.status === "completed") {
    return NextResponse.json({ error: "This event is completed and can't be edited." }, { status: 400 });
  }

  const data = { ...parsed.data };
  if (data.startDate || data.endDate) {
    const nextStart = data.startDate || event.startDate;
    const nextEnd = data.endDate || event.endDate;
    if (nextEnd < nextStart) {
      return NextResponse.json({ error: "End date must be on or after the start date." }, { status: 400 });
    }
  }

  Object.assign(event, data);
  await event.save();

  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const auth = await requireRole(params.id, "editor");
  if (auth.error) return auth.error;

  await dbConnect();
  const itemCount = await EventItem.countDocuments({ event: params.eventId });
  if (itemCount > 0) {
    return NextResponse.json({ error: "Remove all event items first." }, { status: 409 });
  }

  const event = await Event.findOneAndDelete({ _id: params.eventId, warehouse: params.id });
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  return NextResponse.json({ ok: true });
}
