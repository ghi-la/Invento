import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import type React from 'react';

type Props = {
  open: boolean;
  title: string;
  nameLabel: string;
  initialName?: string;
  confirmText?: string;
  onClose: () => void;
  onSubmit: (name: string) => void;
};

export default function CreateNameDialog({
  open,
  title,
  nameLabel,
  initialName = '',
  confirmText = 'Create',
  onClose,
  onSubmit,
}: Props) {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (open) setName(initialName);
  }, [open, initialName]);

  const canSubmit = useMemo(() => name.trim().length >= 2, [name]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label={nameLabel}
            value={name}
            autoFocus
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter' && canSubmit) {
                onSubmit(name.trim());
              }
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!canSubmit}
          onClick={() => {
            onSubmit(name.trim());
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
