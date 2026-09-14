"use client";
import { useState } from "react";
import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";
import {
  Box,
  Typography,
  IconButton,
  Stack,
  Card,
  CardContent,
  Chip,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Grid,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import QuantityStepper from "@/components/QuantityStepper";
import ProductForm from "@/components/ProductForm";
import { useWarehouse } from "@/components/WarehouseContext";
import { unitLabel, formatQuantity } from "@/lib/units";
import { formatCurrency } from "@/lib/currency";

export default function ProductDetailClient({ initialProduct, initialMovements }) {
  const { t } = useTranslation();
  const { warehouseId, productId } = useParams();
  const router = useRouter();
  const { can, warehouse } = useWarehouse();

  const { data: product, error: loadError, isLoading, mutate } = useSWR(
    `/api/warehouses/${warehouseId}/products/${productId}`,
    { fallbackData: initialProduct || undefined }
  );
  const { data: activity, isLoading: activityLoading } = useSWR(
    `/api/warehouses/${warehouseId}/movements?product=${productId}&limit=10`,
    { fallbackData: initialMovements ? { movements: initialMovements } : undefined }
  );

  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave(values) {
    setError("");
    const res = await fetch(`/api/warehouses/${warehouseId}/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || t("product.errors.saveChangesFailed"));
      return;
    }
    await mutate();
    setEditing(false);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetch(`/api/warehouses/${warehouseId}/products/${productId}`, { method: "DELETE" });
      router.push(`/w/${warehouseId}/inventory`);
    } finally {
      setDeleting(false);
    }
  }

  if (loadError) {
    return (
      <Box sx={{ maxWidth: 640, mx: "auto", textAlign: "center", py: 8 }}>
        <ErrorOutlineIcon sx={{ fontSize: 48, color: "error.main", mb: 2 }} />
        <Typography variant="h6" fontWeight={700}>
          {t("product.errors.loadFailed")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t("inventory.errorBody")}
        </Typography>
        <Button variant="outlined" onClick={() => mutate()}>
          {t("common.retry")}
        </Button>
      </Box>
    );
  }

  if (isLoading || !product) {
    return (
      <Box sx={{ maxWidth: 640, mx: "auto" }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="text" width="40%" sx={{ fontSize: "1.5rem" }} />
        </Stack>
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={220} />
          <Skeleton variant="rounded" height={160} />
          <Skeleton variant="rounded" height={180} />
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 640, mx: "auto" }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <IconButton onClick={() => router.push(`/w/${warehouseId}/inventory`)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700} sx={{ flex: 1 }} noWrap>
          {editing ? t("product.editTitle") : product.name}
        </Typography>
        {can("editor") && !editing && (
          <>
            <IconButton onClick={() => setEditing(true)}>
              <EditIcon />
            </IconButton>
            <IconButton color="error" onClick={() => setConfirmDelete(true)}>
              <DeleteIcon />
            </IconButton>
          </>
        )}
      </Stack>

      {editing ? (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <ProductForm
              warehouseId={warehouseId}
              initial={{ ...product, category: product.category?.id || null }}
              onSubmit={handleSave}
              submitLabel={t("common.saveChanges")}
              error={error}
            />
            <Button sx={{ mt: 1 }} onClick={() => setEditing(false)} fullWidth>
              {t("common.cancel")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          <Card>
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <Avatar
                variant="rounded"
                src={product.imageUrl || undefined}
                sx={{
                  width: 56,
                  height: 56,
                  mx: "auto",
                  mb: 1.5,
                  bgcolor: product.category?.color || "grey.200",
                }}
              >
                <Inventory2Icon />
              </Avatar>
              {product.category && (
                <Chip size="small" label={product.category.name} sx={{ mb: 1 }} />
              )}
              {product.lowStock && (
                <Chip
                  size="small"
                  color="warning"
                  icon={<WarningAmberIcon />}
                  label={t("common.lowStock")}
                  sx={{ mb: 1, ml: 0.5 }}
                />
              )}
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <QuantityStepper
                  warehouseId={warehouseId}
                  productId={productId}
                  quantity={product.quantity}
                  unit={product.unit}
                  itemsPerBox={product.itemsPerBox}
                  size="large"
                  disabled={!can("editor")}
                  onChanged={(qty) => mutate((p) => p && { ...p, quantity: qty }, { revalidate: false })}
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                {t("product.lowStockAlertAt", {
                  quantity: formatQuantity(t, product.minStockLevel, product.unit, product.itemsPerBox),
                })}
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <DetailField label={t("product.sku")} value={product.sku} mono />
                <DetailField label={t("product.barcode")} value={product.barcode} mono />
                <DetailField label={t("product.location")} value={product.location} />
                <DetailField label={t("product.unit")} value={unitLabel(t, product.unit)} />
                {product.unit === "box" && product.itemsPerBox > 0 && (
                  <DetailField label={t("product.itemsPerBox")} value={product.itemsPerBox} />
                )}
                <DetailField
                  label={t("product.costPrice")}
                  value={product.costPrice ? formatCurrency(product.costPrice, warehouse?.currency) : ""}
                />
                <DetailField
                  label={t("product.sellPrice")}
                  value={product.sellPrice ? formatCurrency(product.sellPrice, warehouse?.currency) : ""}
                />
              </Grid>
              {product.notes && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    {product.notes}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                {t("product.recentActivity")}
              </Typography>
              {activityLoading && (
                <Stack spacing={1.5}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Stack key={i} direction="row" spacing={1.5} alignItems="center">
                      <Skeleton variant="circular" width={32} height={32} />
                      <Skeleton variant="text" sx={{ flex: 1 }} />
                    </Stack>
                  ))}
                </Stack>
              )}
              {!activityLoading && !activity?.movements?.length && (
                <Typography variant="body2" color="text.secondary">
                  {t("product.noActivity")}
                </Typography>
              )}
              <List dense>
                {!activityLoading && activity?.movements?.map((m) => (
                  <ListItem key={m.id} disableGutters>
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: m.change > 0 ? "success.light" : m.change < 0 ? "error.light" : "grey.200",
                          width: 32,
                          height: 32,
                        }}
                      >
                        {m.change > 0 ? (
                          <ArrowUpwardIcon fontSize="small" />
                        ) : m.change < 0 ? (
                          <ArrowDownwardIcon fontSize="small" />
                        ) : (
                          <EditIcon fontSize="small" />
                        )}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${m.change > 0 ? "+" : ""}${m.change} → ${formatQuantity(
                        t,
                        m.quantityAfter,
                        product.unit,
                        product.itemsPerBox
                      )}`}
                      secondary={`${m.userName} · ${formatDistanceToNow(new Date(m.createdAt), {
                        addSuffix: true,
                      })}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Stack>
      )}

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>{t("product.deleteConfirmTitle")}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {t("product.deleteConfirmBody", { name: product.name })}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmDelete(false)} disabled={deleting}>
            {t("common.cancel")}
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : null}
            onClick={handleDelete}
          >
            {deleting ? t("common.deleting") : t("common.delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function DetailField({ label, value, mono }) {
  if (!value) return null;
  return (
    <Grid item xs={6}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography sx={{ fontFamily: mono ? '"SF Mono","Roboto Mono",monospace' : undefined }}>
        {value}
      </Typography>
    </Grid>
  );
}
