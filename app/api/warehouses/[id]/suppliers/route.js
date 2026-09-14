import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/mongodb";
import Supplier from "@/lib/models/Supplier";
import { requireRole } from "@/lib/apiAuth";
import { listSuppliers } from "@/lib/data/suppliers";

const createSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  contactName: z.string().trim().max(120).optional().default(""),
  email: z.string().trim().max(200).optional().default(""),
  phone: z.string().trim().max(60).optional().default(""),
  notes: z.string().trim().max(1000).optional().default(""),
});

export async function GET(req, { params }) {
  const auth = await requireRole(params.id, "viewer");
  if (auth.error) return auth.error;

  const suppliers = await listSuppliers(params.id);
  return NextResponse.json({ suppliers });
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
  const supplier = await Supplier.create({ ...parsed.data, warehouse: params.id });

  return NextResponse.json({ id: supplier._id.toString() }, { status: 201 });
}
