"use client";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { Box, Typography, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";

export default function TotalValueWidget() {
  const { t } = useTranslation();
  const { warehouseId } = useParams();
  const { data } = useSWR(`/api/warehouses/${warehouseId}/stats`);

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Typography variant="caption" color="text.secondary">
        {t("dashboard.widgets.totalValue.label")}
      </Typography>
      <Typography variant="h4" fontWeight={700} sx={{ fontFamily: '"SF Mono","Roboto Mono",monospace' }}>
        ${(data?.totalValue || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {t("dashboard.widgets.totalValue.products")}
          </Typography>
          <Typography fontWeight={600}>{data?.totalProducts ?? "—"}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {t("dashboard.widgets.totalValue.units")}
          </Typography>
          <Typography fontWeight={600}>{data?.totalUnits ?? "—"}</Typography>
        </Box>
      </Stack>
    </Box>
  );
}
