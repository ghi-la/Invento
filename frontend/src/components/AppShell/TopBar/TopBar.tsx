import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import {
  AppBar,
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';

type TopBarProps = {
  title: string;
  drawerWidth: number;
  onOpenMobileNav: () => void;
};

export default function TopBar({
  title,
  drawerWidth,
  onOpenMobileNav,
}: TopBarProps) {
  // Placeholders (as requested)
  const handleNotificationsClick = () => {
    throw new Error('Notifications click handler not implemented');
  };
  const handleAccountClick = () => {
    throw new Error('Account click handler not implemented');
  };

  return (
    <AppBar
      position="fixed"
      color="default"
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <IconButton
          edge="start"
          onClick={onOpenMobileNav}
          sx={{ display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 0.2 }}>
          {title}
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <TextField
          variant="outlined"
          size="small"
          placeholder="Search…"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            width: { xs: 140, sm: 220, md: 340 },
            '& .MuiOutlinedInput-root': { bgcolor: 'background.default' },
          }}
        />

        {/* <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            aria-label="notifications"
            onClick={handleNotificationsClick}
          >
            <NotificationsIcon />
          </IconButton>
          <IconButton aria-label="account" onClick={handleAccountClick}>
            <AccountCircleIcon />
          </IconButton>
        </Box> */}
      </Toolbar>
    </AppBar>
  );
}
