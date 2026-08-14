"use client";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Box, Typography } from "@mui/material";
import RoleGuard from "@/components/RoleGuard";
import CsvImportWizard from "@/components/import/CsvImportWizard";

export default function ImportPage() {
  const { t } = useTranslation();
  const { warehouseId } = useParams();
  return (
    <RoleGuard minRole="editor">
      <Box sx={{ maxWidth: 720, mx: "auto" }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
          {t("import.pageTitle")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t("import.pageSubtitle")}
        </Typography>
        <CsvImportWizard warehouseId={warehouseId} />
      </Box>
    </RoleGuard>
  );
}
