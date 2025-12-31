import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Role, User, Workspace } from '../../types/user';

export type AuthState = {
  currentUser: User | null;
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
};

const demoUser: User = { id: 'u-me', name: 'Matteo', email: 'matteo@example.com' };

const initialState: AuthState = {
  currentUser: demoUser,
  workspaces: [
    {
      id: 'w-lab',
      name: 'Lab Inventory',
      members: [
        { userId: 'u-me', role: 'owner' },
        { userId: 'u-anna', role: 'editor' },
        { userId: 'u-luca', role: 'viewer' },
      ],
    },
    {
      id: 'w-dept',
      name: 'Department',
      members: [
        { userId: 'u-me', role: 'admin' },
        { userId: 'u-sara', role: 'editor' },
      ],
    },
  ],
  activeWorkspaceId: 'w-lab',
};

function setMemberRole(workspaces: Workspace[], workspaceId: string, userId: string, role: Role) {
  const ws = workspaces.find((w) => w.id === workspaceId);
  if (!ws) return;
  const m = ws.members.find((mm) => mm.userId === userId);
  if (m) m.role = role;
  else ws.members.push({ userId, role });
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    switchWorkspace(state, action: PayloadAction<string>) {
      state.activeWorkspaceId = action.payload;
    },
    setRoleForUser(
      state,
      action: PayloadAction<{ workspaceId: string; userId: string; role: Role }>
    ) {
      setMemberRole(state.workspaces, action.payload.workspaceId, action.payload.userId, action.payload.role);
    },
    setCurrentUser(state, action: PayloadAction<User | null>) {
      state.currentUser = action.payload;
    },
  },
});

export const { switchWorkspace, setRoleForUser, setCurrentUser } = authSlice.actions;
export default authSlice.reducer;
