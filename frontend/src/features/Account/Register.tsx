import { registerUser } from '@/api/user';
import { sendNotification } from '@/hooks/slices/appSlice';
import { Button, Container, TextField } from '@mui/material';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

const Register = () => {
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

    function handleRegister(_event: any): void {
      if (password !== confirmPassword) {
        // You might want to dispatch a notification about the mismatch
        dispatch(sendNotification({
          severity: 'error',
          message: 'Passwords do not match.',
        }));
        return;
      }

    registerUser(username, email, password)
      .then((response) => {
        console.log('Registration successful', response);
      })
      .catch((error) => {
        console.error('Error registering user:', error);
        // You might want to dispatch a notification about the error
      });
    
    // loginUser().then(() => {
    //   // Handle successful login
    // }).catch(() => {
    //   // Handle login error
    // });
    // dispatch(sendNotification({
    //   severity: 'info',
    //   message: 'Login functionality is not implemented yet.',
    // }));
  }

  return (
    <Container>
      <h1>Register Page</h1>
      <TextField
        label="Email"
        variant="outlined"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Username"
        variant="outlined"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <TextField
        label="Password"
        type="password"
        variant="outlined"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <TextField
        label="Confirm Password"
        type="password"
        variant="outlined"
        fullWidth
        margin="normal"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={handleRegister}>
        Register
      </Button>
    </Container>
  );
};

export default Register;
