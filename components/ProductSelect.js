"use client";
import { useMemo } from "react";
import useSWR from "swr";
import { Autocomplete, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { unitShortLabel } from "@/lib/units";

/**
 * Warehouse-stock product picker for event checkout. Unlike CategorySelect,
 * there's no inline-create — picking a nonexistent product doesn't make sense
 * here — and onChange passes the full option (incl. quantity on hand) so
 * callers can validate/display available stock without a second fetch.
 */
export default function ProductSelect({ warehouseId, value, onChange, disabled }) {
  const { t } = useTranslation();
  const { data, isLoading } = useSWR(`/api/warehouses/${warehouseId}/products?limit=200&sort=name`);

  const options = useMemo(
    () =>
      (data?.products || []).map((p) => ({
        id: p.id,
        name: p.name,
        quantity: p.quantity,
        unit: p.unit,
        label: `${p.name} — ${p.quantity} ${unitShortLabel(t, p.unit)} ${t("events.available")}`,
      })),
    [data, t]
  );

  const selected = options.find((o) => o.id === value) || null;

  return (
    <Autocomplete
      disabled={disabled}
      options={options}
      value={selected}
      isOptionEqualToValue={(o, v) => o.id === v.id}
      loading={isLoading}
      onChange={(e, newVal) => onChange(newVal || null)}
      renderInput={(params) => (
        <TextField {...params} label={t("events.sourceWarehouse")} placeholder={t("categories.searchOrCreate")} />
      )}
    />
  );
}
