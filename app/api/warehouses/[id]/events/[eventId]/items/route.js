import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/mongodb";
import Event from "@/lib/models/Event";
import EventItem from "@/lib/models/EventItem";
import Product from "@/lib/models/Product";
import Supplier from "@/lib/models/Supplier";
import StockMovement from "@/lib/models/StockMovement";
import { requireRole } from "@/lib/apiAuth";

const checkoutSchema = z.discriminatedUnion("source", [
  z.object({
    source: z.literal("warehouse"),
    productId: z.string().trim().min(1, "Choose a product."),
    quantity: z.coerce.number().positive("Enter a quantity greater than zero."),
    notes: z.string().trim().max(500).optional().default(""),
  }),
  z.object({
    source: z.literal("supplier"),
    supplierId: z.string().trim().min(1, "Choose a supplier."),
    name: z.string().trim().min(1, "Enter an item name.").max(200),
    quantity: z.coerce.number().positive("Enter a quantity greater than zero."),
    unitCost: z.coerce.number().min(0).default(0),
    notes: z.string().trim().max(500).optional().default(""),
  }),
]);

export async function POST(req, { params }) {
  const auth = await requireRole(params.id, "editor");
  if (auth.error) return auth.error;

  const body = await req.json().catch(() => ({}));
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
  }

  await dbConnect();
  const event = await Event.findOne({ _id: params.eventId, warehouse: params.id });
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
  if (event.status === "completed") {
    return NextResponse.json({ error: "This event is completed and can't be edited." }, { status: 400 });
  }

  const data = parsed.data;

  if (data.source === "warehouse") {
    const product = await Product.findOne({ _id: data.productId, warehouse: params.id });
    if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    if (data.quantity > product.quantity) {
      return NextResponse.json(
        { error: `Only ${product.quantity} available in stock.` },
        { status: 400 }
      );
    }

    product.quantity -= data.quantity;
    await product.save();

    await StockMovement.create({
      warehouse: params.id,
      product: product._id,
      user: auth.user.id,
      type: "decrease",
      change: -data.quantity,
      quantityAfter: product.quantity,
      reason: `Checked out for event "${event.name}"`,
      productNameSnapshot: product.name,
    });

    const eventItem = await EventItem.create({
      warehouse: params.id,
      event: event._id,
      source: "warehouse",
      product: product._id,
      nameSnapshot: product.name,
      quantityTaken: data.quantity,
      unitCost: product.costPrice,
      notes: data.notes,
      createdBy: auth.user.id,
    });

    return NextResponse.json({ id: eventItem._id.toString() }, { status: 201 });
  }

  const supplier = await Supplier.findOne({ _id: data.supplierId, warehouse: params.id });
  if (!supplier) return NextResponse.json({ error: "Supplier not found." }, { status: 404 });

  const eventItem = await EventItem.create({
    warehouse: params.id,
    event: event._id,
    source: "supplier",
    supplier: supplier._id,
    nameSnapshot: data.name,
    quantityTaken: data.quantity,
    unitCost: data.unitCost,
    notes: data.notes,
    createdBy: auth.user.id,
  });

  return NextResponse.json({ id: eventItem._id.toString() }, { status: 201 });
}
