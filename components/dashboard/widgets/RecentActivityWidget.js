"use client";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { List, ListItem, ListItemAvatar, ListItemText, Avatar, Box, Typography, Skeleton, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import EditIcon from "@mui/icons-material/Edit";

export default function RecentActivityWidget() {
  const { t } = useTranslation();
  const { warehouseId } = useParams();
  const { data, isLoading } = useSWR(`/api/warehouses/${warehouseId}/movements?limit=8`, { refreshInterval: 15000 });
  const movements = data?.movements || [];

  if (isLoading) {
    return (
      <Stack spacing={1.5} sx={{ px: 1 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Stack key={i} direction="row" spacing={1.5} alignItems="center">
            <Skeleton variant="circular" width={28} height={28} />
            <Skeleton variant="text" sx={{ flex: 1 }} />
          </Stack>
        ))}
      </Stack>
    );
  }

  if (movements.length === 0) {
    return (
      <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography variant="body2" color="text.secondary">
          {t("dashboard.widgets.recentActivity.empty")}
        </Typography>
      </Box>
    );
  }

  return (
    <List dense sx={{ height: "100%", overflow: "auto" }}>
      {movements.map((m) => (
        <ListItem key={m.id} disableGutters>
          <ListItemAvatar sx={{ minWidth: 40 }}>
            <Avatar
              sx={{
                width: 28,
                height: 28,
                bgcolor: m.change > 0 ? "success.light" : m.change < 0 ? "error.light" : "grey.200",
              }}
            >
              {m.change > 0 ? (
                <ArrowUpwardIcon sx={{ fontSize: 14 }} />
              ) : m.change < 0 ? (
                <ArrowDownwardIcon sx={{ fontSize: 14 }} />
              ) : (
                <EditIcon sx={{ fontSize: 14 }} />
              )}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primaryTypographyProps={{ noWrap: true, fontSize: 13.5 }}
            primary={`${m.productName} ${m.change > 0 ? "+" : ""}${m.change}`}
            secondary={`${m.userName} \u00B7 ${formatDistanceToNow(new Date(m.createdAt), { addSuffix: true })}`}
          />
        </ListItem>
      ))}
    </List>
  );
}
