import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ImageIcon from '@mui/icons-material/Image';
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import type { ID, InventoryItem } from '../types';

export type ItemDraft = Omit<InventoryItem, 'id' | 'updatedAtIso'>;

type Props = {
  open: boolean;
  mode: 'create' | 'edit';
  folderId: ID;
  item?: InventoryItem | null;
  allTagOptions: string[];
  onClose: () => void;
  onSubmit: (draft: ItemDraft) => void;
};

const emptyDraft = (folderId: ID): ItemDraft => ({
  folderId,
  name: '',
  sku: '',
  barcode: '',
  serialNumber: '',
  quantity: 1,
  unit: '',
  tags: [],
  location: '',
  supplier: '',
  purchaseDateIso: '',
  cost: undefined,
  value: undefined,
  imageUrl: '',
  attachments: [],
  customFields: [],
} );

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Unable to read file'));
    reader.readAsDataURL(file);
  });
}

export default function ItemUpsertDrawer({ open, mode, folderId, item, allTagOptions, onClose, onSubmit }: Props) {
  const [draft, setDraft] = useState<ItemDraft>(emptyDraft(folderId));
  const [tagInput, setTagInput] = useState('');

  const title = mode === 'create' ? 'Add item' : 'Edit item';

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && item) {
      setDraft({
        folderId: item.folderId,
        name: item.name,
        sku: item.sku ?? '',
        quantity: item.quantity ?? 0,
        unit: item.unit ?? '',
        tags: item.tags ?? [],
        location: item.location ?? '',
        imageUrl: item.imageUrl ?? '',
      });
    } else {
      setDraft(emptyDraft(folderId));
    }
    setTagInput('');
  }, [open, mode, item, folderId]);

  const canSubmit = useMemo(() => {
    return draft.name.trim().length > 0 && Number.isFinite(Number(draft.quantity));
  }, [draft.name, draft.quantity]);

  const submit = () => {
    if (!canSubmit) return;
    onSubmit({
      ...draft,
      name: draft.name.trim(),
      sku: draft.sku?.trim() || undefined,
      unit: draft.unit?.trim() || undefined,
      location: draft.location?.trim() || undefined,
      supplier: draft.supplier?.trim() || undefined,
      barcode: draft.barcode?.trim() || undefined,
      serialNumber: draft.serialNumber?.trim() || undefined,
      purchaseDateIso: draft.purchaseDateIso?.trim() || undefined,
      cost: typeof draft.cost === 'number' && Number.isFinite(draft.cost) ? draft.cost : undefined,
      value: typeof draft.value === 'number' && Number.isFinite(draft.value) ? draft.value : undefined,
      imageUrl: draft.imageUrl?.trim() || undefined,
      tags: draft.tags ?? [],
    });
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 480 } } }}>
      <Box sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </Box>

      <Divider />

      <Box sx={{ p: 2, pb: 10 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              variant="rounded"
              src={draft.imageUrl?.startsWith('data:') || draft.imageUrl?.startsWith('http') ? draft.imageUrl : undefined}
              sx={{ width: 72, height: 72, bgcolor: 'action.hover' }}
            >
              <ImageIcon />
            </Avatar>
            <Stack spacing={1} sx={{ flex: 1 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<ImageIcon />}
              >
                Upload image
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const dataUrl = await fileToDataUrl(f);
                    setDraft((d) => ({ ...d, imageUrl: dataUrl }));
                    // reset so selecting the same file again triggers change
                    e.target.value = '';
                  }}
                />
              </Button>
              {draft.imageUrl ? (
                <Button size="small" color="error" onClick={() => setDraft((d) => ({ ...d, imageUrl: '' }))}>
                  Remove image
                </Button>
              ) : null}
            </Stack>
          </Stack>

          <TextField
            label="Name"
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            autoFocus
            required
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label="Quantity"
              type="number"
              value={draft.quantity}
              onChange={(e) => setDraft((d) => ({ ...d, quantity: Number(e.target.value) }))}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Unit"
              value={draft.unit ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, unit: e.target.value }))}
              sx={{ flex: 1 }}
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="SKU"
            value={draft.sku ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, sku: e.target.value }))}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Barcode"
            value={draft.barcode ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, barcode: e.target.value }))}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Serial number"
            value={draft.serialNumber ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, serialNumber: e.target.value }))}
            sx={{ flex: 1 }}
          />
        </Stack>

          <TextField
            label="Location"
            value={draft.location ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
            placeholder="e.g., Lab drawer 3"
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Supplier"
              value={draft.supplier ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, supplier: e.target.value }))}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Purchase date"
              type="date"
              value={draft.purchaseDateIso ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, purchaseDateIso: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Cost"
              type="number"
              value={draft.cost ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                setDraft((d) => ({ ...d, cost: v === '' ? undefined : Number(v) }));
              }}
              sx={{ flex: 1 }}
              inputProps={{ min: 0, step: 'any' }}
            />
            <TextField
              label="Value"
              type="number"
              value={draft.value ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                setDraft((d) => ({ ...d, value: v === '' ? undefined : Number(v) }));
              }}
              sx={{ flex: 1 }}
              inputProps={{ min: 0, step: 'any' }}
            />
          </Stack>


          <TextField
            label="Image URL (optional)"
            value={draft.imageUrl ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, imageUrl: e.target.value }))}
            placeholder="https://..."
            helperText="You can upload an image above, or paste a URL."
          />

          <Autocomplete
            multiple
            freeSolo
            options={allTagOptions}
            value={draft.tags}
            inputValue={tagInput}
            onInputChange={(_, v) => setTagInput(v)}
            onChange={(_, v) => setDraft((d) => ({ ...d, tags: v as string[] }))}
            renderTags={(value: readonly string[], getTagProps) =>
              value.map((option: string, index: number) => <Chip variant="outlined" label={option} {...getTagProps({ index })} key={option} />)
            }
            renderInput={(params) => <TextField {...params} label="Tags" placeholder="Add tags…" />}
          />
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2">Attachments</Typography>
        <Stack spacing={1} sx={{ mt: 1 }}>
          {draft.attachments?.map((a) => (
            <Stack key={a.id} direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
              <TextField
                label="Name"
                value={a.name}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    attachments: d.attachments.map((x) => (x.id === a.id ? { ...x, name: e.target.value } : x)),
                  }))
                }
                sx={{ flex: 1 }}
              />
              <TextField
                label="URL"
                value={a.url}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    attachments: d.attachments.map((x) => (x.id === a.id ? { ...x, url: e.target.value } : x)),
                  }))
                }
                sx={{ flex: 2 }}
              />
              <IconButton
                aria-label="Remove attachment"
                onClick={() => setDraft((d) => ({ ...d, attachments: d.attachments.filter((x) => x.id !== a.id) }))}
              >
                <DeleteOutlineIcon />
              </IconButton>
            </Stack>
          ))}
          <Button
            startIcon={<AddIcon />}
            onClick={() =>
              setDraft((d) => ({ ...d, attachments: [...d.attachments, { id: makeId(), name: '', url: '' }] }))
            }
          >
            Add attachment
          </Button>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2">Custom fields</Typography>
        <Stack spacing={1} sx={{ mt: 1 }}>
          {draft.customFields?.map((f) => (
            <Stack key={f.id} direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
              <TextField
                label="Field name"
                value={f.name}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    customFields: d.customFields.map((x) => (x.id === f.id ? { ...x, name: e.target.value } : x)),
                  }))
                }
                sx={{ flex: 1 }}
              />
              <TextField
                select
                label="Type"
                value={f.type}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    customFields: d.customFields.map((x) =>
                      x.id === f.id ? { ...x, type: e.target.value as any, value: '' } : x,
                    ),
                  }))
                }
                sx={{ width: { xs: '100%', sm: 180 } }}
              >
                <MenuItem value="text">Text</MenuItem>
                <MenuItem value="number">Number</MenuItem>
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="select">Select</MenuItem>
              </TextField>

              {f.type === 'date' ? (
                <TextField
                  label="Value"
                  type="date"
                  value={f.value}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      customFields: d.customFields.map((x) => (x.id === f.id ? { ...x, value: e.target.value } : x)),
                    }))
                  }
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1 }}
                />
              ) : (
                <TextField
                  label="Value"
                  value={f.value}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      customFields: d.customFields.map((x) => (x.id === f.id ? { ...x, value: e.target.value } : x)),
                    }))
                  }
                  sx={{ flex: 1 }}
                />
              )}

              <IconButton
                aria-label="Remove field"
                onClick={() => setDraft((d) => ({ ...d, customFields: d.customFields.filter((x) => x.id !== f.id) }))}
              >
                <DeleteOutlineIcon />
              </IconButton>
            </Stack>
          ))}

          <Button
            startIcon={<AddIcon />}
            onClick={() =>
              setDraft((d) => ({
                ...d,
                customFields: [...d.customFields, { id: makeId(), name: '', type: 'text', value: '' }],
              }))
            }
          >
            Add custom field
          </Button>
        </Stack>

      </Box>

      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          p: 2,
          borderTop: (t) => `1px solid ${t.palette.divider}`,
          bgcolor: 'background.paper',
        }}
      >
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={submit} disabled={!canSubmit}>
            {mode === 'create' ? 'Create' : 'Save'}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}
