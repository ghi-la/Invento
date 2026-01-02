import { logoutUser } from '@/api/user';
import { useAppSelector } from '@/hooks/hooks';
import { triggerAppReload } from '@/hooks/slices/appSlice';
import { Box } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import Navigation from './Navigation';
import Toolbox from './Toolbox';

type NavigationProps = {
  title?: string;
};

// Simple responsive app bar built with MUI
export default function Sidebar({
  title = 'Invento',
}: Readonly<NavigationProps>) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loggedUser = useAppSelector((state: any) => state.app.loggedUser);

  // Popover state
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);

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

  const [workspaces, setWorkspaces] = React.useState<string[]>([
    'No selected workspace',
  ]);
  const [selectedWorkspace, setSelectedWorkspace] = React.useState<string>(
    workspaces[0],
  );

  useEffect(() => {
    // Get workspaces from API or state management
    // For now, we use static data
    if (loggedUser.workspaces) {
      setWorkspaces(loggedUser.workspaces);
      setSelectedWorkspace(
        loggedUser.preferences?.selectedWorkspace || loggedUser.workspaces[0],
      );
    }
  }, []);

  return (
    <AppBar position="static" color="primary">
      <Box>
        <Navigation isLoggedUser={!!loggedUser} />
      </Box>
      <Box>
        <Toolbox
          loggedUser={loggedUser}
          open={open}
          anchorEl={anchorEl}
          handleProfileClick={handleProfileClick}
          handlePopoverClose={handlePopoverClose}
          handleLogout={handleLogout}
          navigate={navigate}
        />
      </Box>
    </AppBar>
  );
}
