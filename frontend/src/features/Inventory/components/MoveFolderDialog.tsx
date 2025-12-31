import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from '@mui/material';
import { useMemo, useState } from 'react';
import type { ID, InventoryFolder } from '../types';
import { buildFolderPath } from '../utils';

function isDescendant(folders: InventoryFolder[], nodeId: ID, maybeAncestorId: ID): boolean {
  // returns true if maybeAncestorId is in the parent chain of nodeId
  let cur = folders.find((f) => f.id === nodeId);
  while (cur?.parentId) {
    if (cur.parentId === maybeAncestorId) return true;
    cur = folders.find((f) => f.id === cur!.parentId);
  }
  return false;
}

type Props = {
  open: boolean;
  folders: InventoryFolder[];
  folderId: ID | null;
  onClose: () => void;
  onMove: (parentId: ID | null) => void;
};

export default function MoveFolderDialog({ open, folders, folderId, onClose, onMove }: Props) {
  const [parentId, setParentId] = useState<ID | null>(null);

  const options = useMemo(() => {
    return folders
      .filter((f) => f.id !== folderId && (folderId ? !isDescendant(folders, f.id, folderId) : true))
      .map((f) => ({ id: f.id, label: buildFolderPath(folders, f.id).map((x) => x.name).join(' / ') }));
  }, [folders, folderId]);

  const handleClose = () => {
    setParentId(null);
    onClose();
  };

  const handleMove = () => {
    onMove(parentId);
    setParentId(null);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Move folder</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <TextField
          select
          fullWidth
          label="New parent"
          value={parentId ?? ''}
          onChange={(e) => setParentId((e.target.value as ID) || null)}
          helperText="Select an optional parent folder (blank = root)"
        >
          <MenuItem value="">Root</MenuItem>
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
