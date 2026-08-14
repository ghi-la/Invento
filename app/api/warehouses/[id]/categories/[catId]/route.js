import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/mongodb";
import Category from "@/lib/models/Category";
import Product from "@/lib/models/Product";
import { requireRole } from "@/lib/apiAuth";

const patchSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  parent: z.string().trim().nullable().optional(),
  color: z.string().trim().optional(),
});

export async function PATCH(req, { params }) {
  const auth = await requireRole(params.id, "editor");
  if (auth.error) return auth.error;

  const body = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
  }
  if (parsed.data.parent === params.catId) {
    return NextResponse.json({ error: "A category can't be its own parent." }, { status: 400 });
  }

  await dbConnect();
  await Category.findOneAndUpdate({ _id: params.catId, warehouse: params.id }, parsed.data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const auth = await requireRole(params.id, "editor");
  if (auth.error) return auth.error;

  await dbConnect();
  const [childCount, productCount] = await Promise.all([
    Category.countDocuments({ parent: params.catId }),
    Product.countDocuments({ category: params.catId }),
  ]);
  if (childCount > 0) {
    return NextResponse.json({ error: "Move or delete its subcategories first." }, { status: 409 });
  }
  if (productCount > 0) {
    return NextResponse.json(
      { error: `${productCount} product(s) use this category. Reassign them first.` },
      { status: 409 }
    );
  }

  await Category.findOneAndDelete({ _id: params.catId, warehouse: params.id });
  return NextResponse.json({ ok: true });
}
