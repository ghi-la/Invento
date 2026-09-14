import { dbConnect } from "@/lib/mongodb";
import Membership from "@/lib/models/Membership";

export async function listMembers(warehouseId, selfUserId) {
  await dbConnect();
  const memberships = await Membership.find({ warehouse: warehouseId })
    .populate("user", "name email image")
    .sort({ createdAt: 1 })
    .lean();

  return memberships
    .filter((m) => m.user)
    .map((m) => ({
      membershipId: m._id.toString(),
      userId: m.user._id.toString(),
      name: m.user.name,
      email: m.user.email,
      image: m.user.image,
      role: m.role,
      isSelf: m.user._id.toString() === selfUserId,
    }));
}
