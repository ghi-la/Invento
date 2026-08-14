import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import StockMovement from "@/lib/models/StockMovement";
import { requireRole } from "@/lib/apiAuth";

// Either provide `delta` (e.g. +1, -1, +10) to nudge the count, or `set` to type an exact number.
const schema = z
  .object({
    delta: z.coerce.number().optional(),
    set: z.coerce.number().min(0).optional(),
    reason: z.string().trim().max(200).optional().default(""),
  })
  .refine((d) => d.delta !== undefined || d.set !== undefined, {
    message: "Provide a delta or a set value.",
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
  const product = await Product.findOne({ _id: params.productId, warehouse: params.id });
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  const previous = product.quantity;
  let next;
  if (parsed.data.set !== undefined) {
    next = parsed.data.set;
  } else {
    next = Math.max(0, previous + parsed.data.delta);
  }

  product.quantity = next;
  await product.save();

  await StockMovement.create({
    warehouse: params.id,
    product: product._id,
    user: auth.user.id,
    type: next > previous ? "increase" : next < previous ? "decrease" : "set",
    change: next - previous,
    quantityAfter: next,
    reason: parsed.data.reason,
    productNameSnapshot: product.name,
  });

  return NextResponse.json({ quantity: next, lowStock: next <= product.minStockLevel });
}
