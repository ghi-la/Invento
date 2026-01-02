import { loggedUserType } from '@/types/user';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Popover,
} from '@mui/material';
import React from 'react';

type ToolboxProps = {
  loggedUser: loggedUserType | null;
  open: boolean;
  anchorEl: null | HTMLElement;
  handleProfileClick: (event: React.MouseEvent<HTMLElement>) => void;
  handlePopoverClose: () => void;
  handleLogout: () => void;
  navigate: (path: string) => void;
};

const Toolbox: React.FC<ToolboxProps> = ({
  loggedUser,
  open,
  anchorEl,
  handleProfileClick,
  handlePopoverClose,
  handleLogout,
  navigate,
}) => (
  <List>
    <ListItem onClick={handleProfileClick}>
      <ListItemIcon>
        <PersonIcon />
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
);

export default Toolbox;
