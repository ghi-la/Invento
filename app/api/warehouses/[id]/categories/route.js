import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/mongodb";
import Category from "@/lib/models/Category";
import { requireRole } from "@/lib/apiAuth";
import { listCategories } from "@/lib/data/categories";

const createSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(80),
  parent: z.string().trim().nullable().optional(),
  color: z.string().trim().optional(),
});

export async function GET(req, { params }) {
  const auth = await requireRole(params.id, "viewer");
  if (auth.error) return auth.error;

  const categories = await listCategories(params.id);
  return NextResponse.json({ categories });
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
