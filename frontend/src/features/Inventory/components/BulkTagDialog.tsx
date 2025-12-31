import { Autocomplete, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import { useMemo, useState } from 'react';

type Mode = 'add' | 'remove';

type Props = {
  open: boolean;
  count: number;
  allTagOptions: string[];
  onClose: () => void;
  onConfirm: (mode: Mode, tags: string[]) => void;
};

export default function BulkTagDialog({ open, count, allTagOptions, onClose, onConfirm }: Props) {
  const [mode, setMode] = useState<Mode>('add');
  const [tags, setTags] = useState<string[]>([]);

  const helper = useMemo(() => {
    if (mode === 'add') return 'Tags will be added to all selected items (duplicates are ignored).';
    return 'Tags will be removed from all selected items.';
  }, [mode]);

  const title = mode === 'add' ? `Add tags (${count})` : `Remove tags (${count})`;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 900 }}>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label="Add"
              color={mode === 'add' ? 'primary' : 'default'}
              onClick={() => setMode('add')}
              variant={mode === 'add' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Remove"
              color={mode === 'remove' ? 'primary' : 'default'}
              onClick={() => setMode('remove')}
              variant={mode === 'remove' ? 'filled' : 'outlined'}
            />
            <Typography variant="body2" color="text.secondary">
              {helper}
            </Typography>
          </Stack>

          <Autocomplete
            multiple
            freeSolo
            options={allTagOptions}
            value={tags}
            onChange={(_, v) => setTags(v)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => <Chip variant="outlined" label={option} {...getTagProps({ index })} key={`${option}-${index}`} />)
            }
            renderInput={(params) => <TextField {...params} label="Tags" placeholder="Type to create a new tag" />}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() => {
            const clean = Array.from(new Set(tags.map((t) => t.trim()).filter(Boolean)));
            onConfirm(mode, clean);
            setTags([]);
          }}
          disabled={tags.length === 0}
        >
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
}
