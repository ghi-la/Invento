import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";
import { dbConnect } from "@/lib/mongodb";
import Membership from "@/lib/models/Membership";
import { hasAtLeast } from "@/lib/permissions";

/**
 * Resolves the current session user. Returns null if not authenticated.
 */
export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session.user;
}

/**
 * Ensures the current user is signed in AND has at least `role` on `warehouseId`.
 * Returns { user, membership } on success, or throws a Response-like object
 * (use the `error` property to short-circuit route handlers) on failure.
 *
 * Usage:
 *   const auth = await requireRole(warehouseId, "editor");
 *   if (auth.error) return auth.error;
 *   const { user, membership } = auth;
 */
export async function requireRole(warehouseId, role = "viewer") {
  const user = await getSessionUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Not authenticated." }, { status: 401 }) };
  }
  await dbConnect();
  const membership = await Membership.findOne({ warehouse: warehouseId, user: user.id }).lean();
  if (!membership) {
    return { error: NextResponse.json({ error: "Not a member of this warehouse." }, { status: 403 }) };
  }
  if (!hasAtLeast(membership.role, role)) {
    return {
      error: NextResponse.json(
        { error: `This action requires ${role} access or higher.` },
        { status: 403 }
      ),
    };
  }
  return { user, membership };
}
