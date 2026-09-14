"use client";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { Box, Typography, Skeleton } from "@mui/material";
import { useTranslation } from "react-i18next";
import { PieChart } from "@mui/x-charts/PieChart";

export default function CategoryBreakdownWidget() {
  const { t } = useTranslation();
  const { warehouseId } = useParams();
  const { data, isLoading } = useSWR(`/api/warehouses/${warehouseId}/stats`);
  const breakdown = data?.categoryBreakdown || [];

  if (isLoading) {
    return (
      <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Skeleton variant="circular" width={180} height={180} />
      </Box>
    );
  }

  if (breakdown.length === 0) {
    return (
      <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography variant="body2" color="text.secondary">
          {t("dashboard.widgets.categoryBreakdown.empty")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <PieChart
        series={[
          {
            data: breakdown.map((c, i) => ({ id: i, value: c.count, label: c.name, color: c.color })),
            innerRadius: 28,
            paddingAngle: 2,
            cornerRadius: 3,
          },
        ]}
        height={180}
        slotProps={{ legend: { hidden: true } }}
      />
    </Box>
  );
}
