"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Stack, TextField, Grid, Button, Alert } from "@mui/material";

const empty = {
  name: "",
  description: "",
  location: "",
  startDate: "",
  endDate: "",
};

function toDateInputValue(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export default function EventForm({ initial, onSubmit, submitLabel, error }) {
  const { t } = useTranslation();
  const [values, setValues] = useState({
    ...empty,
    ...initial,
    startDate: toDateInputValue(initial?.startDate),
    endDate: toDateInputValue(initial?.endDate),
  });
  const [saving, setSaving] = useState(false);

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

  const valid = values.name.trim() && values.startDate && values.endDate && values.endDate >= values.startDate;

  return (
    <Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
      {error && <Alert severity="error">{error}</Alert>}

      <TextField
        label={t("events.fields.name")}
        value={values.name}
        onChange={(e) => set("name", e.target.value)}
        required
        autoFocus
        fullWidth
      />

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            label={t("events.fields.startDate")}
            type="date"
            value={values.startDate}
            onChange={(e) => set("startDate", e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label={t("events.fields.endDate")}
            type="date"
            value={values.endDate}
            onChange={(e) => set("endDate", e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
            fullWidth
            error={!!values.startDate && !!values.endDate && values.endDate < values.startDate}
            helperText={
              values.startDate && values.endDate && values.endDate < values.startDate
                ? t("events.errors.endBeforeStart")
                : " "
            }
          />
        </Grid>
      </Grid>

      <TextField
        label={t("common.fields.location")}
        value={values.location}
        onChange={(e) => set("location", e.target.value)}
        fullWidth
      />

      <TextField
        label={t("common.fields.description")}
        value={values.description}
        onChange={(e) => set("description", e.target.value)}
        multiline
        minRows={2}
        fullWidth
      />

      <Button type="submit" variant="contained" size="large" disabled={saving || !valid}>
        {saving ? t("common.saving") : submitLabel || t("common.save")}
      </Button>
    </Stack>
  );
}
