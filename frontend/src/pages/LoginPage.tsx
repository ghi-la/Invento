import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin } from '@/api/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  if (!email || !password) {
    setError('Please enter email and password.');
    return;
  }

  try {
    const data = await apiLogin(email, password);
    localStorage.setItem('invento_token', data.token);
    localStorage.setItem('invento_user', JSON.stringify(data.user));
    navigate('/dashboard');
  } catch (err: any) {
    const msg =
      err?.response?.data?.message ??
      err?.message ??
      'Login failed';
    setError(String(msg));
  }
};


  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Typography variant="h4" fontWeight={850} sx={{ mb: 2 }}>
        Login
      </Typography>

      <Card>
        <CardContent>
          <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              fullWidth
            />

            <Button type="submit" variant="contained" size="large">
              Sign in
            </Button>

            <Typography variant="body2" color="text.secondary">
              (Temporary) Any email + password will route you to the dashboard.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
