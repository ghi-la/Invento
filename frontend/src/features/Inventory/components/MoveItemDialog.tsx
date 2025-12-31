import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import type { ID, InventoryFolder } from '../types';
import { buildFolderPath } from '../utils';

type Props = {
  open: boolean;
  folders: InventoryFolder[];
  currentFolderId?: ID;
  count?: number;
  onClose: () => void;
  onMove: (folderId: ID) => void;
};

export default function MoveItemDialog({ open, folders, currentFolderId, count = 1, onClose, onMove }: Props) {
  const [folderId, setFolderId] = useState<ID>(currentFolderId ?? 'root');

  // keep selection stable if dialog opens for a different item/folder
  useEffect(() => {
    if (!open) return;
    setFolderId(currentFolderId ?? 'root');
  }, [open, currentFolderId]);

  const options = useMemo(() => {
    return folders.map((f) => ({ id: f.id, label: buildFolderPath(folders, f.id).map((x) => x.name).join(' / ') }));
  }, [folders]);

  const handleClose = () => {
    setFolderId(currentFolderId ?? 'root');
    onClose();
  };

  const handleMove = () => {
    onMove(folderId);
  };

  const title = count > 1 ? `Move items (${count})` : 'Move item';

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <TextField select fullWidth label="Destination folder" value={folderId} onChange={(e) => setFolderId(e.target.value as ID)}>
          {options.map((o) => (
            <MenuItem key={o.id} value={o.id}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleMove}>
          Move
        </Button>
      </DialogActions>
    </Dialog>
  );
}
