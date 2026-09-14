import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/mongodb";
import Membership from "@/lib/models/Membership";
import User from "@/lib/models/User";
import { requireRole } from "@/lib/apiAuth";
import { assignableRoles } from "@/lib/permissions";
import { listMembers } from "@/lib/data/members";

const addSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email."),
  role: z.enum(["admin", "editor", "viewer"]),
});

export async function GET(req, { params }) {
  const auth = await requireRole(params.id, "viewer");
  if (auth.error) return auth.error;

  const members = await listMembers(params.id, auth.user.id);
  return NextResponse.json({ members, myRole: auth.membership.role });
}

export async function POST(req, { params }) {
  const auth = await requireRole(params.id, "admin");
  if (auth.error) return auth.error;

  const body = await req.json().catch(() => ({}));
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
  }
  const { email, role } = parsed.data;

  if (!assignableRoles(auth.membership.role).includes(role)) {
    return NextResponse.json({ error: "You can't assign that role." }, { status: 403 });
  }

  await dbConnect();
  const targetUser = await User.findOne({ email });
  if (!targetUser) {
    return NextResponse.json(
      { error: "No account with that email yet. Ask them to sign up first, then add them." },
      { status: 404 }
    );
  }

  const existing = await Membership.findOne({ warehouse: params.id, user: targetUser._id });
  if (existing) {
    return NextResponse.json({ error: "That person is already a member." }, { status: 409 });
  }

  await Membership.create({
    warehouse: params.id,
    user: targetUser._id,
    role,
    invitedBy: auth.user.id,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
