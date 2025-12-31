export type Role = 'owner' | 'admin' | 'editor' | 'viewer';

export type User = {
  id: string;
  name: string;
  email: string;
};

export type WorkspaceMember = {
  userId: string;
  role: Role;
};

export type Workspace = {
  id: string;
  name: string;
  members: WorkspaceMember[];
};
