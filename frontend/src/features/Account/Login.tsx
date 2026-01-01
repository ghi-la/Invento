import { loginUser } from "@/api/user";
import { setLoggedUser } from "@/hooks/slices/appSlice";
import { Button, Container, TextField } from "@mui/material";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleLogin(_event: any): void {
    loginUser(email, password)
      .then((response) => {
        localStorage.setItem('token', response.token);
        dispatch(setLoggedUser(response.data));
        navigate('/dashboard');
        // console.log("Login successful", response);
      })
      .catch((error) => {
        console.error('Error logging in user:', error);
        // You might want to dispatch a notification about the error
      });
  }

  return (
    <Container>
      <h1>Login Page</h1>
      <TextField
        label="Email"
        variant="outlined"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
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
      <Button variant="contained" color="primary" onClick={handleLogin}>
        Log In
      </Button>
    </Container>
  );
};

export default Login;
