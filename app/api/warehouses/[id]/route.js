import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/mongodb";
import Warehouse from "@/lib/models/Warehouse";
import Membership from "@/lib/models/Membership";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import StockMovement from "@/lib/models/StockMovement";
import DashboardLayout from "@/lib/models/DashboardLayout";
import Invitation from "@/lib/models/Invitation";
import { requireRole } from "@/lib/apiAuth";

const updateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(500).optional(),
  location: z.string().trim().max(200).optional(),
  color: z.string().trim().optional(),
});

export async function GET(req, { params }) {
  const auth = await requireRole(params.id, "viewer");
  if (auth.error) return auth.error;

  await dbConnect();
  const warehouse = await Warehouse.findById(params.id).lean();
  if (!warehouse) return NextResponse.json({ error: "Warehouse not found." }, { status: 404 });

  return NextResponse.json({
    id: warehouse._id.toString(),
    name: warehouse.name,
    description: warehouse.description,
    location: warehouse.location,
    color: warehouse.color,
    role: auth.membership.role,
  });
}

export async function PATCH(req, { params }) {
  const auth = await requireRole(params.id, "admin");
  if (auth.error) return auth.error;

  const body = await req.json().catch(() => ({}));
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
  }

  await dbConnect();
  await Warehouse.findByIdAndUpdate(params.id, parsed.data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const auth = await requireRole(params.id, "owner");
  if (auth.error) return auth.error;

  await dbConnect();
  await Promise.all([
    Warehouse.findByIdAndDelete(params.id),
    Membership.deleteMany({ warehouse: params.id }),
    Product.deleteMany({ warehouse: params.id }),
    Category.deleteMany({ warehouse: params.id }),
    StockMovement.deleteMany({ warehouse: params.id }),
    DashboardLayout.deleteMany({ warehouse: params.id }),
    Invitation.deleteMany({ warehouse: params.id }),
  ]);

  return NextResponse.json({ ok: true });
}
