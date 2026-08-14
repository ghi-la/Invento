export const ROLE_RANK = { viewer: 0, editor: 1, admin: 2, owner: 3 };

// Labels/descriptions live in the i18n translation files under `roles.*` —
// look them up with t(`roles.${role}.label`) / t(`roles.${role}.description`).
export const ROLE_KEYS = ["owner", "admin", "editor", "viewer"];

/** Returns true if `role` grants at least `required` privilege level. */
export function hasAtLeast(role, required) {
  if (!role) return false;
  return (ROLE_RANK[role] ?? -1) >= (ROLE_RANK[required] ?? Infinity);
}

/** Roles below `role` that this role is allowed to assign to others (owner/admin only). */
export function assignableRoles(role) {
  if (role === "owner") return ["admin", "editor", "viewer"];
  if (role === "admin") return ["editor", "viewer"];
  return [];
}
