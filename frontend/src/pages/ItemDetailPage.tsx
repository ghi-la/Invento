import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { Box, Button, Card, CardContent, CardMedia, Chip, Divider, Stack, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import ConfirmDialog from '@/features/Inventory/components/ConfirmDialog';
import ItemUpsertDrawer from '@/features/Inventory/components/ItemUpsertDrawer';
import MoveItemDialog from '@/features/Inventory/components/MoveItemDialog';
import { buildFolderPath } from '@/features/Inventory/utils';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { deleteItem, moveItem, updateItem } from '@/hooks/slices/inventorySlice';

export default function ItemDetailPage() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const folders = useAppSelector((s) => s.inventory.folders);
  const items = useAppSelector((s) => s.inventory.items);

  const item = useMemo(() => items.find((x) => x.id === itemId), [items, itemId]);

  const [editOpen, setEditOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const allTags = useMemo(() => Array.from(new Set(items.flatMap((i) => i.tags))).sort(), [items]);

  if (!item) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">Item not found</Typography>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/inventory/root')}>
          Go to inventory
        </Button>
      </Box>
    );
  }

  const folderPath = buildFolderPath(folders, item.folderId).map((x) => x.name).join(' / ');

  return (
    <Box sx={{ p: 2, maxWidth: 900 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }} spacing={2}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/inventory/${item.folderId}`)}>
          Back
        </Button>

        <Stack direction="row" spacing={1}>
          <Button startIcon={<EditOutlinedIcon />} variant="outlined" onClick={() => setEditOpen(true)}>
            Edit
          </Button>
          <Button startIcon={<DriveFileMoveOutlinedIcon />} variant="outlined" onClick={() => setMoveOpen(true)}>
            Move
          </Button>
          <Button startIcon={<DeleteOutlineOutlinedIcon />} color="error" variant="contained" onClick={() => setDeleteOpen(true)}>
            Delete
          </Button>
        </Stack>
      </Stack>

      <Card variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {item.imageUrl ? (
          <CardMedia component="img" height="280" image={item.imageUrl} alt={item.name} />
        ) : (
          <Box sx={{ height: 280, display: 'grid', placeItems: 'center', bgcolor: 'action.hover' }}>
            <Inventory2OutlinedIcon sx={{ fontSize: 56 }} />
          </Box>
        )}

        <CardContent>
          <Stack spacing={1}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {item.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Folder: {folderPath || 'Root'}
            </Typography>

            <Divider sx={{ my: 1 }} />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Info label="Quantity" value={`${item.quantity}${item.unit ? ` ${item.unit}` : ''}`} />
              <Info label="Location" value={item.location ?? '—'} />
              <Info label="Tags" value={item.tags.length ? String(item.tags.length) : '0'} />
            </Stack>

            <Divider sx={{ my: 1 }} />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Info label="SKU" value={item.sku ?? '—'} />
              <Info label="Barcode" value={item.barcode ?? '—'} />
              <Info label="Serial" value={item.serialNumber ?? '—'} />
            </Stack>

            <Divider sx={{ my: 1 }} />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Info label="Supplier" value={item.supplier ?? '—'} />
              <Info label="Purchase date" value={item.purchaseDateIso ?? '—'} />
              <Info label="Cost / Value" value={`${item.cost ?? '—'} / ${item.value ?? '—'}`} />
            </Stack>

            <Divider sx={{ my: 1 }} />

            <Typography variant="subtitle2">Tags</Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {item.tags.length ? item.tags.map((t) => <Chip key={t} label={t} variant="outlined" />) : <Chip label="No tags" />}
            </Stack>

            <Divider sx={{ my: 1 }} />

            <Typography variant="subtitle2">Attachments</Typography>
            <Stack spacing={0.5} sx={{ mt: 0.5 }}>
              {item.attachments?.length ? (
                item.attachments?.map((a) => (
                  <Typography key={a.id} variant="body2">
                    • {a.name || 'Untitled'} — {a.url}
                  </Typography>
                ))
              ) : (
                <Chip label="No attachments" />
              )}
            </Stack>

            <Divider sx={{ my: 1 }} />

            <Typography variant="subtitle2">Custom fields</Typography>
            <Stack spacing={0.5} sx={{ mt: 0.5 }}>
              {item.customFields?.length ? (
                item.customFields?.map((f) => (
                  <Stack key={f.id} direction="row" spacing={1}>
                    <Typography variant="body2" sx={{ minWidth: 180, fontWeight: 600 }}>
                      {f.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {f.value || '—'}
                    </Typography>
                  </Stack>
                ))
              ) : (
                <Chip label="No custom fields" />
              )}
            </Stack>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
              Updated {new Date(item.updatedAtIso).toLocaleString()}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <ItemUpsertDrawer
        open={editOpen}
        mode="edit"
        folderId={item.folderId}
        item={item}
        allTagOptions={allTags}
        onClose={() => setEditOpen(false)}
        onSubmit={(draft) => {
          dispatch(updateItem({ id: item.id, patch: draft }));
          setEditOpen(false);
        }}
      />

      <MoveItemDialog
        open={moveOpen}
        folders={folders}
        currentFolderId={item.folderId}
        onClose={() => setMoveOpen(false)}
        onMove={(folderId) => {
          dispatch(moveItem({ id: item.id, folderId }));
          setMoveOpen(false);
          navigate(`/inventory/${folderId}`);
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete item?"
        description="This will permanently remove the item."
        confirmText="Delete"
        danger
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          dispatch(deleteItem({ id: item.id }));
          setDeleteOpen(false);
          navigate(`/inventory/${item.folderId}`);
        }}
      />
    </Box>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ flex: 1 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Box>
  );
}
