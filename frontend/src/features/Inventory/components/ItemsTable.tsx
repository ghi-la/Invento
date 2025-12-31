import {
  Chip,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import type React from 'react';
import { useState } from 'react';

import type { ID, InventoryItem } from '../types';

type Props = {
  items: InventoryItem[];
  selectedIds?: ID[];
  onToggleSelect?: (id: ID) => void;
  onToggleSelectAll?: (checked: boolean) => void;
  getDragIds?: (id: ID) => ID[];
  onOpen: (id: ID) => void;
  onEdit: (id: ID) => void;
  onMove: (id: ID) => void;
  onDelete: (id: ID) => void;
  canWriteItems?: boolean;
  canDeleteItems?: boolean;
};

export default function ItemsTable({ items, selectedIds = [], onToggleSelect, onToggleSelectAll, getDragIds, onOpen, onEdit, onMove, onDelete ,
  canWriteItems = true,
  canDeleteItems = true,
}: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeId, setActiveId] = useState<ID | null>(null);
  const menuOpen = Boolean(anchorEl);

  const openMenu = (e: React.MouseEvent<HTMLButtonElement>, id: ID) => {
    e.stopPropagation();
    setActiveId(id);
    setAnchorEl(e.currentTarget);
  };

  const closeMenu = () => {
    setAnchorEl(null);
    setActiveId(null);
  };

  const selectedSet = new Set(selectedIds);
  const allChecked = items.length > 0 && items.every((x) => selectedSet.has(x.id));
  const someChecked = items.some((x) => selectedSet.has(x.id)) && !allChecked;

  return (
    <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
      <Table size="small" aria-label="items table">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                checked={allChecked}
                indeterminate={someChecked}
                onChange={(e) => onToggleSelectAll?.(e.target.checked)}
              />
            </TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Qty</TableCell>
            <TableCell>SKU</TableCell>
            <TableCell>Tags</TableCell>
            <TableCell align="right" width={60}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((it) => (
            <TableRow
              key={it.id}
              hover
              onClick={() => onOpen(it.id)}
              sx={{ cursor: 'pointer', '&:last-child td': { borderBottom: 0 } }}
              draggable
              onDragStart={(e) => {
                const ids = getDragIds ? getDragIds(it.id) : [it.id];
                e.dataTransfer.setData('application/x-invento-items', JSON.stringify(ids));
                e.dataTransfer.effectAllowed = 'move';
              }}
            >
              <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                <Checkbox checked={selectedSet.has(it.id)} onChange={() => onToggleSelect?.(it.id)} />
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {it.name}
                </Typography>
                {it.location ? (
                  <Typography variant="caption" color="text.secondary">
                    {it.location}
                  </Typography>
                ) : null}
              </TableCell>

              <TableCell>
                {it.quantity}
                {it.unit ? ` ${it.unit}` : ''}
              </TableCell>

              <TableCell>{it.sku ?? '—'}</TableCell>

              <TableCell>
                {it.tags.length ? (
                  it.tags.slice(0, 3).map((t) => <Chip key={t} label={t} size="small" variant="outlined" sx={{ mr: 0.5 }} />)
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    —
                  </Typography>
                )}
              </TableCell>

              <TableCell align="right">
                <IconButton size="small" onClick={(e) => openMenu(e, it.id)}>
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Menu anchorEl={anchorEl} open={menuOpen} onClose={closeMenu} onClick={(e) => e.stopPropagation()}>
        <MenuItem
          onClick={() => {
            const id = activeId;
            closeMenu();
            if (id) onEdit(id);
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            const id = activeId;
            closeMenu();
            if (id) onMove(id);
          }}
        >
          Move…
        </MenuItem>
        <MenuItem
          onClick={() => {
            const id = activeId;
            closeMenu();
            if (id) onDelete(id);
          }}
          sx={{ color: 'error.main' }}
        >
          Delete
        </MenuItem>
      </Menu>
    </TableContainer>
  );
}
