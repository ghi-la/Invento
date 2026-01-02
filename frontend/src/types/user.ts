export type loggedUserType = {
  id: string;
  username: string;
  email: string;
  workspaces?: string[];
  preferences?: {
    theme: 'light' | 'dark';
    selectedWorkspace: string;
  };
  role: 'admin' | 'user';
};
