"use client";
import useSWR from "swr";
import Link from "next/link";
import { useParams } from "next/navigation";
import { List, ListItem, ListItemText, Chip, Typography, Box, Button, Skeleton, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { formatQuantity } from "@/lib/units";

export default function LowStockWidget() {
  const { t } = useTranslation();
  const { warehouseId } = useParams();
  const { data, isLoading } = useSWR(`/api/warehouses/${warehouseId}/products?lowStock=true&limit=6`);
  const products = data?.products || [];

  if (isLoading) {
    return (
      <Stack spacing={1.5}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Stack key={i} direction="row" spacing={1.5} alignItems="center">
            <Skeleton variant="text" sx={{ flex: 1 }} />
            <Skeleton variant="rounded" width={48} height={22} />
          </Stack>
        ))}
      </Stack>
    );
  }

  if (products.length === 0) {
    return (
      <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography variant="body2" color="text.secondary">
          {t("dashboard.widgets.lowStock.empty")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <List dense sx={{ flex: 1, overflow: "auto" }}>
        {products.map((p) => (
          <ListItem
            key={p.id}
            disableGutters
            secondaryAction={
              <Chip size="small" color="warning" label={formatQuantity(t, p.quantity, p.unit, p.itemsPerBox)} />
            }
          >
            <ListItemText
              primary={p.name}
              secondary={p.sku || p.location || null}
              primaryTypographyProps={{ noWrap: true }}
            />
          </ListItem>
        ))}
      </List>
      <Button component={Link} href={`/w/${warehouseId}/inventory?lowStock=true`} size="small" sx={{ mt: 1 }}>
        {t("dashboard.widgets.lowStock.viewAll")}
      </Button>
    </Box>
  );
}
