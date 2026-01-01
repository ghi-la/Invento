import { logoutUser } from '@/api/user';
import { useAppSelector } from '@/hooks/hooks';
import { triggerAppReload } from '@/hooks/slices/appSlice';
import SettingsIcon from '@mui/icons-material/Settings';
import {
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Popover,
} from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Typography from '@mui/material/Typography';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { paths } from '../../app/paths';

type NavigationProps = {
  title?: string;
};

// Simple responsive app bar built with MUI
export default function Navigation({
  title = 'Invento',
}: Readonly<NavigationProps>) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
    const loggedUser = useAppSelector((state) => state.app.loggedUser);
    
    const [routes, setRoutes] = React.useState(paths);

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
    
    useEffect(() => {
        // You can add any side effects related to navigation here if needed
        if (loggedUser) {
            const filteredRoutes = paths.filter(route => route.isLoggedInRequired === true);
            setRoutes(filteredRoutes);
        } else {
            const filteredRoutes = paths.filter(route => route.isLoggedInRequired === false);
            setRoutes(filteredRoutes);
        }
    }, [loggedUser]);

  return (
    <AppBar position="static" color="primary">
      <Box>
        <Typography variant="h6" sx={{ flexGrow: 1, padding: 2 }}>
          {title}
        </Typography>
        <List>
          {routes.map((route) => (
            <ListItem
              key={route.path}
              onClick={() => {
                navigate(route.path);
              }}
            >
              <ListItemIcon>
                {/* You can add icons here if needed */}
              </ListItemIcon>
              <ListItemText primary={route.name} />
            </ListItem>
          ))}
        </List>
      </Box>
      <Box>
        <List>
          <ListItem onClick={handleProfileClick}>
            <ListItemIcon>
              {/* You can add icons here if needed */}
            </ListItemIcon>
            <ListItemText primary={loggedUser?.username || 'Profile'} />
          </ListItem>
          <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={handlePopoverClose}
            anchorOrigin={{
              vertical: 'center',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'center',
              horizontal: 'left',
            }}
          >
            <Box sx={{ p: 2, minWidth: 160 }}>
              <List dense>
                <ListItem
                  onClick={() => {
                    navigate('/profile');
                    handlePopoverClose();
                  }}
                >
                  <ListItemText primary="Profile" />
                </ListItem>
                <ListItem
                  onClick={() => {
                    navigate('/settings');
                    handlePopoverClose();
                  }}
                >
                  <ListItemText primary="Settings" />
                </ListItem>
                <ListItem onClick={handleLogout}>
                  <ListItemText primary="Logout" />
                </ListItem>
              </List>
            </Box>
          </Popover>
          <ListItem
            onClick={() => {
              navigate('/settings');
            }}
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
        </List>
      </Box>
    </AppBar>
  );
}
