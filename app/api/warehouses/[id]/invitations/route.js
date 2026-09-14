import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/mongodb";
import Invitation from "@/lib/models/Invitation";
import { requireRole } from "@/lib/apiAuth";
import { assignableRoles } from "@/lib/permissions";
import { listInvitations } from "@/lib/data/invitations";

const INVITE_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

const createSchema = z.object({
  role: z.enum(["admin", "editor", "viewer"]),
});

export async function GET(req, { params }) {
  const auth = await requireRole(params.id, "admin");
  if (auth.error) return auth.error;

  const invitations = await listInvitations(params.id);
  return NextResponse.json({ invitations });
}

export async function POST(req, { params }) {
  const auth = await requireRole(params.id, "admin");
  if (auth.error) return auth.error;

  const body = await req.json().catch(() => ({}));
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
  }
  const { role } = parsed.data;

  if (!assignableRoles(auth.membership.role).includes(role)) {
    return NextResponse.json({ error: "You can't assign that role." }, { status: 403 });
  }

  await dbConnect();
  const invitation = await Invitation.create({
    warehouse: params.id,
    role,
    createdBy: auth.user.id,
    expiresAt: new Date(Date.now() + INVITE_LIFETIME_MS),
  });

  return NextResponse.json(
    {
      id: invitation._id.toString(),
      token: invitation.token,
      role: invitation.role,
      expiresAt: invitation.expiresAt,
      createdByName: auth.user.name,
    },
    { status: 201 }
  );
}
