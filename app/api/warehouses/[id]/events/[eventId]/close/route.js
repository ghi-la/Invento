import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Event from "@/lib/models/Event";
import EventItem from "@/lib/models/EventItem";
import Product from "@/lib/models/Product";
import StockMovement from "@/lib/models/StockMovement";
import { requireRole } from "@/lib/apiAuth";

export async function POST(req, { params }) {
  const auth = await requireRole(params.id, "editor");
  if (auth.error) return auth.error;

  await dbConnect();
  const event = await Event.findOne({ _id: params.eventId, warehouse: params.id });
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
  if (event.status === "completed") {
    return NextResponse.json({ error: "This event is already completed." }, { status: 400 });
  }

  const items = await EventItem.find({ event: event._id });
  const shortages = [];

  for (const item of items) {
    const outstanding = item.quantityTaken - item.quantityReturned;
    if (outstanding <= 0) continue;

    item.shortageQuantity = outstanding;
    item.reconciledAt = new Date();

    if (item.source === "warehouse") {
      const product = await Product.findOne({ _id: item.product, warehouse: params.id });
      if (product) {
        const previous = product.quantity;
        product.quantity = Math.max(0, previous - outstanding);
        await product.save();

        await StockMovement.create({
          warehouse: params.id,
          product: product._id,
          user: auth.user.id,
          type: "decrease",
          change: product.quantity - previous,
          quantityAfter: product.quantity,
          reason: `Shortage/loss — event "${event.name}"`,
          productNameSnapshot: product.name,
        });
      }
    }

    await item.save();
    shortages.push({ itemId: item._id.toString(), name: item.nameSnapshot, quantity: outstanding });
  }

  event.status = "completed";
  event.closedAt = new Date();
  event.closedBy = auth.user.id;
  await event.save();

  return NextResponse.json({ ok: true, shortages });
}
