import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import StockMovement from "@/lib/models/StockMovement";
import { requireRole } from "@/lib/apiAuth";
import { deleteBlobIfOwned } from "@/lib/blob";

// A cold serverless invocation establishing a fresh MongoDB connection can
// occasionally outrun the platform's default function timeout; give it more room.
export const maxDuration = 30;

const patchSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  sku: z.string().trim().max(100).optional(),
  barcode: z.string().trim().max(100).optional(),
  description: z.string().trim().max(1000).optional(),
  category: z.string().trim().nullable().optional(),
  unit: z.string().trim().max(30).optional(),
  itemsPerBox: z.coerce.number().min(0).optional(),
  quantity: z.coerce.number().min(0).optional(),
  minStockLevel: z.coerce.number().min(0).optional(),
  costPrice: z.coerce.number().min(0).optional(),
  sellPrice: z.coerce.number().min(0).optional(),
  location: z.string().trim().max(120).optional(),
  imageUrl: z.string().trim().max(1000).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export async function GET(req, { params }) {
  const auth = await requireRole(params.id, "viewer");
  if (auth.error) return auth.error;

  await dbConnect();
  const product = await Product.findOne({ _id: params.productId, warehouse: params.id })
    .populate("category", "name color")
    .lean();
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  return NextResponse.json({
    id: product._id.toString(),
    name: product.name,
    sku: product.sku,
    barcode: product.barcode,
    description: product.description,
    category: product.category
      ? { id: product.category._id.toString(), name: product.category.name, color: product.category.color }
      : null,
    unit: product.unit,
    itemsPerBox: product.itemsPerBox,
    quantity: product.quantity,
    minStockLevel: product.minStockLevel,
    costPrice: product.costPrice,
    sellPrice: product.sellPrice,
    location: product.location,
    imageUrl: product.imageUrl,
    notes: product.notes,
    lowStock: product.quantity <= product.minStockLevel,
    myRole: auth.membership.role,
  });
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
  const product = await Product.findOne({ _id: params.productId, warehouse: params.id });
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  const data = { ...parsed.data };
  if ("category" in data && !data.category) data.category = null;

  const quantityChanged = "quantity" in data && data.quantity !== product.quantity;
  const previousQuantity = product.quantity;
  const previousImageUrl = product.imageUrl;
  const imageChanged = "imageUrl" in data && data.imageUrl !== previousImageUrl;

  Object.assign(product, data);
  await product.save();

  if (imageChanged) {
    await deleteBlobIfOwned(previousImageUrl);
  }

  if (quantityChanged) {
    await StockMovement.create({
      warehouse: params.id,
      product: product._id,
      user: auth.user.id,
      type: "set",
      change: product.quantity - previousQuantity,
      quantityAfter: product.quantity,
      reason: "Manual edit",
      productNameSnapshot: product.name,
    });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const auth = await requireRole(params.id, "editor");
  if (auth.error) return auth.error;

  await dbConnect();
  const product = await Product.findOneAndDelete({ _id: params.productId, warehouse: params.id });
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  await deleteBlobIfOwned(product.imageUrl);

  await StockMovement.create({
    warehouse: params.id,
    product: product._id,
    user: auth.user.id,
    type: "delete",
    change: -product.quantity,
    quantityAfter: 0,
    reason: "Product deleted",
    productNameSnapshot: product.name,
  });

  return NextResponse.json({ ok: true });
}
