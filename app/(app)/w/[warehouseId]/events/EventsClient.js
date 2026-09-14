"use client";
import { useState } from "react";
import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Stack,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Fab,
  Skeleton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EventIcon from "@mui/icons-material/Event";
import { useWarehouse } from "@/components/WarehouseContext";

const STATUS_COLOR = { planning: "default", active: "warning", completed: "success" };

export default function EventsClient({ initialEvents }) {
  const { t } = useTranslation();
  const { warehouseId } = useParams();
  const router = useRouter();
  const { can } = useWarehouse();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  const query = new URLSearchParams();
  if (q) query.set("q", q);
  if (status) query.set("status", status);

  const { data, isLoading } = useSWR(`/api/warehouses/${warehouseId}/events?${query.toString()}`, {
    fallbackData: !q && !status && initialEvents ? { events: initialEvents } : undefined,
  });

  const events = data?.events || [];

  return (
    <Box sx={{ pb: 8 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          {t("events.title")}
        </Typography>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2.5 }}>
        <TextField
          placeholder={t("events.searchPlaceholder")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 200 } }}>
          <InputLabel>{t("events.statusFilter")}</InputLabel>
          <Select value={status} label={t("events.statusFilter")} onChange={(e) => setStatus(e.target.value)}>
            <MenuItem value="">{t("inventory.allCategories")}</MenuItem>
            <MenuItem value="planning">{t("events.status.planning")}</MenuItem>
            <MenuItem value="active">{t("events.status.active")}</MenuItem>
            <MenuItem value="completed">{t("events.status.completed")}</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {isLoading && (
        <Stack spacing={1.5}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={84} />
          ))}
        </Stack>
      )}

      {!isLoading && events.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <EventIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" fontWeight={700}>
            {t("events.emptyTitle")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("events.emptyBody")}
          </Typography>
        </Box>
      )}

      {!isLoading && events.length > 0 && (
        <Stack spacing={1.5}>
          {events.map((ev) => (
            <Card key={ev.id}>
              <CardActionArea onClick={() => router.push(`/w/${warehouseId}/events/${ev.id}`)}>
                <CardContent sx={{ py: 1.75, px: 2.25 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontWeight={600} noWrap>
                        {ev.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(ev.startDate), "MMM d")} – {format(new Date(ev.endDate), "MMM d, yyyy")}
                        {ev.location ? ` · ${ev.location}` : ""}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                      {ev.outstandingCount > 0 && (
                        <Chip
                          size="small"
                          color="warning"
                          label={t("events.outstandingBadge", { count: ev.outstandingCount })}
                        />
                      )}
                      <Chip size="small" color={STATUS_COLOR[ev.status]} label={t(`events.status.${ev.status}`)} />
                    </Stack>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Stack>
      )}

      {can("editor") && (
        <Fab
          color="warning"
          onClick={() => router.push(`/w/${warehouseId}/events/new`)}
          sx={{ position: "fixed", bottom: { xs: 80, md: 24 }, right: 24 }}
        >
          <AddIcon sx={{ color: "primary.main" }} />
        </Fab>
      )}
    </Box>
  );
}
