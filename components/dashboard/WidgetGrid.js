"use client";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { WIDGET_REGISTRY } from "./widgetRegistry";
import WidgetFrame from "./WidgetFrame";

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function WidgetGrid({ widgets, editMode, onLayoutChange, onRemove }) {
  const { t } = useTranslation();
  const layout = widgets.map((w) => ({ i: w.id, x: w.x, y: w.y, w: w.w, h: w.h, minW: 2, minH: 2 }));

  function handleLayoutChange(newLayout) {
    if (!editMode) return;
    const updated = widgets.map((w) => {
      const l = newLayout.find((item) => item.i === w.id);
      return l ? { ...w, x: l.x, y: l.y, w: l.w, h: l.h } : w;
    });
    onLayoutChange(updated);
  }

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={{ lg: layout, md: layout }}
      breakpoints={{ lg: 1100, md: 800 }}
      cols={{ lg: 12, md: 8 }}
      rowHeight={70}
      isDraggable={editMode}
      isResizable={editMode}
      draggableHandle=".widget-drag-handle"
      onLayoutChange={handleLayoutChange}
      compactType="vertical"
      margin={[16, 16]}
    >
      {widgets.map((w) => {
        const def = WIDGET_REGISTRY[w.type];
        if (!def) return null;
        const Widget = def.component;
        return (
          <Box key={w.id}>
            <WidgetFrame title={t(def.titleKey)} editMode={editMode} onRemove={() => onRemove(w.id)}>
              <Widget />
            </WidgetFrame>
          </Box>
        );
      })}
    </ResponsiveGridLayout>
  );
}
