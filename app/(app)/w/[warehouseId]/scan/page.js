"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Button,
  Avatar,
  Alert,
} from "@mui/material";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import AddIcon from "@mui/icons-material/Add";
import QuantityStepper from "@/components/QuantityStepper";
import { useWarehouse } from "@/components/WarehouseContext";

const BarcodeScanner = dynamic(() => import("@/components/BarcodeScanner"), { ssr: false });

export default function ScanPage() {
  const { t } = useTranslation();
  const { warehouseId } = useParams();
  const router = useRouter();
  const { can } = useWarehouse();

  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState(null); // { found, product, code }
  const [loading, setLoading] = useState(false);

  async function handleScan(code) {
    setScanning(false);
    setLoading(true);
    try {
      const res = await fetch(
        `/api/warehouses/${warehouseId}/products/lookup?barcode=${encodeURIComponent(code)}`
      );
      const data = await res.json();
      setResult({ ...data, code });
    } finally {
      setLoading(false);
    }
  }

  function scanAgain() {
    setResult(null);
    setScanning(true);
  }

  return (
    <Box sx={{ maxWidth: 480, mx: "auto" }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        {t("scan.title")}
      </Typography>

      {scanning && (
        <BarcodeScanner onScan={handleScan} onClose={() => router.push(`/w/${warehouseId}/inventory`)} />
      )}

      {!scanning && loading && (
        <Card>
          <CardContent sx={{ py: 6, textAlign: "center" }}>
            <Typography color="text.secondary">{t("scan.lookingUp")}</Typography>
          </CardContent>
        </Card>
      )}

      {!scanning && !loading && result?.found && (
        <Card>
          <CardContent sx={{ py: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Avatar
                variant="rounded"
                sx={{ width: 52, height: 52, bgcolor: result.product.category?.color || "grey.200" }}
              >
                <Inventory2Icon />
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" fontWeight={700} noWrap>
                  {result.product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "monospace" }}>
                  {result.product.sku || result.product.barcode}
                </Typography>
                {result.product.lowStock && (
                  <Chip
                    size="small"
                    color="warning"
                    icon={<WarningAmberIcon />}
                    label={t("common.lowStock")}
                    sx={{ mt: 0.5 }}
                  />
                )}
              </Box>
            </Stack>

            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <QuantityStepper
                warehouseId={warehouseId}
                productId={result.product.id}
                quantity={result.product.quantity}
                unit={result.product.unit}
                itemsPerBox={result.product.itemsPerBox}
                size="large"
                disabled={!can("editor")}
                onChanged={(qty) =>
                  setResult((r) => ({ ...r, product: { ...r.product, quantity: qty } }))
                }
              />
            </Box>

            <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => router.push(`/w/${warehouseId}/inventory/${result.product.id}`)}
              >
                {t("common.viewDetails")}
              </Button>
              <Button fullWidth variant="contained" startIcon={<QrCodeScannerIcon />} onClick={scanAgain}>
                {t("scan.scanNext")}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {!scanning && !loading && result && !result.found && (
        <Card>
          <CardContent sx={{ py: 4, textAlign: "center" }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
              {t("scan.noMatchTitle")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {t("scan.noMatchBody")}
            </Typography>
            <Chip label={result.code} sx={{ fontFamily: "monospace", mb: 3 }} />
            <Stack spacing={1.5}>
              {can("editor") && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() =>
                    router.push(
                      `/w/${warehouseId}/inventory/new?barcode=${encodeURIComponent(result.code)}`
                    )
                  }
                >
                  {t("scan.addAsNewProduct")}
                </Button>
              )}
              <Button variant="outlined" startIcon={<QrCodeScannerIcon />} onClick={scanAgain}>
                {t("scan.scanAgain")}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
