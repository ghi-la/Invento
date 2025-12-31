import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
  Checkbox,
  Tooltip,
} from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState } from 'react';
import type { InventoryItem, ID } from '../types';

type Props = {
  item: InventoryItem;
  selected?: boolean;
  onToggleSelect?: (id: ID) => void;
  getDragIds?: (id: ID) => ID[];
  onOpen: (id: ID) => void;
  onEdit: (id: ID) => void;
  onMove: (id: ID) => void;
  onDelete: (id: ID) => void;
  canWriteItems?: boolean;
  canDeleteItems?: boolean;
};

export default function ItemCard({ item, selected = false, onToggleSelect, getDragIds, onOpen, onEdit, onMove, onDelete ,
  canWriteItems = true,
  canDeleteItems = true,
}: Props) {
  const updated = new Date(item.updatedAtIso).toLocaleString();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  return (
    <Card
      variant="outlined"
      sx={{ borderRadius: 3, overflow: 'hidden', position: 'relative' }}
      onContextMenu={(e) => {
        e.preventDefault();
        setAnchorEl(e.currentTarget as HTMLElement);
      }}
      draggable
      onDragStart={(e) => {
        const ids = getDragIds ? getDragIds(item.id) : [item.id];
        e.dataTransfer.setData('application/x-invento-items', JSON.stringify(ids));
        e.dataTransfer.effectAllowed = 'move';
      }}
    >
      <Checkbox
        checked={Boolean(selected)}
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect?.(item.id);
        }}
        sx={{ position: 'absolute', top: 4, left: 4, zIndex: 2, bgcolor: 'background.paper', borderRadius: 2 }}
      />
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          setAnchorEl(e.currentTarget);
        }}
        sx={{
          position: 'absolute',
          top: 6,
          right: 6,
          zIndex: 2,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={() => setAnchorEl(null)}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            if (canWriteItems) onEdit(item.id);
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onMove(item.id);
          }}
        >
          Move…
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onDelete(item.id);
          }}
          sx={{ color: 'error.main' }}
        >
          Delete
        </MenuItem>
      </Menu>

      <CardActionArea onClick={() => onOpen(item.id)} onDoubleClick={() => onToggleSelect?.(item.id)}>
        {item.imageUrl ? (
          <CardMedia component="img" height="120" image={item.imageUrl} alt={item.name} />
        ) : (
          <Box
            sx={{
              height: 120,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'action.hover',
            }}
          >
            <Inventory2OutlinedIcon />
          </Box>
        )}

        <CardContent>
          <Stack spacing={0.75}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
              {item.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              Qty: {item.quantity}
              {item.unit ? ` ${item.unit}` : ''} {item.sku ? `• SKU ${item.sku}` : ''}
            </Typography>

            {item.tags.length ? (
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {item.tags.slice(0, 3).map((t) => (
                  <Chip key={t} label={t} size="small" variant="outlined" />
                ))}
                {item.tags.length > 3 ? <Chip label={`+${item.tags.length - 3}`} size="small" /> : null}
              </Stack>
            ) : (
              <Typography variant="caption" color="text.secondary">
                No tags
              </Typography>
            )}

            <Typography variant="caption" color="text.secondary" noWrap>
              Updated {updated}
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
