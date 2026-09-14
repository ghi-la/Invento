import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/mongodb";
import Supplier from "@/lib/models/Supplier";
import EventItem from "@/lib/models/EventItem";
import { requireRole } from "@/lib/apiAuth";

const patchSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  contactName: z.string().trim().max(120).optional(),
  email: z.string().trim().max(200).optional(),
  phone: z.string().trim().max(60).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export async function PATCH(req, { params }) {
  const auth = await requireRole(params.id, "editor");
  if (auth.error) return auth.error;

  const body = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
  }

  await dbConnect();
  await Supplier.findOneAndUpdate({ _id: params.supplierId, warehouse: params.id }, parsed.data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const auth = await requireRole(params.id, "editor");
  if (auth.error) return auth.error;

  await dbConnect();
  const eventItemCount = await EventItem.countDocuments({ supplier: params.supplierId });
  if (eventItemCount > 0) {
    return NextResponse.json(
      { error: `${eventItemCount} event item(s) reference this supplier.` },
      { status: 409 }
    );
  }

  await Supplier.findOneAndDelete({ _id: params.supplierId, warehouse: params.id });
  return NextResponse.json({ ok: true });
}
