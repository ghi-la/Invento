"use client";
import { Suspense, useState } from "react";
import useSWR from "swr";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Card,
  CardActionArea,
  CardContent,
  Fab,
  Skeleton,
  Button,
  ToggleButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  useMediaQuery,
  Avatar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import QuantityStepper from "@/components/QuantityStepper";
import { useWarehouse } from "@/components/WarehouseContext";

export default function InventoryPage() {
  return (
    <Suspense fallback={null}>
      <InventoryInner />
    </Suspense>
  );
}

function InventoryInner() {
  const { t } = useTranslation();
  const { warehouseId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { can } = useWarehouse();
  const isMobile = useMediaQuery("(max-width:900px)");

  const [q, setQ] = useState("");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [lowStockOnly, setLowStockOnly] = useState(searchParams.get("lowStock") === "true");

  const query = new URLSearchParams();
  if (q) query.set("q", q);
  if (category) query.set("category", category);
  if (lowStockOnly) query.set("lowStock", "true");
  query.set("limit", "200");

  const { data, error, isLoading, mutate } = useSWR(
    `/api/warehouses/${warehouseId}/products?${query.toString()}`
  );
  const { data: catData } = useSWR(`/api/warehouses/${warehouseId}/categories`);

  const products = data?.products || [];

  function patchLocal(id, newQty) {
    mutate(
      (prev) =>
        prev && {
          ...prev,
          products: prev.products.map((p) =>
            p.id === id ? { ...p, quantity: newQty, lowStock: newQty <= p.minStockLevel } : p
          ),
        },
      { revalidate: false }
    );
  }

  return (
    <Box sx={{ pb: 8 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          {t("inventory.title")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {data ? t("inventory.itemCount", { count: data.total }) : ""}
        </Typography>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2.5 }}>
        <TextField
          placeholder={t("inventory.searchPlaceholder")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 200 } }}>
          <InputLabel>{t("inventory.categoryLabel")}</InputLabel>
          <Select value={category} label={t("inventory.categoryLabel")} onChange={(e) => setCategory(e.target.value)}>
            <MenuItem value="">{t("inventory.allCategories")}</MenuItem>
            {catData?.categories?.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.parent ? "— " : ""}
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <ToggleButton
          value="low"
          selected={lowStockOnly}
          onChange={() => setLowStockOnly((v) => !v)}
          size="small"
          color="warning"
          sx={{ whiteSpace: "nowrap", px: 2 }}
        >
          <WarningAmberIcon fontSize="small" sx={{ mr: 0.75 }} />
          {t("inventory.lowStockToggle")}
        </ToggleButton>
      </Stack>

      {isLoading && (
        <Stack spacing={1.5}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rounded" height={72} />
          ))}
        </Stack>
      )}

      {!isLoading && error && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <ErrorOutlineIcon sx={{ fontSize: 48, color: "error.main", mb: 2 }} />
          <Typography variant="h6" fontWeight={700}>
            {t("inventory.errorTitle")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("inventory.errorBody")}
          </Typography>
          <Button variant="outlined" onClick={() => mutate()}>
            {t("common.retry")}
          </Button>
        </Box>
      )}

      {!isLoading && !error && products.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Inventory2Icon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" fontWeight={700}>
            {q || category || lowStockOnly ? t("inventory.noMatchTitle") : t("inventory.emptyTitle")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {q || category || lowStockOnly ? t("inventory.noMatchBody") : t("inventory.emptyBody")}
          </Typography>
        </Box>
      )}

      {!isLoading && !error && products.length > 0 && isMobile && (
        <Stack spacing={1.25}>
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              warehouseId={warehouseId}
              canEdit={can("editor")}
              onOpen={() => router.push(`/w/${warehouseId}/inventory/${p.id}`)}
              onChanged={(qty) => patchLocal(p.id, qty)}
            />
          ))}
        </Stack>
      )}

      {!isLoading && products.length > 0 && !isMobile && (
        <Card>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t("inventory.table.product")}</TableCell>
                <TableCell>{t("inventory.table.sku")}</TableCell>
                <TableCell>{t("inventory.table.category")}</TableCell>
                <TableCell>{t("inventory.table.location")}</TableCell>
                <TableCell align="right">{t("inventory.table.quantity")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id} hover sx={{ cursor: "pointer" }}>
                  <TableCell onClick={() => router.push(`/w/${warehouseId}/inventory/${p.id}`)}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar
                        variant="rounded"
                        src={p.imageUrl || undefined}
                        sx={{ bgcolor: p.category?.color || "grey.200", width: 34, height: 34 }}
                      >
                        <Inventory2Icon fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography fontWeight={600}>{p.name}</Typography>
                        {p.lowStock && (
                          <Chip
                            size="small"
                            color="warning"
                            icon={<WarningAmberIcon />}
                            label={t("common.lowStock")}
                            sx={{ height: 20, fontSize: 11 }}
                          />
                        )}
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell
                    onClick={() => router.push(`/w/${warehouseId}/inventory/${p.id}`)}
                    sx={{ fontFamily: '"SF Mono","Roboto Mono",monospace', fontSize: 13 }}
                  >
                    {p.sku || "—"}
                  </TableCell>
                  <TableCell onClick={() => router.push(`/w/${warehouseId}/inventory/${p.id}`)}>
                    {p.category?.name || "—"}
                  </TableCell>
                  <TableCell onClick={() => router.push(`/w/${warehouseId}/inventory/${p.id}`)}>
                    {p.location || "—"}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <QuantityStepper
                        warehouseId={warehouseId}
                        productId={p.id}
                        quantity={p.quantity}
                        unit={p.unit}
                        itemsPerBox={p.itemsPerBox}
                        disabled={!can("editor")}
                        onChanged={(qty) => patchLocal(p.id, qty)}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {can("editor") && (
        <Fab
          color="warning"
          onClick={() => router.push(`/w/${warehouseId}/inventory/new`)}
          sx={{ position: "fixed", bottom: { xs: 80, md: 24 }, right: 24 }}
        >
          <AddIcon sx={{ color: "primary.main" }} />
        </Fab>
      )}
    </Box>
  );
}

function ProductCard({ product, warehouseId, canEdit, onOpen, onChanged }) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardActionArea onClick={onOpen} sx={{ p: 0 }}>
        <CardContent sx={{ py: 1.5, px: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar
              variant="rounded"
              src={product.imageUrl || undefined}
              sx={{ bgcolor: product.category?.color || "grey.200", width: 40, height: 40, flexShrink: 0 }}
            >
              <Inventory2Icon fontSize="small" />
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography fontWeight={600} noWrap>
                {product.name}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="caption" color="text.secondary" noWrap>
                  {product.sku || product.category?.name || product.location || " "}
                </Typography>
                {product.lowStock && (
                  <Chip size="small" color="warning" label={t("inventory.lowBadge")} sx={{ height: 18, fontSize: 10 }} />
                )}
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </CardActionArea>
      <Box sx={{ display: "flex", justifyContent: "center", pb: 1.25 }} onClick={(e) => e.stopPropagation()}>
        <QuantityStepper
          warehouseId={warehouseId}
          productId={product.id}
          quantity={product.quantity}
          unit={product.unit}
          itemsPerBox={product.itemsPerBox}
          disabled={!canEdit}
          onChanged={onChanged}
        />
      </Box>
    </Card>
  );
}
