"use client";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import LockIcon from "@mui/icons-material/Lock";
import { useWarehouse } from "./WarehouseContext";

export default function RoleGuard({ minRole, children }) {
  const { t } = useTranslation();
  const { can } = useWarehouse();
  if (!can(minRole)) {
    return (
      <Box sx={{ textAlign: "center", py: 10 }}>
        <LockIcon sx={{ fontSize: 44, color: "text.secondary", mb: 2 }} />
        <Typography variant="h6" fontWeight={700}>
          {t("common.noAccessTitle")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("common.noAccessBody")}
        </Typography>
      </Box>
    );
  }
  return children;
}
