import { Menu, MenuItem, Tooltip } from '@mui/material';

type Props = {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onMove: () => void;
  onDelete: () => void;
  canWriteItems?: boolean;
  canDeleteItems?: boolean;
};

export default function ItemContextMenu({
  anchorEl,
  open,
  onClose,
  onEdit,
  onMove,
  onDelete,
  canWriteItems = true,
  canDeleteItems = true,
}: Props) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Tooltip title={!canWriteItems ? 'Read-only' : ''} disableHoverListener={canWriteItems} placement="left">
        <span>
          <MenuItem
            disabled={!canWriteItems}
            onClick={() => {
              onClose();
              onEdit();
            }}
          >
            Edit
          </MenuItem>
        </span>
      </Tooltip>

      <Tooltip title={!canWriteItems ? 'Read-only' : ''} disableHoverListener={canWriteItems} placement="left">
        <span>
          <MenuItem
            disabled={!canWriteItems}
            onClick={() => {
              onClose();
              onMove();
            }}
          >
            Move…
          </MenuItem>
        </span>
      </Tooltip>

      <Tooltip title={!canDeleteItems ? 'Read-only' : ''} disableHoverListener={canDeleteItems} placement="left">
        <span>
          <MenuItem
            disabled={!canDeleteItems}
            onClick={() => {
              onClose();
              onDelete();
            }}
            sx={{ color: 'error.main' }}
          >
            Delete
          </MenuItem>
        </span>
      </Tooltip>
    </Menu>
  );
}
