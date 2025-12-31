import {
  Autocomplete,
  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Popover,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { useMemo, useState } from 'react';

import type { InventorySortKey } from '@/hooks/slices/inventoryUiSlice';

type Props = {
  allTagOptions: string[];
  tags: string[];
  lowStockOnly: boolean;
  missingSkuOnly: boolean;
  missingPhotoOnly: boolean;
  qtyMin: number | null;
  qtyMax: number | null;
  updatedAfter: string | null; // YYYY-MM-DD
  updatedBefore: string | null; // YYYY-MM-DD
  locationQuery: string;
  sortKey: InventorySortKey;

  onChangeTags: (tags: string[]) => void;
  onChangeLowStockOnly: (v: boolean) => void;
  onChangeMissingSkuOnly: (v: boolean) => void;
  onChangeMissingPhotoOnly: (v: boolean) => void;
  onChangeQtyMin: (v: number | null) => void;
  onChangeQtyMax: (v: number | null) => void;
  onChangeUpdatedAfter: (v: string | null) => void;
  onChangeUpdatedBefore: (v: string | null) => void;
  onChangeLocationQuery: (v: string) => void;
  onChangeSortKey: (k: InventorySortKey) => void;
  onClear: () => void;
};

function parseNumberOrNull(s: string): number | null {
  const t = s.trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export default function InventoryFiltersPopover({
  allTagOptions,
  tags,
  lowStockOnly,
  missingSkuOnly,
  missingPhotoOnly,
  qtyMin,
  qtyMax,
  updatedAfter,
  updatedBefore,
  locationQuery,
  sortKey,
  onChangeTags,
  onChangeLowStockOnly,
  onChangeMissingSkuOnly,
  onChangeMissingPhotoOnly,
  onChangeQtyMin,
  onChangeQtyMax,
  onChangeUpdatedAfter,
  onChangeUpdatedBefore,
  onChangeLocationQuery,
  onChangeSortKey,
  onClear,
}: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const activeCount = useMemo(() => {
    let c = 0;
    if (tags.length) c += 1;
    if (lowStockOnly) c += 1;
    if (missingSkuOnly) c += 1;
    if (missingPhotoOnly) c += 1;
    if (qtyMin != null) c += 1;
    if (qtyMax != null) c += 1;
    if (updatedAfter) c += 1;
    if (updatedBefore) c += 1;
    if (locationQuery.trim()) c += 1;
    if (sortKey !== 'updatedDesc') c += 1;
    return c;
  }, [
    tags.length,
    lowStockOnly,
    missingSkuOnly,
    missingPhotoOnly,
    qtyMin,
    qtyMax,
    updatedAfter,
    updatedBefore,
    locationQuery,
    sortKey,
  ]);

  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)} aria-label="Filters">
        <Badge color="primary" badgeContent={activeCount} invisible={activeCount === 0}>
          <FilterAltIcon fontSize="small" />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Box sx={{ p: 2.5, width: 380 }}>
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                Filters
              </Typography>
              <Button size="small" onClick={onClear}>
                Clear
              </Button>
            </Stack>

            <Autocomplete
              multiple
              options={allTagOptions}
              value={tags}
              onChange={(_, v) => onChangeTags(v)}
              renderInput={(params) => (
                <TextField {...params} label="Tags" placeholder="Filter by tag" size="small" />
              )}
            />

            <TextField
              size="small"
              label="Location contains"
              value={locationQuery}
              onChange={(e) => onChangeLocationQuery(e.target.value)}
              placeholder="e.g., Lab, Freezer, Shelf A"
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField
                size="small"
                label="Qty min"
                value={qtyMin ?? ''}
                onChange={(e) => onChangeQtyMin(parseNumberOrNull(e.target.value))}
                inputProps={{ inputMode: 'numeric' }}
                sx={{ flex: 1 }}
              />
              <TextField
                size="small"
                label="Qty max"
                value={qtyMax ?? ''}
                onChange={(e) => onChangeQtyMax(parseNumberOrNull(e.target.value))}
                inputProps={{ inputMode: 'numeric' }}
                sx={{ flex: 1 }}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField
                size="small"
                label="Updated after"
                type="date"
                value={updatedAfter ?? ''}
                onChange={(e) => onChangeUpdatedAfter(e.target.value ? e.target.value : null)}
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1 }}
              />
              <TextField
                size="small"
                label="Updated before"
                type="date"
                value={updatedBefore ?? ''}
                onChange={(e) => onChangeUpdatedBefore(e.target.value ? e.target.value : null)}
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1 }}
              />
            </Stack>

            <FormControlLabel
              control={<Checkbox checked={lowStockOnly} onChange={(e) => onChangeLowStockOnly(e.target.checked)} />}
              label="Low stock only"
            />
            <FormControlLabel
              control={<Checkbox checked={missingSkuOnly} onChange={(e) => onChangeMissingSkuOnly(e.target.checked)} />}
              label="Missing SKU only"
            />
            <FormControlLabel
              control={<Checkbox checked={missingPhotoOnly} onChange={(e) => onChangeMissingPhotoOnly(e.target.checked)} />}
              label="Missing photo only"
            />

            <Divider />

            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary">
                Sort
              </Typography>
              <Select size="small" value={sortKey} onChange={(e) => onChangeSortKey(e.target.value as InventorySortKey)}>
                <MenuItem value="updatedDesc">Recently updated</MenuItem>
                <MenuItem value="nameAsc">Name (A → Z)</MenuItem>
                <MenuItem value="qtyDesc">Quantity (high → low)</MenuItem>
              </Select>
            </Stack>
          </Stack>
        </Box>
      </Popover>
    </>
  );
}
