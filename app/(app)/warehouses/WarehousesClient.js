"use client";
import { useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTranslation } from "react-i18next";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Alert,
  Skeleton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function WarehousesClient({ userName, userImage }) {
  const { t } = useTranslation();
  const { data, isLoading, mutate } = useSWR("/api/warehouses");
  const router = useRouter();
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <Box sx={{ minHeight: "100dvh", bgcolor: "background.default" }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1.5,
              bgcolor: "warning.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mr: 1.5,
            }}
          >
            <Inventory2Icon sx={{ color: "primary.main", fontSize: 20 }} />
          </Box>
          <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>
            {t("warehouses.title")}
          </Typography>
          <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
            <Avatar src={userImage} sx={{ width: 32, height: 32, bgcolor: "warning.main", color: "primary.main" }}>
              {userName?.[0]?.toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
            <MenuItem disabled>{userName}</MenuItem>
            <Divider />
            <MenuItem onClick={() => signOut({ callbackUrl: "/login" })}>{t("nav.signOut")}</MenuItem>
            <Divider />
            <Box sx={{ px: 1.5, py: 0.5 }}>
              <LanguageSwitcher size="small" sx={{ width: "100%" }} />
            </Box>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4, pb: 12 }}>
        {isLoading && (
          <Grid container spacing={2}>
            {[1, 2, 3].map((i) => (
              <Grid item xs={12} sm={6} key={i}>
                <Skeleton variant="rounded" height={120} />
              </Grid>
            ))}
          </Grid>
        )}

        {!isLoading && data?.warehouses?.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <WarehouseIcon sx={{ fontSize: 56, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" fontWeight={700}>
              {t("warehouses.emptyTitle")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t("warehouses.emptyBody")}
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
              {t("warehouses.createButton")}
            </Button>
          </Box>
        )}

        <Grid container spacing={2}>
          {data?.warehouses?.map((w) => (
            <Grid item xs={12} sm={6} key={w.id}>
              <Card>
                <CardActionArea onClick={() => router.push(`/w/${w.id}/dashboard`)}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1.5,
                          bgcolor: w.color || "warning.main",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 1.5,
                        }}
                      >
                        <WarehouseIcon sx={{ color: "primary.main" }} />
                      </Box>
                      <Chip size="small" label={t(`roles.${w.role}.label`)} />
                    </Stack>
                    <Typography variant="h6" fontWeight={700} noWrap>
                      {w.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap sx={{ minHeight: 20 }}>
                      {w.location || w.description || "\u00A0"}
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ mt: 1.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {t("warehouses.itemCount", { count: w.productCount })}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t("warehouses.memberCount", { count: w.memberCount })}
                      </Typography>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Fab
        color="warning"
        onClick={() => setCreateOpen(true)}
        sx={{ position: "fixed", bottom: 24, right: 24 }}
      >
        <AddIcon sx={{ color: "primary.main" }} />
      </Fab>

      <CreateWarehouseDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(id) => {
          mutate();
          router.push(`/w/${id}/dashboard`);
        }}
      />
    </Box>
  );
}

function CreateWarehouseDialog({ open, onClose, onCreated }) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/warehouses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, location, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("warehouses.errors.createFailed"));
      setName("");
      setLocation("");
      setDescription("");
      onCreated(data.id);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{t("warehouses.dialogTitle")}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <TextField
            label={t("common.fields.name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            fullWidth
            required
          />
          <TextField
            label={t("warehouses.locationOptional")}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            fullWidth
            placeholder={t("warehouses.locationPlaceholder")}
          />
          <TextField
            label={t("warehouses.descriptionOptional")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            minRows={2}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>{t("common.cancel")}</Button>
        <Button variant="contained" disabled={!name.trim() || saving} onClick={handleCreate}>
          {saving ? t("warehouses.creating") : t("warehouses.create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
