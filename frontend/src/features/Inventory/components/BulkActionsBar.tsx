import { Button, Paper, Stack, Typography } from '@mui/material';

type Props = {
  count: number;
  onClear: () => void;
  onMove: () => void;
  onTags: () => void;
  onDelete: () => void;
};

export default function BulkActionsBar({ count, onClear, onMove, onTags, onDelete }: Props) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.25,
        position: 'sticky',
        top: 72,
        zIndex: 2,
        backdropFilter: 'blur(6px)',
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between">
        <Typography variant="subtitle2">{count} selected</Typography>
        <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}>
          <Button size="small" onClick={onClear}>
            Clear
          </Button>
          <Button size="small" variant="outlined" onClick={onMove}>
            Move…
          </Button>
          <Button size="small" variant="outlined" onClick={onTags}>
            Tags…
          </Button>
          <Button size="small" color="error" variant="contained" onClick={onDelete}>
            Delete
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
