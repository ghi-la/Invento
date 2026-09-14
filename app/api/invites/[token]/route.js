import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Invitation from "@/lib/models/Invitation";
import Membership from "@/lib/models/Membership";
import { getSessionUser } from "@/lib/apiAuth";

async function loadValidInvitation(token) {
  await dbConnect();
  const invitation = await Invitation.findOne({ token }).populate("warehouse", "name").lean();
  if (!invitation) return { error: NextResponse.json({ error: "Invite link not found." }, { status: 404 }) };
  if (!invitation.warehouse) return { error: NextResponse.json({ error: "Invite link not found." }, { status: 404 }) };
  if (invitation.expiresAt.getTime() <= Date.now()) {
    return { error: NextResponse.json({ error: "This invite link has expired." }, { status: 410 }) };
  }
  return { invitation };
}

export async function GET(req, { params }) {
  const result = await loadValidInvitation(params.token);
  if (result.error) return result.error;
  const { invitation } = result;

  return NextResponse.json({
    warehouseId: invitation.warehouse._id.toString(),
    warehouseName: invitation.warehouse.name,
    role: invitation.role,
  });
}

export async function POST(req, { params }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const result = await loadValidInvitation(params.token);
  if (result.error) return result.error;
  const { invitation } = result;

  const existing = await Membership.findOne({ warehouse: invitation.warehouse._id, user: user.id });
  if (existing) {
    return NextResponse.json({ ok: true, alreadyMember: true, warehouseId: invitation.warehouse._id.toString() });
  }

  await Membership.create({
    warehouse: invitation.warehouse._id,
    user: user.id,
    role: invitation.role,
    invitedBy: invitation.createdBy,
  });

  return NextResponse.json({ ok: true, alreadyMember: false, warehouseId: invitation.warehouse._id.toString() });
}
