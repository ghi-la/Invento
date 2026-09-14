"use client";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Box, Typography, Stack, Button, useMediaQuery, Skeleton } from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import CheckIcon from "@mui/icons-material/Check";
import AddIcon from "@mui/icons-material/Add";
import dynamic from "next/dynamic";
import WidgetFrame from "@/components/dashboard/WidgetFrame";
import AddWidgetDialog from "@/components/dashboard/AddWidgetDialog";
import { WIDGET_REGISTRY } from "@/components/dashboard/widgetRegistry";
import { useWarehouse } from "@/components/WarehouseContext";

// react-grid-layout touches window at import time in places, so keep it client-only
const WidgetGrid = dynamic(() => import("@/components/dashboard/WidgetGrid"), { ssr: false });

export default function DashboardClient({ initialWidgets }) {
  const { t } = useTranslation();
  const { warehouseId } = useParams();
  const { warehouse } = useWarehouse();
  const isMobile = useMediaQuery("(max-width:900px)");

  const { data } = useSWR(`/api/warehouses/${warehouseId}/dashboard-layout`, {
    fallbackData: initialWidgets ? { widgets: initialWidgets } : undefined,
  });
  const [widgets, setWidgets] = useState(initialWidgets || null);
  const [editMode, setEditMode] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const saveTimer = useRef(null);

  useEffect(() => {
    if (data?.widgets && !widgets) setWidgets(data.widgets);
  }, [data, widgets]);

  function persist(next) {
    setWidgets(next);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch(`/api/warehouses/${warehouseId}/dashboard-layout`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ widgets: next }),
      });
    }, 500);
  }

  function handleAdd(type) {
    const def = WIDGET_REGISTRY[type];
    const maxY = widgets?.length ? Math.max(...widgets.map((w) => w.y + w.h)) : 0;
    const next = [
      ...(widgets || []),
      {
        id: `${type}-${Date.now()}`,
        type,
        x: 0,
        y: maxY,
        w: def.defaultSize.w,
        h: def.defaultSize.h,
      },
    ];
    persist(next);
    setAddOpen(false);
  }

  function handleRemove(id) {
    persist((widgets || []).filter((w) => w.id !== id));
  }

  const loading = !widgets;

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {warehouse?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("dashboard.subtitle")}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          {editMode && (
            <Button startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
              {t("dashboard.addWidget")}
            </Button>
          )}
          <Button
            variant={editMode ? "contained" : "outlined"}
            startIcon={editMode ? <CheckIcon /> : <TuneIcon />}
            disabled={loading}
            onClick={() => setEditMode((v) => !v)}
          >
            {editMode ? t("dashboard.done") : t("dashboard.customize")}
          </Button>
        </Stack>
      </Stack>

      {loading && (
        <Stack spacing={2} direction={isMobile ? "column" : "row"} flexWrap="wrap">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={220} sx={{ flex: isMobile ? "none" : "1 1 320px" }} />
          ))}
        </Stack>
      )}

      {!loading && widgets.length === 0 && !editMode && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {t("dashboard.emptyTitle")}
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setEditMode(true)}>
            {t("dashboard.customizeButton")}
          </Button>
        </Box>
      )}

      {!loading && (isMobile ? (
        <Stack spacing={2}>
          {widgets.map((w) => {
            const def = WIDGET_REGISTRY[w.type];
            if (!def) return null;
            const Widget = def.component;
            return (
              <Box key={w.id} sx={{ minHeight: 220 }}>
                <WidgetFrame title={t(def.titleKey)} editMode={editMode} onRemove={() => handleRemove(w.id)}>
                  <Widget />
                </WidgetFrame>
              </Box>
            );
          })}
        </Stack>
      ) : (
        <WidgetGrid widgets={widgets} editMode={editMode} onLayoutChange={persist} onRemove={handleRemove} />
      ))}

      <AddWidgetDialog open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAdd} />
    </Box>
  );
}
