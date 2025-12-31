import { Box, Button, Container, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function HomePage() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h3" fontWeight={850}>
          Invento
        </Typography>
        <Typography variant="h6" color="text.secondary">
          A Sortly-inspired inventory frontend (React + MUI).
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
          <Button variant="contained" component={RouterLink} to="/dashboard">
            Open app
          </Button>
          <Button variant="outlined" component={RouterLink} to="/login">
            Login
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
