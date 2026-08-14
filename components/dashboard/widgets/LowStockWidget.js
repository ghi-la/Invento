"use client";
import useSWR from "swr";
import Link from "next/link";
import { useParams } from "next/navigation";
import { List, ListItem, ListItemText, Chip, Typography, Box, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import { formatQuantity } from "@/lib/units";

export default function LowStockWidget() {
  const { t } = useTranslation();
  const { warehouseId } = useParams();
  const { data } = useSWR(`/api/warehouses/${warehouseId}/products?lowStock=true&limit=6`);
  const products = data?.products || [];

  if (data && products.length === 0) {
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
