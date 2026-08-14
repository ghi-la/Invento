import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/mongodb";
import Membership from "@/lib/models/Membership";
import { requireRole } from "@/lib/apiAuth";
import { assignableRoles } from "@/lib/permissions";

const patchSchema = z.object({ role: z.enum(["admin", "editor", "viewer"]) });

async function guardTarget(warehouseId, targetUserId, actingRole) {
  await dbConnect();
  const target = await Membership.findOne({ warehouse: warehouseId, user: targetUserId });
  if (!target) return { error: NextResponse.json({ error: "Member not found." }, { status: 404 }) };
  if (target.role === "owner") {
    return { error: NextResponse.json({ error: "The owner's access can't be changed here." }, { status: 403 }) };
  }
  return { target };
}

export async function PATCH(req, { params }) {
  const auth = await requireRole(params.id, "admin");
  if (auth.error) return auth.error;

  const body = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
  }
  if (!assignableRoles(auth.membership.role).includes(parsed.data.role)) {
    return NextResponse.json({ error: "You can't assign that role." }, { status: 403 });
  }

  const guard = await guardTarget(params.id, params.userId, auth.membership.role);
  if (guard.error) return guard.error;

  guard.target.role = parsed.data.role;
  await guard.target.save();
  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const auth = await requireRole(params.id, "admin");
  if (auth.error) return auth.error;

  const guard = await guardTarget(params.id, params.userId, auth.membership.role);
  if (guard.error) return guard.error;

  await Membership.findByIdAndDelete(guard.target._id);
  return NextResponse.json({ ok: true });
}
