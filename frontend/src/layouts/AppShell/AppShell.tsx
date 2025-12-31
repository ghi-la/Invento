import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import CommandPalette from '@/components/CommandPalette/CommandPalette';
import { navItems } from './nav';

import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import {
  AppBar,
  Box,
  Chip,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputAdornment,
  InputBase,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';

import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { switchWorkspace } from '@/hooks/slices/authSlice';
import { usePermissions } from '@/auth/usePermissions';

const DRAWER_WIDTH = 280;

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { workspace, role, has } = usePermissions();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const isEditable = (el: EventTarget | null) => {
      const node = el as HTMLElement | null;
      if (!node) return false;
      const tag = node.tagName?.toLowerCase();
      return (
        tag === 'input' ||
        tag === 'textarea' ||
        (node as any).isContentEditable ||
        node.getAttribute?.('role') === 'textbox'
      );
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes('mac');
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'k') {
        if (isEditable(e.target)) return;
        e.preventDefault();
        setPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const activePath = useMemo(() => location.pathname, [location.pathname]);

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 2, py: 2 }}>
        <Typography fontWeight={900} letterSpacing={0.2}>
          Invento
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Workspace inventory
        </Typography>
      </Box>

      <Divider />

      <List sx={{ px: 1 }}>
        {navItems.map((item) => {
          const selected = activePath.startsWith(item.to);
          const isSettings = item.to === '/settings';
          const disabled = isSettings && !has('workspace.manage');

          return (
            <Tooltip
              key={item.to}
              title={disabled ? 'Requires admin/owner role' : ''}
              disableHoverListener={!disabled}
              placement="right"
            >
              <Box component="span">
                <ListItemButton
                  selected={selected}
                  disabled={disabled}
                  onClick={() => {
                    if (disabled) {
                      navigate('/denied');
                      return;
                    }
                    navigate(item.to);
                    setMobileOpen(false);
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </Box>
            </Tooltip>
          );
        })}
      </List>

      <Box sx={{ flex: 1 }} />
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Tip: Press <b>⌘K</b> / <b>Ctrl K</b>
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar sx={{ gap: 1.5 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Workspace switcher */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={workspace?.id ?? ''}
              onChange={(e) => dispatch(switchWorkspace(String(e.target.value)))}
              displayEmpty
              renderValue={() => workspace?.name ?? 'Select workspace'}
            >
              {/* Options are in Redux auth state; CommandPalette also consumes them */}
              {/** We'll let the palette manage the full list; here we keep a simple selector by reading from palette data later */}
              <WorkspaceOptions />
            </Select>
          </FormControl>

          <Chip size="small" label={role} sx={{ textTransform: 'capitalize' }} />

          <Box sx={{ flex: 1 }} />

          <InputBase
            placeholder="Search… (⌘K)"
            sx={{
              px: 1.5,
              py: 0.5,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              width: { xs: 160, sm: 260, md: 360 },
            }}
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            }
            onFocus={() => setPaletteOpen(true)}
          />
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
        <Toolbar />
        <Outlet />
      </Box>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </Box>
  );
}

/**
 * Small helper component to render workspace options.
 */
function WorkspaceOptions() {
  const workspaces = useAppSelector((s) => s.auth.workspaces);

  return (
    <>
      {(workspaces ?? []).map((w) => (
        <MenuItem key={w.id} value={w.id}>
          {w.name}
        </MenuItem>
      ))}
    </>
  );
}
