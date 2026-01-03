import { Menu, MenuItem } from '@mui/material';

interface ContextMenuState {
  mouseX: number;
  mouseY: number;
  folderId: string;
}

interface FolderContextMenuProps {
  contextMenu: ContextMenuState | null;
  onClose: () => void;
  onAddSubfolder: () => void;
  onRename: () => void;
  onMove: () => void;
  onDelete: () => void;
}

export function FolderContextMenu({
  contextMenu,
  onClose,
  onAddSubfolder,
  onRename,
  onMove,
  onDelete,
}: FolderContextMenuProps) {
  return (
    <Menu
      open={Boolean(contextMenu)}
      onClose={onClose}
      anchorPosition={
        contextMenu
          ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
          : undefined
      }
      anchorReference="anchorPosition"
    >
      <MenuItem onClick={onAddSubfolder}>Add subfolder</MenuItem>
      <MenuItem onClick={onRename}>Rename</MenuItem>
      <MenuItem onClick={onMove}>Move...</MenuItem>
      <MenuItem onClick={onDelete} sx={{ color: 'error.main' }}>
        Delete
      </MenuItem>
    </Menu>
  );
}
