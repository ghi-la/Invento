import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import StockMovement from "@/lib/models/StockMovement";
import { requireRole } from "@/lib/apiAuth";

// A cold serverless invocation establishing a fresh MongoDB connection can
// occasionally outrun the platform's default function timeout; give it more room.
export const maxDuration = 30;

const createSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(200),
  sku: z.string().trim().max(100).optional().default(""),
  barcode: z.string().trim().max(100).optional().default(""),
  description: z.string().trim().max(1000).optional().default(""),
  category: z.string().trim().nullable().optional(),
  unit: z.string().trim().max(30).optional().default("pcs"),
  itemsPerBox: z.coerce.number().min(0).optional().default(0),
  quantity: z.coerce.number().min(0).default(0),
  minStockLevel: z.coerce.number().min(0).default(0),
  costPrice: z.coerce.number().min(0).default(0),
  sellPrice: z.coerce.number().min(0).default(0),
  location: z.string().trim().max(120).optional().default(""),
  imageUrl: z.string().trim().max(1000).optional().default(""),
  notes: z.string().trim().max(2000).optional().default(""),
});

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req, { params }) {
  const auth = await requireRole(params.id, "viewer");
  if (auth.error) return auth.error;

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();
  const category = url.searchParams.get("category");
  const lowStockOnly = url.searchParams.get("lowStock") === "true";
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "25", 10)));
  const sort = url.searchParams.get("sort") || "-createdAt";

  const filter = { warehouse: params.id };
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ name: rx }, { sku: rx }, { barcode: rx }, { location: rx }];
  }
  if (category) filter.category = category;

  await dbConnect();
  // Low-stock is a comparison between two fields on the same document, so it's
  // applied in-memory after the fetch rather than as a Mongo query operator.
  const all = await Product.find(filter).populate("category", "name color").sort(sort).lean();
  const filtered = lowStockOnly ? all.filter((p) => p.quantity <= p.minStockLevel) : all;

  const total = filtered.length;
  const start = (page - 1) * limit;
  const pageItems = filtered.slice(start, start + limit);

  return NextResponse.json({
    products: pageItems.map(serialize),
    total,
    page,
    limit,
    myRole: auth.membership.role,
  });
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
  const data = { ...parsed.data, warehouse: params.id, createdBy: auth.user.id };
  if (!data.category) data.category = null;

  const product = await Product.create(data);
  await StockMovement.create({
    warehouse: params.id,
    product: product._id,
    user: auth.user.id,
    type: "create",
    change: product.quantity,
    quantityAfter: product.quantity,
    reason: "Product created",
    productNameSnapshot: product.name,
  });

  return NextResponse.json({ id: product._id.toString() }, { status: 201 });
}

function serialize(p) {
  return {
    id: p._id.toString(),
    name: p.name,
    sku: p.sku,
    barcode: p.barcode,
    description: p.description,
    category: p.category ? { id: p.category._id.toString(), name: p.category.name, color: p.category.color } : null,
    unit: p.unit,
    itemsPerBox: p.itemsPerBox,
    quantity: p.quantity,
    minStockLevel: p.minStockLevel,
    costPrice: p.costPrice,
    sellPrice: p.sellPrice,
    location: p.location,
    imageUrl: p.imageUrl,
    notes: p.notes,
    lowStock: p.quantity <= p.minStockLevel,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}
