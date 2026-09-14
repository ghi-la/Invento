import { dbConnect } from "@/lib/mongodb";
import Invitation from "@/lib/models/Invitation";

export async function listInvitations(warehouseId) {
  await dbConnect();
  const invitations = await Invitation.find({
    warehouse: warehouseId,
    expiresAt: { $gt: new Date() },
  })
    .populate("createdBy", "name")
    .sort({ createdAt: -1 })
    .lean();

  return invitations.map((inv) => ({
    id: inv._id.toString(),
    token: inv.token,
    role: inv.role,
    expiresAt: inv.expiresAt,
    createdByName: inv.createdBy?.name || "",
  }));
}
