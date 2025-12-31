export type appState = {
  notification: {
        open: boolean;
      autohideDuration: number | null;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
    },
    loggedUser: {
        id: string;
        username: string;
        email: string;
        role: 'admin' | 'user';
    };
};