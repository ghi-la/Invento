import { Box, Checkbox, Divider, IconButton, Stack, TextField, Typography } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as List, type ListChildComponentProps } from 'react-window';
import { useMemo, useState } from 'react';

import type { ID, InventoryItem } from '../types';
import ItemContextMenu from './context/ItemContextMenu';

type Props = {
  items: InventoryItem[];
  onQuickUpdate?: (id: ID, patch: Partial<InventoryItem>) => void;
  canWriteItems?: boolean;
  canDeleteItems?: boolean;
  selectedIds: ID[];
  onToggleSelect: (id: ID) => void;
  onToggleSelectAll: (checked: boolean) => void;
  getDragIds: (id: ID) => ID[];
  onOpen: (id: ID) => void;
  onEdit: (id: ID) => void;
  onMove: (id: ID) => void;
  onDelete: (id: ID) => void;
};

export default function VirtualizedItemsList({
  items,
  onQuickUpdate,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  getDragIds,
  onOpen,
  onEdit,
  onMove,
  onDelete,
  canWriteItems = true,
  canDeleteItems = true,
}: Props) {
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allChecked = items.length > 0 && selectedIds.length === items.length;
  const someChecked = selectedIds.length > 0 && selectedIds.length < items.length;

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuItemId, setMenuItemId] = useState<ID | null>(null);
  const [editingQtyId, setEditingQtyId] = useState<ID | null>(null);
  const [editingQty, setEditingQty] = useState<string>('');

  const Row = ({ index, style }: ListChildComponentProps) => {
    const it = items[index];
    const checked = selectedSet.has(it.id);
    return (
      <Box
        style={style}
        draggable
        onDragStart={(e) => {
          const dragIds = getDragIds(it.id);
          e.dataTransfer.setData('application/x-invento-items', JSON.stringify(dragIds));
          e.dataTransfer.effectAllowed = 'move';
        }}
        onDoubleClick={() => onOpen(it.id)}
        onContextMenu={(e) => {
          e.preventDefault();
          setMenuAnchor(e.currentTarget as HTMLElement);
          setMenuItemId(it.id);
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          sx={{
            px: 1,
            height: 56,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: checked ? 'action.selected' : 'background.paper',
          }}
        >
          <Checkbox checked={checked} onChange={() => onToggleSelect(it.id)} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
              {it.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {it.sku ? `SKU ${it.sku} · ` : ''}{it.location ?? '—'}
            </Typography>
          </Box>
          {editingQtyId === it.id ? (
            <TextField
              size="small"
              value={editingQty}
              onChange={(e) => setEditingQty(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const n = Number(editingQty);
                  if (Number.isFinite(n) && onQuickUpdate) onQuickUpdate(it.id, { quantity: n });
                  setEditingQtyId(null);
                }
                if (e.key === 'Escape') {
                  setEditingQtyId(null);
                }
              }}
              onBlur={() => {
                const n = Number(editingQty);
                if (Number.isFinite(n) && onQuickUpdate) onQuickUpdate(it.id, { quantity: n });
                setEditingQtyId(null);
              }}
              inputProps={{ inputMode: 'numeric', style: { textAlign: 'right', fontVariantNumeric: 'tabular-nums' } }}
              sx={{ width: 90 }}
            />
          ) : (
            <Typography
              variant="body2"
              sx={{ width: 80, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}
              onClick={(e) => {
                e.stopPropagation();
                setEditingQtyId(it.id);
                setEditingQty(String(it.quantity));
              }}
              title="Click to edit quantity"
            >
              {it.quantity}
            </Typography>
          )}
          <IconButton size="small" onClick={() => onOpen(it.id)} aria-label="Open item">
            <OpenInNewIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              setMenuAnchor(e.currentTarget);
              setMenuItemId(it.id);
            }}
            aria-label="Item actions"
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>
    );
  };

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden', height: { xs: 420, md: 'calc(100vh - 280px)' } }}>
      <Stack direction="row" alignItems="center" sx={{ px: 1, height: 48, bgcolor: 'background.default' }}>
        <Checkbox
          checked={allChecked}
          indeterminate={someChecked}
          onChange={(e) => onToggleSelectAll(e.target.checked)}
        />
        <Typography variant="caption" sx={{ flex: 1, color: 'text.secondary' }}>
          Name
        </Typography>
        <Typography variant="caption" sx={{ width: 80, textAlign: 'right', color: 'text.secondary' }}>
          Qty
        </Typography>
        <Box sx={{ width: 72 }} />
      </Stack>
      <Divider />
      <Box sx={{ height: '100%' }}>
        <AutoSizer>
          {({ height, width }) => (
            <List height={height - 49} width={width} itemCount={items.length} itemSize={56}>
              {Row}
            </List>
          )}
        </AutoSizer>
      </Box>

      <ItemContextMenu canWriteItems={canWriteItems} canDeleteItems={canDeleteItems}
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => {
          setMenuAnchor(null);
          setMenuItemId(null);
        }}
        onEdit={() => menuItemId && onEdit(menuItemId)}
        onMove={() => menuItemId && onMove(menuItemId)}
        onDelete={() => menuItemId && onDelete(menuItemId)}
      />
    </Box>
  );
}
