import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import { useState } from 'react';

const InventoAppBar = () => {
  const [isMobileOpen, setMobileOpen] = useState(false);

  return (
    <Box
      sx={{
        flexGrow: 1,
        backgroundColor: 'primary.main',
        color: 'primary.contrastText',
        height: 64,
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={() => setMobileOpen(!isMobileOpen)}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Invento
        </Typography>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search..."
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
          sx={{ width: { xs: '100px', sm: '200px', md: '300px' } }}
        />
        <Box sx={{ ml: 2 }}>
          <IconButton color="inherit">
            <NotificationsIcon />
          </IconButton>
          <IconButton color="inherit">
            <AccountCircleIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </Box>
  );
};

export default InventoAppBar;
