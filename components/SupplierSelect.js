"use client";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { Autocomplete, TextField, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";

/**
 * Supplier picker that lets the user create a brand-new supplier inline by
 * typing a name that doesn't exist yet — mirrors CategorySelect.
 */
export default function SupplierSelect({ warehouseId, value, onChange, disabled }) {
  const { t } = useTranslation();
  const { data, isLoading, mutate } = useSWR(`/api/warehouses/${warehouseId}/suppliers`);
  const [creating, setCreating] = useState(false);

  const options = useMemo(
    () => (data?.suppliers || []).map((s) => ({ id: s.id, label: s.name })),
    [data]
  );

  const selected = options.find((o) => o.id === value) || null;

  async function handleCreate(name) {
    setCreating(true);
    try {
      const res = await fetch(`/api/warehouses/${warehouseId}/suppliers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const created = await res.json();
      if (res.ok) {
        await mutate();
        onChange(created.id);
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <Autocomplete
      disabled={disabled}
      options={options}
      value={selected}
      isOptionEqualToValue={(o, v) => o.id === v.id}
      loading={creating || isLoading}
      onChange={(e, newVal, reason) => {
        if (reason === "clear") return onChange(null);
        if (newVal?.inputValue) return handleCreate(newVal.inputValue);
        onChange(newVal?.id || null);
      }}
      filterOptions={(opts, params) => {
        const filtered = opts.filter((o) => o.label.toLowerCase().includes(params.inputValue.toLowerCase()));
        const exists = opts.some((o) => o.label.toLowerCase() === params.inputValue.toLowerCase());
        if (params.inputValue !== "" && !exists) {
          filtered.push({
            inputValue: params.inputValue,
            label: t("suppliers.createOption", { name: params.inputValue }),
          });
        }
        return filtered;
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={t("suppliers.selectLabel")}
          placeholder={t("suppliers.searchOrCreate")}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {creating ? <CircularProgress size={16} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
