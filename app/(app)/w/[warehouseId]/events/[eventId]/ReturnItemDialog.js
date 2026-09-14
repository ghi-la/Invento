"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";

export default function ReturnItemDialog({ item, onClose, onReturned }) {
  const { t } = useTranslation();
  const { warehouseId, eventId } = useParams();
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setQuantity("");
    setNote("");
    setError("");
  }, [item]);

  const qtyNum = Number(quantity);
  const valid = item && qtyNum > 0 && qtyNum <= item.outstanding;

  async function handleSave() {
    setError("");
    setSaving(true);
    try {
      const res = await fetch(
        `/api/warehouses/${warehouseId}/events/${eventId}/items/${item.id}/return`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: qtyNum, note }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || t("events.errors.returnFailed"));
        return;
      }
      onReturned();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={!!item} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{t("events.recordReturn")}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <TextField
            label={t("events.quantityReturned")}
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            autoFocus
            fullWidth
            error={!!quantity && item && qtyNum > item.outstanding}
            helperText={item ? t("events.outstandingHelper", { quantity: item.outstanding }) : " "}
          />
          <TextField
            label={t("events.returnNote")}
            value={note}
            onChange={(e) => setNote(e.target.value)}
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
          disabled={!valid || saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          onClick={handleSave}
        >
          {saving ? t("common.saving") : t("events.recordReturn")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
