"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  InputAdornment,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ProductSelect from "@/components/ProductSelect";
import SupplierSelect from "@/components/SupplierSelect";
import { useWarehouse } from "@/components/WarehouseContext";
import { currencySymbol } from "@/lib/currency";

export default function AddEventItemDialog({ open, onClose, onAdded }) {
  const { t } = useTranslation();
  const { warehouseId, eventId } = useParams();
  const { warehouse } = useWarehouse();
  const symbol = currencySymbol(warehouse?.currency);

  const [source, setSource] = useState("warehouse");
  const [product, setProduct] = useState(null);
  const [supplierId, setSupplierId] = useState(null);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function reset() {
    setSource("warehouse");
    setProduct(null);
    setSupplierId(null);
    setName("");
    setQuantity("");
    setUnitCost("");
    setError("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  const qtyNum = Number(quantity);
  const valid =
    qtyNum > 0 &&
    (source === "warehouse" ? !!product && qtyNum <= product.quantity : !!supplierId && name.trim());

  async function handleSave() {
    setError("");
    setSaving(true);
    try {
      const body =
        source === "warehouse"
          ? { source, productId: product.id, quantity: qtyNum }
          : { source, supplierId, name: name.trim(), quantity: qtyNum, unitCost: Number(unitCost) || 0 };

      const res = await fetch(`/api/warehouses/${warehouseId}/events/${eventId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || t("events.errors.addItemFailed"));
        return;
      }
      reset();
      onAdded();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>{t("events.addItem")}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <ToggleButtonGroup
            value={source}
            exclusive
            fullWidth
            onChange={(e, val) => {
              if (val) setSource(val);
            }}
          >
            <ToggleButton value="warehouse">
              <Inventory2Icon fontSize="small" sx={{ mr: 1 }} />
              {t("events.sourceWarehouse")}
            </ToggleButton>
            <ToggleButton value="supplier">
              <LocalShippingIcon fontSize="small" sx={{ mr: 1 }} />
              {t("events.sourceSupplier")}
            </ToggleButton>
          </ToggleButtonGroup>

          {source === "warehouse" ? (
            <ProductSelect warehouseId={warehouseId} value={product?.id || null} onChange={setProduct} />
          ) : (
            <>
              <SupplierSelect warehouseId={warehouseId} value={supplierId} onChange={setSupplierId} />
              <TextField
                label={t("events.fields.itemName")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
              />
            </>
          )}

          <TextField
            label={t("events.quantityTaken")}
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            fullWidth
            error={source === "warehouse" && !!product && qtyNum > product.quantity}
            helperText={
              source === "warehouse" && product
                ? t("events.availableHelper", { quantity: product.quantity })
                : " "
            }
          />

          {source === "supplier" && (
            <TextField
              label={t("events.unitCost")}
              type="number"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start">{symbol}</InputAdornment> }}
              fullWidth
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={saving}>
          {t("common.cancel")}
        </Button>
        <Button
          variant="contained"
          disabled={!valid || saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          onClick={handleSave}
        >
          {saving ? t("common.saving") : t("events.addItem")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
