import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { getDialogConfig } from './FolderActions';
import type { DialogMode } from './useFolderTree';

interface FolderDialogProps {
  mode: DialogMode;
  value: string;
  onValueChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function FolderDialog({
  mode,
  value,
  onValueChange,
  onConfirm,
  onCancel,
}: FolderDialogProps) {
  const { title, label } = getDialogConfig(mode);

  return (
    <Dialog open={mode !== null} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label={label}
          type="text"
          fullWidth
          variant="outlined"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={onConfirm} variant="contained">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
