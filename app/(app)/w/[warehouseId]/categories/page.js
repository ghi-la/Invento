"use client";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CategoryIcon from "@mui/icons-material/Category";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import { useWarehouse } from "@/components/WarehouseContext";

const SWATCHES = ["#5B7FDB", "#F2A93B", "#2E7D32", "#D64545", "#9C27B0", "#00897B", "#5C6673"];

export default function CategoriesPage() {
  const { t } = useTranslation();
  const { warehouseId } = useParams();
  const { can } = useWarehouse();
  const { data, isLoading, mutate } = useSWR(`/api/warehouses/${warehouseId}/categories`);
  const [dialog, setDialog] = useState(null); // { mode: "create"|"edit", category }
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const categories = data?.categories || [];
  const tree = useMemo(() => {
    const top = categories.filter((c) => !c.parent);
    return top.map((c) => ({ ...c, children: categories.filter((sub) => sub.parent === c.id) }));
  }, [categories]);

  async function handleDelete(id) {
    setError("");
    setDeleting(true);
    try {
      const res = await fetch(`/api/warehouses/${warehouseId}/categories/${id}`, { method: "DELETE" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error || t("categories.errors.deleteFailed"));
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
          {t("categories.title")}
        </Typography>
        {can("editor") && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog({ mode: "create" })}>
            {t("categories.newButton")}
          </Button>
        )}
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {!isLoading && tree.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <CategoryIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" fontWeight={700}>
            {t("categories.emptyTitle")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("categories.emptyBody")}
          </Typography>
        </Box>
      )}

      {isLoading && (
        <Card>
          <List disablePadding>
            {Array.from({ length: 4 }).map((_, i) => (
              <ListItem key={i}>
                <ListItemIcon>
                  <Skeleton variant="circular" width={14} height={14} />
                </ListItemIcon>
                <ListItemText
                  primary={<Skeleton variant="text" width="40%" />}
                  secondary={<Skeleton variant="text" width="20%" />}
                />
              </ListItem>
            ))}
          </List>
        </Card>
      )}

      {!isLoading && tree.length > 0 && (
      <Card>
        <List disablePadding>
          {tree.map((cat) => (
            <Box key={cat.id}>
              <ListItem
                secondaryAction={
                  can("editor") && (
                    <Stack direction="row" spacing={0.5}>
                      <IconButton size="small" onClick={() => setDialog({ mode: "edit", category: cat })}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => setConfirmDelete(cat)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  )
                }
              >
                <ListItemIcon>
                  <Box sx={{ width: 14, height: 14, borderRadius: "50%", bgcolor: cat.color }} />
                </ListItemIcon>
                <ListItemText
                  primary={cat.name}
                  secondary={t("categories.productCount", { count: cat.productCount })}
                />
              </ListItem>
              {cat.children.map((sub) => (
                <ListItem
                  key={sub.id}
                  sx={{ pl: 5 }}
                  secondaryAction={
                    can("editor") && (
                      <Stack direction="row" spacing={0.5}>
                        <IconButton size="small" onClick={() => setDialog({ mode: "edit", category: sub })}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => setConfirmDelete(sub)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    )
                  }
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <SubdirectoryArrowRightIcon fontSize="small" color="disabled" />
                  </ListItemIcon>
                  <ListItemText
                    primary={sub.name}
                    secondary={t("categories.productCount", { count: sub.productCount })}
                  />
                </ListItem>
              ))}
            </Box>
          ))}
        </List>
      </Card>
      )}

      <CategoryDialog
        warehouseId={warehouseId}
        state={dialog}
        topLevel={tree}
        onClose={() => setDialog(null)}
        onSaved={() => {
          mutate();
          setDialog(null);
        }}
      />

      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>{t("categories.deleteConfirmTitle", { name: confirmDelete?.name })}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {t("categories.deleteConfirmBody")}
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

function CategoryDialog({ warehouseId, state, topLevel, onClose, onSaved }) {
  const { t } = useTranslation();
  const editing = state?.mode === "edit";
  const [name, setName] = useState(state?.category?.name || "");
  const [parent, setParent] = useState(state?.category?.parent || "");
  const [color, setColor] = useState(state?.category?.color || SWATCHES[0]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // reset fields whenever a new dialog target opens
  useEffect(() => {
    setName(state?.category?.name || "");
    setParent(state?.category?.parent || "");
    setColor(state?.category?.color || SWATCHES[0]);
  }, [state]);

  async function handleSave() {
    setError("");
    setSaving(true);
    try {
      const url = editing
        ? `/api/warehouses/${warehouseId}/categories/${state.category.id}`
        : `/api/warehouses/${warehouseId}/categories`;
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, parent: parent || null, color }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error || t("categories.errors.saveFailed"));
        return;
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={!!state} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{editing ? t("categories.editTitle") : t("categories.newTitle")}</DialogTitle>
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
          <FormControl fullWidth>
            <InputLabel>{t("categories.parentLabel")}</InputLabel>
            <Select value={parent} label={t("categories.parentLabel")} onChange={(e) => setParent(e.target.value)}>
              <MenuItem value="">{t("categories.noParent")}</MenuItem>
              {topLevel
                .filter((c) => c.id !== state?.category?.id)
                .map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <Stack direction="row" spacing={1}>
            {SWATCHES.map((sw) => (
              <Box
                key={sw}
                onClick={() => setColor(sw)}
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  bgcolor: sw,
                  cursor: "pointer",
                  border: color === sw ? "2px solid black" : "2px solid transparent",
                }}
              />
            ))}
          </Stack>
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
