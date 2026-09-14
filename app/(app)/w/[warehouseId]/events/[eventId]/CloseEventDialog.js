"use client";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useWarehouse } from "@/components/WarehouseContext";
import { formatCurrency } from "@/lib/currency";

export default function CloseEventDialog({ open, event, onClose, onClosed }) {
  const { t } = useTranslation();
  const { warehouseId, eventId } = useParams();
  const { warehouse } = useWarehouse();
  const [error, setError] = useState("");
  const [closing, setClosing] = useState(false);

  const outstandingItems = useMemo(
    () => (event?.items || []).filter((i) => i.outstanding > 0),
    [event]
  );
  const shortageValue = outstandingItems.reduce((sum, i) => sum + i.unitCost * i.outstanding, 0);

  async function handleClose() {
    setError("");
    setClosing(true);
    try {
      const res = await fetch(`/api/warehouses/${warehouseId}/events/${eventId}/close`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || t("events.errors.closeFailed"));
        return;
      }
      onClosed();
    } finally {
      setClosing(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{t("events.closeConfirmTitle", { name: event?.name })}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {outstandingItems.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t("events.closeConfirmBodyClear")}
          </Typography>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {t("events.closeConfirmBody", {
                count: outstandingItems.length,
                value: formatCurrency(shortageValue, warehouse?.currency),
              })}
            </Typography>
            <List dense disablePadding>
              {outstandingItems.map((i) => (
                <ListItem key={i.id} disableGutters>
                  <ListItemText primary={i.name} secondary={t("events.outstandingHelper", { quantity: i.outstanding })} />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={closing}>
          {t("common.cancel")}
        </Button>
        <Button
          color={outstandingItems.length > 0 ? "warning" : "primary"}
          variant="contained"
          disabled={closing}
          startIcon={closing ? <CircularProgress size={16} color="inherit" /> : null}
          onClick={handleClose}
        >
          {closing ? t("common.saving") : t("events.closeEvent")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
