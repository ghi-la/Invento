"use client";
import { useState } from "react";
import { usePathname, useRouter, useParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  BottomNavigation,
  BottomNavigationAction,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
  useMediaQuery,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/SpaceDashboard";
import InventoryIcon from "@mui/icons-material/Inventory2";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import CategoryIcon from "@mui/icons-material/Category";
import EventIcon from "@mui/icons-material/Event";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import GroupIcon from "@mui/icons-material/Group";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuIcon from "@mui/icons-material/Menu";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import LogoutIcon from "@mui/icons-material/Logout";
import { useWarehouse } from "./WarehouseContext";
import LanguageSwitcher from "./LanguageSwitcher";

export default function AppShell({ children }) {
  const { t } = useTranslation();
  const { warehouse, role, can } = useWarehouse();
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const wid = params.warehouseId;

  const isMobile = useMediaQuery("(max-width:900px)");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  const nav = [
    { key: "dashboard", label: t("nav.dashboard"), href: `/w/${wid}/dashboard`, icon: <DashboardIcon /> },
    { key: "inventory", label: t("nav.inventory"), href: `/w/${wid}/inventory`, icon: <InventoryIcon /> },
    { key: "scan", label: t("nav.scan"), href: `/w/${wid}/scan`, icon: <QrCodeScannerIcon /> },
    { key: "categories", label: t("nav.categories"), href: `/w/${wid}/categories`, icon: <CategoryIcon /> },
    { key: "events", label: t("nav.events"), href: `/w/${wid}/events`, icon: <EventIcon /> },
    { key: "suppliers", label: t("nav.suppliers"), href: `/w/${wid}/suppliers`, icon: <LocalShippingIcon />, minRole: "editor" },
    { key: "import", label: t("nav.importCsv"), href: `/w/${wid}/import`, icon: <UploadFileIcon />, minRole: "editor" },
    { key: "members", label: t("nav.members"), href: `/w/${wid}/members`, icon: <GroupIcon />, minRole: "admin" },
    { key: "settings", label: t("nav.settings"), href: `/w/${wid}/settings`, icon: <SettingsIcon />, minRole: "admin" },
  ].filter((n) => !n.minRole || can(n.minRole));

  const bottomNavItems = nav.filter((n) => ["dashboard", "inventory", "scan"].includes(n.key));
  const activeBottom = bottomNavItems.findIndex((n) => pathname.startsWith(n.href));

  const drawerContent = (
    <Box sx={{ width: 260, display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {t("nav.warehouseLabel")}
        </Typography>
        <Typography variant="h6" fontWeight={700} noWrap>
          {warehouse?.name}
        </Typography>
        <Chip size="small" label={t(`roles.${role}.label`)} sx={{ mt: 0.5 }} />
      </Box>
      <Divider />
      <List sx={{ flex: 1 }}>
        {nav.map((item) => (
          <ListItemButton
            key={item.href}
            component={Link}
            href={item.href}
            selected={pathname.startsWith(item.href)}
            onClick={() => setDrawerOpen(false)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <List>
        <ListItemButton component={Link} href="/warehouses" onClick={() => setDrawerOpen(false)}>
          <ListItemIcon>
            <SwapHorizIcon />
          </ListItemIcon>
          <ListItemText primary={t("nav.switchWarehouse")} />
        </ListItemButton>
        <ListItemButton onClick={() => signOut({ callbackUrl: "/login" })}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary={t("nav.signOut")} />
        </ListItemButton>
      </List>
      <Box sx={{ p: 2 }}>
        <LanguageSwitcher sx={{ width: "100%" }} />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100dvh", bgcolor: "background.default" }}>
      <AppBar position="fixed" elevation={0}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 1.5 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" fontWeight={700} noWrap sx={{ flex: 1 }}>
            {warehouse?.name || t("nav.warehouseLabel")}
          </Typography>
          <IconButton onClick={(e) => setUserMenuAnchor(e.currentTarget)} sx={{ ml: 1 }}>
            <Avatar
              src={session?.user?.image}
              alt={session?.user?.name}
              sx={{ width: 32, height: 32, bgcolor: "warning.main", color: "primary.main", fontSize: 14 }}
            >
              {session?.user?.name?.[0]?.toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu anchorEl={userMenuAnchor} open={!!userMenuAnchor} onClose={() => setUserMenuAnchor(null)}>
            <MenuItem disabled>{session?.user?.email}</MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                setUserMenuAnchor(null);
                router.push("/warehouses");
              }}
            >
              {t("nav.switchWarehouse")}
            </MenuItem>
            <MenuItem onClick={() => signOut({ callbackUrl: "/login" })}>{t("nav.signOut")}</MenuItem>
            <Divider />
            <Box sx={{ px: 1.5, py: 0.5 }}>
              <LanguageSwitcher size="small" sx={{ width: "100%" }} />
            </Box>
          </Menu>
        </Toolbar>
      </AppBar>

      {isMobile ? (
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: 260,
            flexShrink: 0,
            "& .MuiDrawer-paper": { width: 260, boxSizing: "border-box" },
          }}
        >
          <Toolbar />
          {drawerContent}
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          pb: isMobile ? 9 : 3,
        }}
      >
        <Toolbar />
        <Box sx={{ p: { xs: 1.5, sm: 3 } }}>{children}</Box>
      </Box>

      {isMobile && (
        <BottomNavigation
          showLabels
          value={activeBottom}
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: (t) => t.zIndex.drawer + 1,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          {bottomNavItems.map((item, i) => (
            <BottomNavigationAction
              key={item.href}
              label={item.label}
              icon={
                item.key === "scan" ? (
                  <Box
                    sx={{
                      bgcolor: "warning.main",
                      color: "primary.main",
                      borderRadius: "50%",
                      width: 40,
                      height: 40,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mt: -2,
                      boxShadow: 2,
                    }}
                  >
                    {item.icon}
                  </Box>
                ) : (
                  item.icon
                )
              }
              component={Link}
              href={item.href}
            />
          ))}
        </BottomNavigation>
      )}
    </Box>
  );
}
