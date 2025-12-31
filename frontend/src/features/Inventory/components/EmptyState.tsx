import { Box, Button, Paper, Stack, Typography } from '@mui/material';

type Props = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function EmptyState({ title, subtitle, actionLabel, onAction }: Props) {
  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack spacing={1.25} alignItems="flex-start">
        <Typography variant="h6">{title}</Typography>
        {subtitle ? (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        ) : null}
        {actionLabel && onAction ? (
          <Box sx={{ pt: 1 }}>
            <Button variant="contained" onClick={onAction}>
              {actionLabel}
            </Button>
          </Box>
        ) : null}
      </Stack>
    </Paper>
  );
}
