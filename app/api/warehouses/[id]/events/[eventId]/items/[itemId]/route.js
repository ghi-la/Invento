import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/mongodb";
import Event from "@/lib/models/Event";
import EventItem from "@/lib/models/EventItem";
import Product from "@/lib/models/Product";
import StockMovement from "@/lib/models/StockMovement";
import { requireRole } from "@/lib/apiAuth";

const patchSchema = z.object({
  notes: z.string().trim().max(500).optional(),
  unitCost: z.coerce.number().min(0).optional(),
});

export async function PATCH(req, { params }) {
  const auth = await requireRole(params.id, "editor");
  if (auth.error) return auth.error;

  const body = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
  }

  await dbConnect();
  const eventItem = await EventItem.findOne({ _id: params.itemId, event: params.eventId, warehouse: params.id });
  if (!eventItem) return NextResponse.json({ error: "Item not found." }, { status: 404 });

  Object.assign(eventItem, parsed.data);
  await eventItem.save();

  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const auth = await requireRole(params.id, "editor");
  if (auth.error) return auth.error;

  await dbConnect();
  const event = await Event.findOne({ _id: params.eventId, warehouse: params.id });
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
  if (event.status === "completed") {
    return NextResponse.json({ error: "This event is completed and can't be edited." }, { status: 400 });
  }

  const eventItem = await EventItem.findOne({ _id: params.itemId, event: params.eventId, warehouse: params.id });
  if (!eventItem) return NextResponse.json({ error: "Item not found." }, { status: 404 });
  if (eventItem.quantityReturned > 0) {
    return NextResponse.json(
      { error: "Record a return instead of deleting once returns have started." },
      { status: 400 }
    );
  }

  if (eventItem.source === "warehouse") {
    const product = await Product.findOne({ _id: eventItem.product, warehouse: params.id });
    if (product) {
      product.quantity += eventItem.quantityTaken;
      await product.save();

      await StockMovement.create({
        warehouse: params.id,
        product: product._id,
        user: auth.user.id,
        type: "increase",
        change: eventItem.quantityTaken,
        quantityAfter: product.quantity,
        reason: "Event item removed",
        productNameSnapshot: product.name,
      });
    }
  }

  await EventItem.deleteOne({ _id: eventItem._id });
  return NextResponse.json({ ok: true });
}
