"use client";
import { Suspense, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Box, Typography, IconButton, Stack, Card, CardContent } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ProductForm from "@/components/ProductForm";

export default function NewProductPage() {
  return (
    <Suspense fallback={null}>
      <NewProductForm />
    </Suspense>
  );
}

function NewProductForm() {
  const { t } = useTranslation();
  const { warehouseId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  async function handleSubmit(values) {
    setError("");
    const res = await fetch(`/api/warehouses/${warehouseId}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || t("product.errors.saveFailed"));
      return;
    }
    router.push(`/w/${warehouseId}/inventory/${data.id}`);
  }

  return (
    <Box sx={{ maxWidth: 640, mx: "auto" }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <IconButton onClick={() => router.back()}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>
          {t("product.newProductTitle")}
        </Typography>
      </Stack>
      <Card>
        <CardContent sx={{ p: 3 }}>
          <ProductForm
            warehouseId={warehouseId}
            initial={{ barcode: searchParams.get("barcode") || "" }}
            onSubmit={handleSubmit}
            submitLabel={t("product.addProductButton")}
            error={error}
          />
        </CardContent>
      </Card>
    </Box>
  );
}
