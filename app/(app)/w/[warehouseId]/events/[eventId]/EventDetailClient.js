"use client";
import { useState } from "react";
import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
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
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AddIcon from "@mui/icons-material/Add";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import EventForm from "@/components/EventForm";
import { useWarehouse } from "@/components/WarehouseContext";
import { formatCurrency } from "@/lib/currency";
import AddEventItemDialog from "./AddEventItemDialog";
import ReturnItemDialog from "./ReturnItemDialog";
import CloseEventDialog from "./CloseEventDialog";

const STATUS_COLOR = { planning: "default", active: "warning", completed: "success" };

export default function EventDetailClient({ initialEvent, initialReturns }) {
  const { t } = useTranslation();
  const { warehouseId, eventId } = useParams();
  const router = useRouter();
  const { can, warehouse } = useWarehouse();

  const { data: event, error: loadError, isLoading, mutate } = useSWR(
    `/api/warehouses/${warehouseId}/events/${eventId}`,
    { fallbackData: initialEvent || undefined }
  );
  const { data: activity, isLoading: activityLoading, mutate: mutateActivity } = useSWR(
    `/api/warehouses/${warehouseId}/events/${eventId}/returns?limit=10`,
    { fallbackData: initialReturns ? { returns: initialReturns } : undefined }
  );

  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [returnTarget, setReturnTarget] = useState(null);
  const [closeOpen, setCloseOpen] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState(null);
  const [activating, setActivating] = useState(false);

  async function refresh() {
    await Promise.all([mutate(), mutateActivity()]);
  }

  function handleItemAdded() {
    setAddOpen(false);
    refresh();
  }

  function handleReturned() {
    setReturnTarget(null);
    refresh();
  }

  function handleClosed() {
    setCloseOpen(false);
    refresh();
  }

  async function handleSave(values) {
    setError("");
    const res = await fetch(`/api/warehouses/${warehouseId}/events/${eventId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || t("events.errors.saveFailed"));
      return;
    }
    await mutate();
    setEditing(false);
  }

  async function handleActivate() {
    setActivating(true);
    try {
      await fetch(`/api/warehouses/${warehouseId}/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      });
      await mutate();
    } finally {
      setActivating(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetch(`/api/warehouses/${warehouseId}/events/${eventId}`, { method: "DELETE" });
      router.push(`/w/${warehouseId}/events`);
    } finally {
      setDeleting(false);
    }
  }

  async function handleDeleteItem(itemId) {
    setDeletingItemId(itemId);
    try {
      await fetch(`/api/warehouses/${warehouseId}/events/${eventId}/items/${itemId}`, { method: "DELETE" });
      await mutate();
    } finally {
      setDeletingItemId(null);
    }
  }

  if (loadError) {
    return (
      <Box sx={{ maxWidth: 720, mx: "auto", textAlign: "center", py: 8 }}>
        <ErrorOutlineIcon sx={{ fontSize: 48, color: "error.main", mb: 2 }} />
        <Typography variant="h6" fontWeight={700}>
          {t("events.errors.loadFailed")}
        </Typography>
        <Button variant="outlined" onClick={() => mutate()} sx={{ mt: 2 }}>
          {t("common.retry")}
        </Button>
      </Box>
    );
  }

  if (isLoading || !event) {
    return (
      <Box sx={{ maxWidth: 720, mx: "auto" }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="text" width="40%" sx={{ fontSize: "1.5rem" }} />
        </Stack>
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={120} />
          <Skeleton variant="rounded" height={200} />
        </Stack>
      </Box>
    );
  }

  const isCompleted = event.status === "completed";
  const warehouseItems = event.items.filter((i) => i.source === "warehouse");
  const supplierItems = event.items.filter((i) => i.source === "supplier");

  return (
    <Box sx={{ maxWidth: 720, mx: "auto" }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <IconButton onClick={() => router.push(`/w/${warehouseId}/events`)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700} sx={{ flex: 1 }} noWrap>
          {editing ? t("events.editTitle") : event.name}
        </Typography>
        {can("editor") && !editing && !isCompleted && (
          <>
            {event.status === "planning" && (
              <Button
                size="small"
                startIcon={activating ? <CircularProgress size={14} color="inherit" /> : <PlayArrowIcon />}
                onClick={handleActivate}
                disabled={activating}
              >
                {t("events.activate")}
              </Button>
            )}
            <Button size="small" color="warning" startIcon={<DoneAllIcon />} onClick={() => setCloseOpen(true)}>
              {t("events.closeEvent")}
            </Button>
            <IconButton onClick={() => setEditing(true)}>
              <EditIcon />
            </IconButton>
            {event.items.length === 0 && (
              <IconButton color="error" onClick={() => setConfirmDelete(true)}>
                <DeleteIcon />
              </IconButton>
            )}
          </>
        )}
      </Stack>

      {editing ? (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <EventForm initial={event} onSubmit={handleSave} submitLabel={t("common.saveChanges")} error={error} />
            <Button sx={{ mt: 1 }} onClick={() => setEditing(false)} fullWidth>
              {t("common.cancel")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip size="small" color={STATUS_COLOR[event.status]} label={t(`events.status.${event.status}`)} />
                <Typography variant="body2" color="text.secondary">
                  {format(new Date(event.startDate), "MMM d")} – {format(new Date(event.endDate), "MMM d, yyyy")}
                </Typography>
                {event.location && (
                  <Typography variant="body2" color="text.secondary">
                    · {event.location}
                  </Typography>
                )}
              </Stack>
              {event.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                  {event.description}
                </Typography>
              )}
              <Button
                size="small"
                startIcon={<AssessmentIcon />}
                sx={{ mt: 1.5 }}
                onClick={() => router.push(`/w/${warehouseId}/events/${eventId}/report`)}
              >
                {t("events.report.title")}
              </Button>
            </CardContent>
          </Card>

          <ItemsSection
            title={t("events.sourceWarehouse")}
            icon={<Inventory2Icon fontSize="small" />}
            items={warehouseItems}
            currency={warehouse?.currency}
            canEdit={can("editor")}
            isCompleted={isCompleted}
            deletingItemId={deletingItemId}
            onReturn={setReturnTarget}
            onDelete={handleDeleteItem}
          />
          <ItemsSection
            title={t("events.sourceSupplier")}
            icon={<LocalShippingIcon fontSize="small" />}
            items={supplierItems}
            currency={warehouse?.currency}
            canEdit={can("editor")}
            isCompleted={isCompleted}
            deletingItemId={deletingItemId}
            onReturn={setReturnTarget}
            onDelete={handleDeleteItem}
          />

          {can("editor") && !isCompleted && (
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
              {t("events.addItem")}
            </Button>
          )}

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
              {!activityLoading && !activity?.returns?.length && (
                <Typography variant="body2" color="text.secondary">
                  {t("product.noActivity")}
                </Typography>
              )}
              <List dense>
                {!activityLoading &&
                  activity?.returns?.map((r) => (
                    <ListItem key={r.id} disableGutters>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: "success.light", width: 32, height: 32 }}>
                          <KeyboardReturnIcon fontSize="small" />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${r.itemName} · +${r.quantity}`}
                        secondary={`${r.userName} · ${formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}`}
                      />
                    </ListItem>
                  ))}
              </List>
            </CardContent>
          </Card>
        </Stack>
      )}

      <AddEventItemDialog open={addOpen} onClose={() => setAddOpen(false)} onAdded={handleItemAdded} />
      <ReturnItemDialog item={returnTarget} onClose={() => setReturnTarget(null)} onReturned={handleReturned} />
      <CloseEventDialog open={closeOpen} event={event} onClose={() => setCloseOpen(false)} onClosed={handleClosed} />

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>{t("events.deleteConfirmTitle", { name: event.name })}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {t("events.deleteConfirmBody")}
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

function ItemsSection({ title, icon, items, currency, canEdit, isCompleted, deletingItemId, onReturn, onDelete }) {
  const { t } = useTranslation();
  if (items.length === 0) return null;

  return (
    <Card>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          {icon}
          <Typography variant="subtitle1" fontWeight={700}>
            {title}
          </Typography>
        </Stack>
        <List disablePadding>
          {items.map((item, idx) => (
            <Box key={item.id}>
              {idx > 0 && <Divider component="li" />}
              <ListItem disableGutters>
                <ListItemText
                  primary={item.name}
                  secondary={
                    <>
                      {t("events.quantityTaken")}: {item.quantityTaken} · {t("events.quantityReturned")}:{" "}
                      {item.quantityReturned} · {formatCurrency(item.unitCost, currency)} ×{" "}
                      {item.quantityTaken} = {formatCurrency(item.lineCost, currency)}
                    </>
                  }
                />
                <Stack direction="row" spacing={0.5} alignItems="center">
                  {isCompleted ? (
                    item.shortageQuantity > 0 && (
                      <Chip size="small" color="error" label={t("events.shortage") + `: ${item.shortageQuantity}`} />
                    )
                  ) : (
                    item.outstanding > 0 && (
                      <Chip size="small" color="warning" label={t("events.outstanding") + `: ${item.outstanding}`} />
                    )
                  )}
                  {canEdit && !isCompleted && item.outstanding > 0 && (
                    <IconButton size="small" onClick={() => onReturn(item)}>
                      <KeyboardReturnIcon fontSize="small" />
                    </IconButton>
                  )}
                  {canEdit && !isCompleted && item.quantityReturned === 0 && (
                    <IconButton
                      size="small"
                      color="error"
                      disabled={deletingItemId === item.id}
                      onClick={() => onDelete(item.id)}
                    >
                      {deletingItemId === item.id ? (
                        <CircularProgress size={16} />
                      ) : (
                        <DeleteIcon fontSize="small" />
                      )}
                    </IconButton>
                  )}
                </Stack>
              </ListItem>
            </Box>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
