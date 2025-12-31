import { Box, Card, CardContent, Typography } from '@mui/material';
import { useEffect } from 'react';

export default function DashboardPage() {
  const 

  useEffect(() => {
    document.title = 'Dashboard - Invento';
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding: 2 }}>
      <Typography variant="h4" fontWeight={800}>
        Dashboard
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="body1">
            Step 1 is ready: layout + navigation + routing scaffold.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Next we can build the Inventory screen (folder tree + item list).
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
