import { Box, Button, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function AccessDeniedPage() {
  const navigate = useNavigate();
  return (
    <Box sx={{ p: 3, display: 'grid', placeItems: 'center' }}>
      <Paper sx={{ p: 3, maxWidth: 560, width: '100%' }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Access denied
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          You don’t have permission to view this page in the current workspace.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" onClick={() => navigate('/inventory/root')}>
            Go to Inventory
          </Button>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Back
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
