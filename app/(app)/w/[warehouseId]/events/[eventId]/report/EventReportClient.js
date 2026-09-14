"use client";
import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { PieChart } from "@mui/x-charts/PieChart";
import {
  Box,
  Typography,
  IconButton,
  Stack,
  Card,
  CardContent,
  Grid,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Skeleton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { useWarehouse } from "@/components/WarehouseContext";
import { formatCurrency } from "@/lib/currency";

export default function EventReportClient({ initialEvent }) {
  const { t } = useTranslation();
  const { warehouseId, eventId } = useParams();
  const router = useRouter();
  const { warehouse } = useWarehouse();

  const { data: event, isLoading } = useSWR(`/api/warehouses/${warehouseId}/events/${eventId}`, {
    fallbackData: initialEvent || undefined,
  });

  if (isLoading || !event) {
    return (
      <Box sx={{ maxWidth: 760, mx: "auto" }}>
        <Skeleton variant="text" width="40%" sx={{ fontSize: "1.5rem", mb: 2 }} />
        <Skeleton variant="rounded" height={220} />
      </Box>
    );
  }

  const { totals, items } = event;
  const isCompleted = event.status === "completed";
  const currency = warehouse?.currency;

  const pieData = [
    { id: 0, value: totals.warehouseItemsCost, label: t("events.sourceWarehouse"), color: "#5B7FDB" },
    { id: 1, value: totals.supplierItemsCost, label: t("events.sourceSupplier"), color: "#F2A93B" },
  ].filter((d) => d.value > 0);

  return (
    <Box sx={{ maxWidth: 760, mx: "auto" }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <IconButton onClick={() => router.push(`/w/${warehouseId}/events/${eventId}`)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700} sx={{ flex: 1 }} noWrap>
          {t("events.report.title")} — {event.name}
        </Typography>
      </Stack>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <StatCard label={t("events.report.warehouseItemsCost")} value={formatCurrency(totals.warehouseItemsCost, currency)} />
        <StatCard label={t("events.report.supplierItemsCost")} value={formatCurrency(totals.supplierItemsCost, currency)} />
        <StatCard label={t("events.report.totalCost")} value={formatCurrency(totals.totalCost, currency)} emphasize />
        <StatCard
          label={isCompleted ? t("events.report.shortageValue") : t("events.report.outstandingValue")}
          value={formatCurrency(isCompleted ? totals.shortageValue : totals.outstandingValue, currency)}
          color={isCompleted && totals.shortageValue > 0 ? "error.main" : undefined}
        />
      </Grid>

      {pieData.length > 0 && (
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ display: "flex", justifyContent: "center" }}>
            <PieChart
              series={[{ data: pieData, innerRadius: 32, paddingAngle: 2, cornerRadius: 3 }]}
              height={200}
              width={320}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t("inventory.table.product")}</TableCell>
                <TableCell align="right">{t("events.quantityTaken")}</TableCell>
                <TableCell align="right">{t("events.quantityReturned")}</TableCell>
                <TableCell align="right">{isCompleted ? t("events.shortage") : t("events.outstanding")}</TableCell>
                <TableCell align="right">{t("events.unitCost")}</TableCell>
                <TableCell align="right">{t("events.lineCost")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {item.source === "warehouse" ? (
                        <Inventory2Icon fontSize="small" color="disabled" />
                      ) : (
                        <LocalShippingIcon fontSize="small" color="disabled" />
                      )}
                      <Typography variant="body2">{item.name}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="right">{item.quantityTaken}</TableCell>
                  <TableCell align="right">{item.quantityReturned}</TableCell>
                  <TableCell align="right">
                    {(isCompleted ? item.shortageQuantity : item.outstanding) > 0 ? (
                      <Chip
                        size="small"
                        color={isCompleted ? "error" : "warning"}
                        label={isCompleted ? item.shortageQuantity : item.outstanding}
                      />
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell align="right">{formatCurrency(item.unitCost, currency)}</TableCell>
                  <TableCell align="right">{formatCurrency(item.lineCost, currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Card>
    </Box>
  );
}

function StatCard({ label, value, emphasize, color }) {
  return (
    <Grid item xs={6} sm={3}>
      <Card sx={{ height: "100%" }}>
        <CardContent>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography variant={emphasize ? "h6" : "subtitle1"} fontWeight={700} sx={{ color }}>
            {value}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
}
