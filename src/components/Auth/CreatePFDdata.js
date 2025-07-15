import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../../redux/slices/authSlice';
import { Button, TextField, Box } from '@mui/material';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      dispatch(login(username.trim()));
      window.location.reload(); // <-- This reloads the app after login
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <TextField
        label="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        required
        sx={{ mb: 2 }}
      />
      <Button type="submit" variant="contained" color="primary">
        Login
      </Button>
    </Box>
  );
};

export default LoginForm;