import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { dbConnect } from "@/lib/mongodb";
import Membership from "@/lib/models/Membership";
import { hasAtLeast } from "@/lib/permissions";
import { listMembers } from "@/lib/data/members";
import { listInvitations } from "@/lib/data/invitations";
import RoleGuard from "@/components/RoleGuard";
import MembersClient from "./MembersClient";

export default async function MembersPage({ params }) {
  const session = await getServerSession(authOptions);
  await dbConnect();
  const membership = await Membership.findOne({
    warehouse: params.warehouseId,
    user: session.user.id,
  }).lean();

  // Only prefetch member/invitation data server-side once we've confirmed
  // admin+ access ourselves — RoleGuard alone only hides the UI client-side,
  // it wouldn't stop this data from already being embedded in the response.
  let initialMembers;
  let initialInvitations;
  if (hasAtLeast(membership?.role, "admin")) {
    [initialMembers, initialInvitations] = await Promise.all([
      listMembers(params.warehouseId, session.user.id),
      listInvitations(params.warehouseId),
    ]);
  }

  return (
    <RoleGuard minRole="admin">
      <MembersClient initialMembers={initialMembers} initialInvitations={initialInvitations} />
    </RoleGuard>
  );
}
