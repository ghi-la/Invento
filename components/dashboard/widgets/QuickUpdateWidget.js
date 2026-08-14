"use client";
import { useState } from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { Box, TextField, InputAdornment, List, ListItem, ListItemText, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import SearchIcon from "@mui/icons-material/Search";
import QuantityStepper from "@/components/QuantityStepper";
import { useWarehouse } from "@/components/WarehouseContext";

export default function QuickUpdateWidget() {
  const { t } = useTranslation();
  const { warehouseId } = useParams();
  const { can } = useWarehouse();
  const [q, setQ] = useState("");
  const { data, mutate } = useSWR(
    `/api/warehouses/${warehouseId}/products?limit=6${q ? `&q=${encodeURIComponent(q)}` : ""}&sort=-updatedAt`
  );
  const products = data?.products || [];

  function patchLocal(id, qty) {
    mutate(
      (prev) => prev && { ...prev, products: prev.products.map((p) => (p.id === id ? { ...p, quantity: qty } : p)) },
      { revalidate: false }
    );
  }

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <TextField
        size="small"
        placeholder={t("dashboard.widgets.quickUpdate.searchPlaceholder")}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        sx={{ mb: 1 }}
      />
      <List dense sx={{ flex: 1, overflow: "auto" }}>
        {products.map((p) => (
          <ListItem
            key={p.id}
            disableGutters
            secondaryAction={
              <QuantityStepper
                warehouseId={warehouseId}
                productId={p.id}
                quantity={p.quantity}
                unit={p.unit}
                itemsPerBox={p.itemsPerBox}
                disabled={!can("editor")}
                onChanged={(qty) => patchLocal(p.id, qty)}
              />
            }
          >
            <ListItemText primary={p.name} secondary={p.sku} primaryTypographyProps={{ noWrap: true }} />
          </ListItem>
        ))}
        {data && products.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
            {t("common.noMatches")}
          </Typography>
        )}
      </List>
    </Box>
  );
}
