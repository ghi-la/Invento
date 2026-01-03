import { Box, CssBaseline, Toolbar } from '@mui/material';
import * as React from 'react';
import SideNav from './SideNav/SideNav';
import TopBar from './TopBar/TopBar';

const DRAWER_WIDTH = 280;

type AppShellProps = {
  children: React.ReactNode;
  title?: string;
};

export default function AppShell({
  children,
  title = 'Invento',
}: Readonly<AppShellProps>) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const openMobileNav = () => setMobileOpen(true);
  const closeMobileNav = () => setMobileOpen(false);

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <CssBaseline />

      <TopBar
        title={title}
        drawerWidth={DRAWER_WIDTH}
        onOpenMobileNav={openMobileNav}
      />

      <SideNav
        title={title}
        drawerWidth={DRAWER_WIDTH}
        mobileOpen={mobileOpen}
        onCloseMobileNav={closeMobileNav}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
