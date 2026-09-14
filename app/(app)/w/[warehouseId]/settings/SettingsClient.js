"use client";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Skeleton,
  Autocomplete,
} from "@mui/material";
import { useWarehouse } from "@/components/WarehouseContext";
import { CURRENCY_CODES, currencyName, currencySymbol } from "@/lib/currency";

const SWATCHES = ["#F2A93B", "#5B7FDB", "#2E7D32", "#D64545", "#9C27B0", "#00897B"];

export default function SettingsClient({ initialWarehouse }) {
  const { t } = useTranslation();
  const { warehouseId } = useParams();
  const router = useRouter();
  const { role } = useWarehouse();
  const { data, isLoading, mutate } = useSWR(`/api/warehouses/${warehouseId}`, {
    fallbackData: initialWarehouse || undefined,
  });

  const [name, setName] = useState(initialWarehouse?.name || "");
  const [location, setLocation] = useState(initialWarehouse?.location || "");
  const [description, setDescription] = useState(initialWarehouse?.description || "");
  const [color, setColor] = useState(initialWarehouse?.color || SWATCHES[0]);
  const [currency, setCurrency] = useState(initialWarehouse?.currency || CURRENCY_CODES[0]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (data) {
      setName(data.name || "");
      setLocation(data.location || "");
      setDescription(data.description || "");
      setColor(data.color || SWATCHES[0]);
      setCurrency(data.currency || CURRENCY_CODES[0]);
    }
  }, [data]);

  async function handleSave() {
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      const res = await fetch(`/api/warehouses/${warehouseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, location, description, color, currency }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error || t("settings.errors.saveFailed"));
        return;
      }
      mutate();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetch(`/api/warehouses/${warehouseId}`, { method: "DELETE" });
      router.push("/warehouses");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Box sx={{ maxWidth: 560, mx: "auto" }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        {t("settings.title")}
      </Typography>

      <Card>
        <CardContent sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {saved && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {t("settings.saved")}
            </Alert>
          )}
          {isLoading ? (
            <Stack spacing={2}>
              <Skeleton variant="rounded" height={56} />
              <Skeleton variant="rounded" height={56} />
              <Skeleton variant="rounded" height={80} />
              <Skeleton variant="rounded" height={56} />
              <Skeleton variant="rounded" width={140} height={20} />
              <Skeleton variant="rounded" width={120} height={36} />
            </Stack>
          ) : (
            <Stack spacing={2}>
              <TextField
                label={t("common.fields.name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
              />
              <TextField
                label={t("common.fields.location")}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                fullWidth
              />
              <TextField
                label={t("common.fields.description")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                minRows={2}
                fullWidth
              />
              <Autocomplete
                disableClearable
                options={CURRENCY_CODES}
                value={currency}
                onChange={(e, val) => setCurrency(val)}
                getOptionLabel={(code) => `${code} — ${currencyName(code)} (${currencySymbol(code)})`}
                renderInput={(params) => <TextField {...params} label={t("settings.currency")} fullWidth />}
              />
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {t("settings.accentColor")}
                </Typography>
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
              </Box>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
                sx={{ alignSelf: "flex-start" }}
              >
                {saving ? t("common.saving") : t("common.saveChanges")}
              </Button>
            </Stack>
          )}
        </CardContent>
      </Card>

      {role === "owner" && (
        <Card sx={{ mt: 3, borderColor: "error.main" }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} color="error.main">
              {t("settings.dangerZoneTitle")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t("settings.dangerZoneBody")}
            </Typography>
            <Button color="error" variant="outlined" onClick={() => setConfirmDelete(true)}>
              {t("settings.deleteButton")}
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} fullWidth maxWidth="xs">
        <DialogTitle>{t("settings.deleteConfirmTitle", { name: data?.name })}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("settings.deleteConfirmBody")}
          </Typography>
          <TextField
            fullWidth
            placeholder={data?.name}
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmDelete(false)}>{t("common.cancel")}</Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleteConfirmText !== data?.name || deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : null}
            onClick={handleDelete}
          >
            {deleting ? t("common.deleting") : t("settings.deletePermanently")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
