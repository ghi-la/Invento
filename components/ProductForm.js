"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import {
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
  Button,
  Dialog,
  Alert,
  MenuItem,
} from "@mui/material";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import CategorySelect from "@/components/CategorySelect";
import PhotoUpload from "@/components/PhotoUpload";
import { UNIT_VALUES, unitLabel } from "@/lib/units";
import { currencySymbol } from "@/lib/currency";
import { useWarehouse } from "@/components/WarehouseContext";

const BarcodeScanner = dynamic(() => import("@/components/BarcodeScanner"), { ssr: false });

const empty = {
  name: "",
  sku: "",
  barcode: "",
  imageUrl: "",
  category: null,
  unit: "pcs",
  itemsPerBox: "",
  quantity: 0,
  minStockLevel: 0,
  costPrice: "",
  sellPrice: "",
  location: "",
  notes: "",
};

export default function ProductForm({ warehouseId, initial, onSubmit, submitLabel, error }) {
  const { t } = useTranslation();
  const { warehouse } = useWarehouse();
  const symbol = currencySymbol(warehouse?.currency);
  const [values, setValues] = useState({ ...empty, ...initial });
  const [scannerOpen, setScannerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Legacy/imported products may carry a free-text unit that isn't one of the
  // presets; keep it selectable so editing doesn't silently blank the field.
  const unitValues = UNIT_VALUES.includes(values.unit) ? UNIT_VALUES : [values.unit, ...UNIT_VALUES];

  function set(field, val) {
    setValues((v) => ({ ...v, [field]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(values);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
      {error && <Alert severity="error">{error}</Alert>}

      <PhotoUpload warehouseId={warehouseId} value={values.imageUrl} onChange={(url) => set("imageUrl", url)} />

      <TextField
        label={t("product.name")}
        value={values.name}
        onChange={(e) => set("name", e.target.value)}
        required
        autoFocus
        fullWidth
      />

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label={t("product.sku")}
            value={values.sku}
            onChange={(e) => set("sku", e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label={t("product.barcode")}
            value={values.barcode}
            onChange={(e) => set("barcode", e.target.value)}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setScannerOpen(true)} edge="end">
                    <QrCodeScannerIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>

      <CategorySelect
        warehouseId={warehouseId}
        value={values.category}
        onChange={(id) => set("category", id)}
      />

      <Grid container spacing={2}>
        <Grid item xs={6} sm={3}>
          <TextField
            label={t("product.quantity")}
            type="number"
            value={values.quantity}
            onChange={(e) => set("quantity", e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField
            select
            label={t("product.unit")}
            value={values.unit}
            onChange={(e) => set("unit", e.target.value)}
            fullWidth
          >
            {unitValues.map((value) => (
              <MenuItem key={value} value={value}>
                {unitLabel(t, value)}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField
            label={t("product.lowStockAt")}
            type="number"
            value={values.minStockLevel}
            onChange={(e) => set("minStockLevel", e.target.value)}
            helperText={t("product.alertThreshold")}
            fullWidth
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField
            label={t("product.location")}
            placeholder={t("product.locationPlaceholder")}
            value={values.location}
            onChange={(e) => set("location", e.target.value)}
            fullWidth
          />
        </Grid>
        {values.unit === "box" && (
          <Grid item xs={6} sm={3}>
            <TextField
              label={t("product.itemsPerBox")}
              type="number"
              value={values.itemsPerBox}
              onChange={(e) => set("itemsPerBox", e.target.value)}
              helperText={
                values.itemsPerBox
                  ? t("product.itemsPerBoxSummary", {
                      quantity: values.quantity || 0,
                      total: (values.quantity || 0) * values.itemsPerBox,
                    })
                  : t("product.itemsPerBoxHelper")
              }
              fullWidth
            />
          </Grid>
        )}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            label={t("product.costPrice")}
            type="number"
            value={values.costPrice}
            onChange={(e) => set("costPrice", e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start">{symbol}</InputAdornment> }}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label={t("product.sellPrice")}
            type="number"
            value={values.sellPrice}
            onChange={(e) => set("sellPrice", e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start">{symbol}</InputAdornment> }}
            fullWidth
          />
        </Grid>
      </Grid>

      <TextField
        label={t("product.notes")}
        value={values.notes}
        onChange={(e) => set("notes", e.target.value)}
        multiline
        minRows={2}
        fullWidth
      />

      <Button type="submit" variant="contained" size="large" disabled={saving || !values.name.trim()}>
        {saving ? t("common.saving") : submitLabel || t("common.save")}
      </Button>

      <Dialog open={scannerOpen} onClose={() => setScannerOpen(false)} fullWidth maxWidth="xs">
        <BarcodeScanner
          onScan={(code) => {
            set("barcode", code);
            setScannerOpen(false);
          }}
          onClose={() => setScannerOpen(false)}
        />
      </Dialog>
    </Stack>
  );
}
