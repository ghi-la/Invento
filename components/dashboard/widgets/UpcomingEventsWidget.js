"use client";
import useSWR from "swr";
import Link from "next/link";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { List, ListItem, ListItemText, Chip, Typography, Box, Button, Skeleton, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";

const STATUS_COLOR = { planning: "default", active: "warning" };

export default function UpcomingEventsWidget() {
  const { t } = useTranslation();
  const { warehouseId } = useParams();
  const { data, isLoading } = useSWR(`/api/warehouses/${warehouseId}/events?upcoming=true&limit=6`);
  const events = data?.events || [];

  if (isLoading) {
    return (
      <Stack spacing={1.5}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Stack key={i} direction="row" spacing={1.5} alignItems="center">
            <Skeleton variant="text" sx={{ flex: 1 }} />
            <Skeleton variant="rounded" width={64} height={22} />
          </Stack>
        ))}
      </Stack>
    );
  }

  if (events.length === 0) {
    return (
      <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography variant="body2" color="text.secondary">
          {t("dashboard.widgets.upcomingEvents.empty")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <List dense sx={{ flex: 1, overflow: "auto" }}>
        {events.map((ev) => (
          <ListItem
            key={ev.id}
            disableGutters
            secondaryAction={
              ev.outstandingCount > 0 ? (
                <Chip
                  size="small"
                  color="warning"
                  label={t("events.outstandingBadge", { count: ev.outstandingCount })}
                />
              ) : (
                <Chip size="small" color={STATUS_COLOR[ev.status]} label={t(`events.status.${ev.status}`)} />
              )
            }
          >
            <ListItemText
              primary={ev.name}
              secondary={`${format(new Date(ev.startDate), "MMM d")} – ${format(new Date(ev.endDate), "MMM d")}`}
              primaryTypographyProps={{ noWrap: true }}
            />
          </ListItem>
        ))}
      </List>
      <Button component={Link} href={`/w/${warehouseId}/events`} size="small" sx={{ mt: 1 }}>
        {t("dashboard.widgets.upcomingEvents.viewAll")}
      </Button>
    </Box>
  );
}
