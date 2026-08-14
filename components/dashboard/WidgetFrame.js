"use client";
import { Card, Box, Typography, IconButton } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import CloseIcon from "@mui/icons-material/Close";

export default function WidgetFrame({ title, editMode, onRemove, children }) {
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Box
        className={editMode ? "widget-drag-handle" : undefined}
        sx={{
          display: "flex",
          alignItems: "center",
          px: 1.5,
          py: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          cursor: editMode ? "grab" : "default",
          bgcolor: editMode ? "grey.50" : "transparent",
          flexShrink: 0,
        }}
      >
        {editMode && <DragIndicatorIcon fontSize="small" sx={{ color: "text.disabled", mr: 0.5 }} />}
        <Typography variant="subtitle2" fontWeight={700} sx={{ flex: 1 }} noWrap>
          {title}
        </Typography>
        {editMode && (
          <IconButton size="small" onClick={onRemove}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      <Box sx={{ p: 1.5, flex: 1, minHeight: 0 }}>{children}</Box>
    </Card>
  );
}
