"use client";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Box,
  Typography,
  Stack,
  Card,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { useWarehouse } from "@/components/WarehouseContext";

export default function SuppliersClient({ initialSuppliers }) {
  const { t } = useTranslation();
  const { warehouseId } = useParams();
  const { can } = useWarehouse();
  const { data, isLoading, mutate } = useSWR(`/api/warehouses/${warehouseId}/suppliers`, {
    fallbackData: initialSuppliers ? { suppliers: initialSuppliers } : undefined,
  });
  const [dialog, setDialog] = useState(null); // { mode: "create"|"edit", supplier }
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const suppliers = data?.suppliers || [];

  async function handleDelete(id) {
    setError("");
    setDeleting(true);
    try {
      const res = await fetch(`/api/warehouses/${warehouseId}/suppliers/${id}`, { method: "DELETE" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error || t("suppliers.errors.deleteFailed"));
      } else {
        mutate();
      }
      setConfirmDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Box sx={{ maxWidth: 640, mx: "auto" }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          {t("suppliers.title")}
        </Typography>
        {can("editor") && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog({ mode: "create" })}>
            {t("suppliers.newButton")}
          </Button>
        )}
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {!isLoading && suppliers.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <LocalShippingIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" fontWeight={700}>
            {t("suppliers.emptyTitle")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("suppliers.emptyBody")}
          </Typography>
        </Box>
      )}

      {isLoading && (
        <Card>
          <List disablePadding>
            {Array.from({ length: 4 }).map((_, i) => (
              <ListItem key={i}>
                <ListItemIcon>
                  <Skeleton variant="circular" width={20} height={20} />
                </ListItemIcon>
                <ListItemText
                  primary={<Skeleton variant="text" width="40%" />}
                  secondary={<Skeleton variant="text" width="25%" />}
                />
              </ListItem>
            ))}
          </List>
        </Card>
      )}

      {!isLoading && suppliers.length > 0 && (
        <Card>
          <List disablePadding>
            {suppliers.map((s) => (
              <ListItem
                key={s.id}
                secondaryAction={
                  can("editor") && (
                    <Stack direction="row" spacing={0.5}>
                      <IconButton size="small" onClick={() => setDialog({ mode: "edit", supplier: s })}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => setConfirmDelete(s)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  )
                }
              >
                <ListItemIcon>
                  <LocalShippingIcon color="disabled" />
                </ListItemIcon>
                <ListItemText
                  primary={s.name}
                  secondary={[s.contactName, s.email, s.phone].filter(Boolean).join(" · ") || undefined}
                />
              </ListItem>
            ))}
          </List>
        </Card>
      )}

      <SupplierDialog
        warehouseId={warehouseId}
        state={dialog}
        onClose={() => setDialog(null)}
        onSaved={() => {
          mutate();
          setDialog(null);
        }}
      />

      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>{t("suppliers.deleteConfirmTitle", { name: confirmDelete?.name })}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {t("suppliers.deleteConfirmBody")}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmDelete(null)} disabled={deleting}>
            {t("common.cancel")}
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : null}
            onClick={() => handleDelete(confirmDelete.id)}
          >
            {deleting ? t("common.deleting") : t("common.delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function SupplierDialog({ warehouseId, state, onClose, onSaved }) {
  const { t } = useTranslation();
  const editing = state?.mode === "edit";
  const [name, setName] = useState(state?.supplier?.name || "");
  const [contactName, setContactName] = useState(state?.supplier?.contactName || "");
  const [email, setEmail] = useState(state?.supplier?.email || "");
  const [phone, setPhone] = useState(state?.supplier?.phone || "");
  const [notes, setNotes] = useState(state?.supplier?.notes || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(state?.supplier?.name || "");
    setContactName(state?.supplier?.contactName || "");
    setEmail(state?.supplier?.email || "");
    setPhone(state?.supplier?.phone || "");
    setNotes(state?.supplier?.notes || "");
  }, [state]);

  async function handleSave() {
    setError("");
    setSaving(true);
    try {
      const url = editing
        ? `/api/warehouses/${warehouseId}/suppliers/${state.supplier.id}`
        : `/api/warehouses/${warehouseId}/suppliers`;
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, contactName, email, phone, notes }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error || t("suppliers.errors.saveFailed"));
        return;
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={!!state} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{editing ? t("suppliers.editTitle") : t("suppliers.newTitle")}</DialogTitle>
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
          />
          <TextField
            label={t("suppliers.fields.contactName")}
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            fullWidth
          />
          <TextField
            label={t("suppliers.fields.email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
          <TextField
            label={t("suppliers.fields.phone")}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth
          />
          <TextField
            label={t("common.fields.description")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            minRows={2}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          {t("common.cancel")}
        </Button>
        <Button
          variant="contained"
          disabled={!name.trim() || saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          onClick={handleSave}
        >
          {saving ? t("common.saving") : t("common.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
