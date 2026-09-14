"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Box, Typography, IconButton, Stack, Card, CardContent } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EventForm from "@/components/EventForm";

export default function NewEventPage() {
  const { t } = useTranslation();
  const { warehouseId } = useParams();
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(values) {
    setError("");
    const res = await fetch(`/api/warehouses/${warehouseId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || t("events.errors.saveFailed"));
      return;
    }
    router.push(`/w/${warehouseId}/events/${data.id}`);
  }

  return (
    <Box sx={{ maxWidth: 640, mx: "auto" }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <IconButton onClick={() => router.back()}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>
          {t("events.newTitle")}
        </Typography>
      </Stack>
      <Card>
        <CardContent sx={{ p: 3 }}>
          <EventForm onSubmit={handleSubmit} submitLabel={t("events.newButton")} error={error} />
        </CardContent>
      </Card>
    </Box>
  );
}
