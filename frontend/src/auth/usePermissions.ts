import { useMemo } from 'react';
import { useAppSelector } from '../hooks/hooks';
import { can, getRoleForUser, type Permission } from './permissions';

export function usePermissions() {
  const { currentUser, workspaces, activeWorkspaceId } = useAppSelector((s) => s.auth);
  const workspace = useMemo(
    () => workspaces.find((w) => w.id === activeWorkspaceId) ?? undefined,
    [workspaces, activeWorkspaceId]
  );
  const role = useMemo(
    () => getRoleForUser(workspace, currentUser?.id),
    [workspace, currentUser?.id]
  );

  const has = (perm: Permission) => can(role, perm);

  return { workspace, role, has };
}
