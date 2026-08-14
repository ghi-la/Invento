import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/mongodb";
import Category from "@/lib/models/Category";
import Product from "@/lib/models/Product";
import { requireRole } from "@/lib/apiAuth";

const createSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(80),
  parent: z.string().trim().nullable().optional(),
  color: z.string().trim().optional(),
});

export async function GET(req, { params }) {
  const auth = await requireRole(params.id, "viewer");
  if (auth.error) return auth.error;

  await dbConnect();
  const categories = await Category.find({ warehouse: params.id }).sort({ name: 1 }).lean();

  // Per-category product counts (scoped to this warehouse)
  const counts = await Product.aggregate([
    { $match: { warehouse: auth.membership.warehouse, category: { $ne: null } } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c._id?.toString(), c.count]));

  return NextResponse.json({
    categories: categories.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      parent: c.parent ? c.parent.toString() : null,
      color: c.color,
      productCount: countMap[c._id.toString()] || 0,
    })),
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
  const category = await Category.create({
    warehouse: params.id,
    name: parsed.data.name,
    parent: parsed.data.parent || null,
    color: parsed.data.color || "#5B7FDB",
  });

  return NextResponse.json({ id: category._id.toString() }, { status: 201 });
}
