import type { Role, Workspace } from '../types/user';

export type Permission =
  | 'items.read'
  | 'items.write'
  | 'items.delete'
  | 'folders.write'
  | 'folders.delete'
  | 'workspace.manage';

const roleMatrix: Record<Role, Record<Permission, boolean>> = {
  owner: {
    'items.read': true,
    'items.write': true,
    'items.delete': true,
    'folders.write': true,
    'folders.delete': true,
    'workspace.manage': true,
  },
  admin: {
    'items.read': true,
    'items.write': true,
    'items.delete': true,
    'folders.write': true,
    'folders.delete': true,
    'workspace.manage': true,
  },
  editor: {
    'items.read': true,
    'items.write': true,
    'items.delete': true,
    'folders.write': true,
    'folders.delete': true,
    'workspace.manage': false,
  },
  viewer: {
    'items.read': true,
    'items.write': false,
    'items.delete': false,
    'folders.write': false,
    'folders.delete': false,
    'workspace.manage': false,
  },
};

export function can(role: Role, perm: Permission) {
  return !!roleMatrix[role][perm];
}

export function getRoleForUser(workspace: Workspace | undefined, userId: string | undefined | null): Role {
  if (!workspace || !userId) return 'viewer';
  return workspace.members.find((m) => m.userId === userId)?.role ?? 'viewer';
}
