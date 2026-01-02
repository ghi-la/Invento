import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Typography,
} from '@mui/material';
import * as React from 'react';

import { loggedUserType } from '@/types/user';

type ToolboxProps = {
  loggedUser: loggedUserType | null;
  open: boolean;
  anchorEl: null | HTMLElement;
  handleProfileClick: (event: React.MouseEvent<HTMLElement>) => void;
  handlePopoverClose: () => void;
  handleLogout: () => void;
  navigate: (path: string) => void;
};

export default function Toolbox({
  loggedUser,
  open,
  anchorEl,
  handleProfileClick,
  handlePopoverClose,
  handleLogout,
  navigate,
}: ToolboxProps) {
  return (
    <Box>
      <Typography
        variant="caption"
        sx={{ px: 1.5, pb: 0.5, display: 'block', color: 'text.secondary' }}
      >
        Account
      </Typography>

      <List dense sx={{ px: 0.5 }}>
        <ListItemButton onClick={handleProfileClick} sx={{ borderRadius: 1.5 }}>
          <ListItemIcon sx={{ minWidth: 34 }}>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={loggedUser?.username || 'Profile'}
            primaryTypographyProps={{ fontSize: 14, fontWeight: 700 }}
          />
        </ListItemButton>

        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handlePopoverClose}
          anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
          transformOrigin={{ vertical: 'center', horizontal: 'left' }}
        >
          <Box sx={{ p: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{ px: 1, py: 0.5, fontWeight: 800 }}
            >
              {loggedUser?.username || 'User'}
            </Typography>
            <Divider sx={{ my: 0.5 }} />
            <List dense>
              <ListItemButton
                onClick={() => {
                  navigate('/profile');
                  handlePopoverClose();
                }}
                sx={{ borderRadius: 1.5 }}
              >
                <ListItemText primary="Profile" />
              </ListItemButton>

              <ListItemButton onClick={handleLogout} sx={{ borderRadius: 1.5 }}>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </List>
          </Box>
        </Popover>

        <ListItemButton
          onClick={() => navigate('/settings')}
          sx={{ borderRadius: 1.5, mt: 0.5 }}
        >
          <ListItemIcon sx={{ minWidth: 34 }}>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Settings"
            primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
          />
        </ListItemButton>
      </List>
    </Box>
  );
}
