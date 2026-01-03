import { Box, Divider, Drawer, Toolbar, Typography } from '@mui/material';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';

import { useAppSelector } from '@/hooks/hooks';
import { triggerAppReload } from '@/hooks/slices/appSlice';
import { logoutUser } from '@/lib/user';

import Navigation from './Navigation';
import Toolbox from './Toolbox';

type SideNavProps = {
  title: string;
  drawerWidth: number;
  mobileOpen: boolean;
  onCloseMobileNav: () => void;
};

export default function SideNav({
  title,
  drawerWidth,
  mobileOpen,
  onCloseMobileNav,
}: SideNavProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loggedUser = useAppSelector((state: any) => state.app.loggedUser);

  // Popover state (kept)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);

  // Logout logic (kept)
  const handleLogout = () => {
    logoutUser()
      .then(() => {
        localStorage.removeItem('token');
        dispatch(triggerAppReload());
        navigate('/login');
      })
      .catch((error) => {
        console.error('Logout failed:', error);
      });
  };

  // Workspace logic preserved (even if not rendered)
  const [workspaces, setWorkspaces] = React.useState<string[]>([
    'No selected workspace',
  ]);
  const [selectedWorkspace, setSelectedWorkspace] = React.useState<string>(
    workspaces[0],
  );

  React.useEffect(() => {
    if (loggedUser?.workspaces) {
      setWorkspaces(loggedUser.workspaces);
      setSelectedWorkspace(
        loggedUser.preferences?.selectedWorkspace || loggedUser.workspaces[0],
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
          {title}
        </Typography>
      </Toolbar>

      <Divider />

      <Box sx={{ px: 1, py: 1 }}>
        {/* ✅ closes drawer after navigation on mobile */}
        <Navigation isLoggedUser={!!loggedUser} onNavigate={onCloseMobileNav} />
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      <Divider />

      <Box sx={{ px: 1, py: 1 }}>
        <Toolbox
          loggedUser={loggedUser}
          open={open}
          anchorEl={anchorEl}
          handleProfileClick={handleProfileClick}
          handlePopoverClose={handlePopoverClose}
          handleLogout={() => {
            // Optional: close drawer on logout from mobile for cleaner UX
            onCloseMobileNav();
            handleLogout();
          }}
          navigate={(path: string) => {
            navigate(path);
            onCloseMobileNav();
          }}
        />
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      aria-label="sidebar navigation"
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onCloseMobileNav}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRightColor: 'divider',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
