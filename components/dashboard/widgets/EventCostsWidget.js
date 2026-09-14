"use client";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { Box, Typography, Stack, Skeleton } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useWarehouse } from "@/components/WarehouseContext";
import { formatCurrency } from "@/lib/currency";

// Sums cost/outstanding value across events that aren't completed yet, so the
// stat reflects what's currently checked out rather than all-time totals.
export default function EventCostsWidget() {
  const { t } = useTranslation();
  const { warehouseId } = useParams();
  const { warehouse } = useWarehouse();
  const { data, isLoading } = useSWR(`/api/warehouses/${warehouseId}/events?upcoming=true`);
  const events = data?.events || [];

  const totalCost = events.reduce((sum, e) => sum + e.totalCost, 0);
  const outstandingValue = events.reduce((sum, e) => sum + e.outstandingValue, 0);

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Typography variant="caption" color="text.secondary">
        {t("dashboard.widgets.eventCosts.label")}
      </Typography>
      {isLoading ? (
        <Skeleton variant="text" width={120} sx={{ fontSize: "2.125rem" }} />
      ) : (
        <Typography variant="h4" fontWeight={700} sx={{ fontFamily: '"SF Mono","Roboto Mono",monospace' }}>
          {formatCurrency(totalCost, warehouse?.currency, { maximumFractionDigits: 0 })}
        </Typography>
      )}
      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {t("dashboard.widgets.eventCosts.openEvents")}
          </Typography>
          {isLoading ? <Skeleton variant="text" width={32} /> : <Typography fontWeight={600}>{events.length}</Typography>}
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {t("dashboard.widgets.eventCosts.outstandingValue")}
          </Typography>
          {isLoading ? (
            <Skeleton variant="text" width={48} />
          ) : (
            <Typography fontWeight={600} color={outstandingValue > 0 ? "warning.main" : undefined}>
              {formatCurrency(outstandingValue, warehouse?.currency, { maximumFractionDigits: 0 })}
            </Typography>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
