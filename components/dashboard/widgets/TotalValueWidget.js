"use client";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { Box, Typography, Stack, Skeleton } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useWarehouse } from "@/components/WarehouseContext";
import { formatCurrency } from "@/lib/currency";

export default function TotalValueWidget() {
  const { t } = useTranslation();
  const { warehouseId } = useParams();
  const { warehouse } = useWarehouse();
  const { data, isLoading } = useSWR(`/api/warehouses/${warehouseId}/stats`);

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Typography variant="caption" color="text.secondary">
        {t("dashboard.widgets.totalValue.label")}
      </Typography>
      {isLoading ? (
        <Skeleton variant="text" width={120} sx={{ fontSize: "2.125rem" }} />
      ) : (
        <Typography variant="h4" fontWeight={700} sx={{ fontFamily: '"SF Mono","Roboto Mono",monospace' }}>
          {formatCurrency(data?.totalValue || 0, warehouse?.currency, { maximumFractionDigits: 0 })}
        </Typography>
      )}
      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {t("dashboard.widgets.totalValue.products")}
          </Typography>
          {isLoading ? (
            <Skeleton variant="text" width={32} />
          ) : (
            <Typography fontWeight={600}>{data?.totalProducts ?? "—"}</Typography>
          )}
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {t("dashboard.widgets.totalValue.units")}
          </Typography>
          {isLoading ? (
            <Skeleton variant="text" width={32} />
          ) : (
            <Typography fontWeight={600}>{data?.totalUnits ?? "—"}</Typography>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
