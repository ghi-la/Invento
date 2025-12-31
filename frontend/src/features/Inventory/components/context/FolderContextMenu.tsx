import { Divider, Menu, MenuItem, Tooltip } from '@mui/material';

type Props = {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onCreateSubfolder: () => void;
  onRename: () => void;
  onMove: () => void;
  onDelete: () => void;
  canWriteFolders?: boolean;
  canDeleteFolders?: boolean;
};

export default function FolderContextMenu({
  anchorEl,
  open,
  onClose,
  onCreateSubfolder,
  onRename,
  onMove,
  onDelete,
  canWriteFolders = true,
  canDeleteFolders = true,
}: Props) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Tooltip title={!canWriteFolders ? 'Read-only' : ''} disableHoverListener={canWriteFolders} placement="left">
        <span>
          <MenuItem
            disabled={!canWriteFolders}
            onClick={() => {
              onClose();
              onCreateSubfolder();
            }}
          >
            Add subfolder
          </MenuItem>
        </span>
      </Tooltip>

      <Tooltip title={!canWriteFolders ? 'Read-only' : ''} disableHoverListener={canWriteFolders} placement="left">
        <span>
          <MenuItem
            disabled={!canWriteFolders}
            onClick={() => {
              onClose();
              onRename();
            }}
          >
            Rename
          </MenuItem>
        </span>
      </Tooltip>

      <Tooltip title={!canWriteFolders ? 'Read-only' : ''} disableHoverListener={canWriteFolders} placement="left">
        <span>
          <MenuItem
            disabled={!canWriteFolders}
            onClick={() => {
              onClose();
              onMove();
            }}
          >
            Move…
          </MenuItem>
        </span>
      </Tooltip>

      <Divider />

      <Tooltip title={!canDeleteFolders ? 'Read-only' : ''} disableHoverListener={canDeleteFolders} placement="left">
        <span>
          <MenuItem
            disabled={!canDeleteFolders}
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
