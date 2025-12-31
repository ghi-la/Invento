import { Box, Button, Container, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function PageNotFound() {
  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start' }}>
        <Typography variant="h4" fontWeight={900}>
          404
        </Typography>
        <Typography variant="h6">Page not found</Typography>
        <Typography color="text.secondary">
          The page you are looking for doesn’t exist.
        </Typography>
        <Button variant="contained" component={RouterLink} to="/dashboard">
          Go to dashboard
        </Button>
      </Box>
    </Container>
  );
}
