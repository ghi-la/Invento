import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Invitation from "@/lib/models/Invitation";
import { requireRole } from "@/lib/apiAuth";

export async function DELETE(req, { params }) {
  const auth = await requireRole(params.id, "admin");
  if (auth.error) return auth.error;

  await dbConnect();
  const invitation = await Invitation.findOne({ _id: params.invitationId, warehouse: params.id });
  if (!invitation) {
    return NextResponse.json({ error: "Invite link not found." }, { status: 404 });
  }

  await Invitation.deleteOne({ _id: invitation._id });
  return NextResponse.json({ ok: true });
}
