import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/mongodb";
import Warehouse from "@/lib/models/Warehouse";
import Membership from "@/lib/models/Membership";
import Product from "@/lib/models/Product";
import { getSessionUser } from "@/lib/apiAuth";

const createSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  description: z.string().trim().max(500).optional().default(""),
  location: z.string().trim().max(200).optional().default(""),
  color: z.string().trim().optional(),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  await dbConnect();
  const memberships = await Membership.find({ user: user.id }).populate("warehouse").lean();

  const warehouses = await Promise.all(
    memberships
      .filter((m) => m.warehouse)
      .map(async (m) => {
        const [productCount, memberCount] = await Promise.all([
          Product.countDocuments({ warehouse: m.warehouse._id }),
          Membership.countDocuments({ warehouse: m.warehouse._id }),
        ]);
        return {
          id: m.warehouse._id.toString(),
          name: m.warehouse.name,
          description: m.warehouse.description,
          location: m.warehouse.location,
          color: m.warehouse.color,
          role: m.role,
          productCount,
          memberCount,
          createdAt: m.warehouse.createdAt,
        };
      })
  );

  warehouses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return NextResponse.json({ warehouses });
}

export async function POST(req) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
  }

  await dbConnect();
  const warehouse = await Warehouse.create({ ...parsed.data, createdBy: user.id });
  await Membership.create({ warehouse: warehouse._id, user: user.id, role: "owner" });

  return NextResponse.json({ id: warehouse._id.toString() }, { status: 201 });
}
