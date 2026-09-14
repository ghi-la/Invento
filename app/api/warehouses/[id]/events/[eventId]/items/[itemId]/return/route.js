import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/mongodb";
import Event from "@/lib/models/Event";
import EventItem from "@/lib/models/EventItem";
import EventReturn from "@/lib/models/EventReturn";
import Product from "@/lib/models/Product";
import StockMovement from "@/lib/models/StockMovement";
import { requireRole } from "@/lib/apiAuth";

const schema = z.object({
  quantity: z.coerce.number().positive("Enter a quantity greater than zero."),
  note: z.string().trim().max(300).optional().default(""),
});

export async function POST(req, { params }) {
  const auth = await requireRole(params.id, "editor");
  if (auth.error) return auth.error;

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
  }

  await dbConnect();
  const event = await Event.findOne({ _id: params.eventId, warehouse: params.id });
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
  if (event.status === "completed") {
    return NextResponse.json({ error: "This event is completed and can't be edited." }, { status: 400 });
  }

  const eventItem = await EventItem.findOne({ _id: params.itemId, event: params.eventId, warehouse: params.id });
  if (!eventItem) return NextResponse.json({ error: "Item not found." }, { status: 404 });

  const outstanding = eventItem.quantityTaken - eventItem.quantityReturned;
  if (parsed.data.quantity > outstanding) {
    return NextResponse.json(
      { error: `Cannot return more than the outstanding quantity (${outstanding}).` },
      { status: 400 }
    );
  }

  eventItem.quantityReturned += parsed.data.quantity;
  await eventItem.save();

  await EventReturn.create({
    warehouse: params.id,
    event: event._id,
    eventItem: eventItem._id,
    user: auth.user.id,
    quantity: parsed.data.quantity,
    note: parsed.data.note,
  });

  if (eventItem.source === "warehouse") {
    const product = await Product.findOne({ _id: eventItem.product, warehouse: params.id });
    if (product) {
      product.quantity += parsed.data.quantity;
      await product.save();

      await StockMovement.create({
        warehouse: params.id,
        product: product._id,
        user: auth.user.id,
        type: "increase",
        change: parsed.data.quantity,
        quantityAfter: product.quantity,
        reason: `Returned from event "${event.name}"`,
        productNameSnapshot: product.name,
      });
    }
  }

  return NextResponse.json({
    quantityReturned: eventItem.quantityReturned,
    outstanding: eventItem.quantityTaken - eventItem.quantityReturned,
  });
}
