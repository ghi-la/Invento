"use client";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CloseIcon from "@mui/icons-material/Close";
import { WIDGET_REGISTRY } from "./widgetRegistry";

export default function AddWidgetDialog({ open, onClose, onAdd, existingTypes }) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
        {t("dashboard.addWidgetDialogTitle")}
        <IconButton onClick={onClose} sx={{ ml: "auto" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pb: 2 }}>
        <List>
          {Object.entries(WIDGET_REGISTRY).map(([type, def]) => (
            <ListItemButton key={type} onClick={() => onAdd(type)} sx={{ borderRadius: 1.5, mb: 0.5 }}>
              <ListItemText primary={t(def.titleKey)} secondary={t(def.descriptionKey)} />
              <AddCircleIcon color="warning" />
            </ListItemButton>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
}
