import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Box, createTheme, ThemeProvider } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4caf50', // Green primary colour
    },
    secondary: {
      main: '#ffffff', // White for background/secondary elements
    },
  },
});

function Login(props) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });
      
      
      const data = await response.json();
      if (data.error) {
        alert(data.error);
      } else {
        props.setToken(data.email);
        localStorage.setItem('token', data.email);
        props.setSID(data.session_id[data.session_id.length-1]);
        localStorage.setItem('SID', data.session_id[data.session_id.length-1]);
        navigate('/');
      }

      if (response.status === 405) {
        navigate('/verify', { state: { email: email, password: password } });
        return;
      }
      
    } catch (error) {
      console.error('An error occurred during signup:', error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'secondary.main',
        }}
      >
        <Typography variant="h4" gutterBottom color="primary">
          Login
        </Typography>
        <Box component="form" sx={{ mt: 1 }}>
          <TextField
            label="Email"
            type="text"
            value={email}
            onChange={e => setEmail(e.target.value)}
            variant="outlined"
            margin="normal"
            fullWidth
            sx={{ backgroundColor: 'secondary.main', borderRadius: 1 }}
          /><br />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            variant="outlined"
            margin="normal"
            fullWidth
            sx={{ backgroundColor: 'secondary.main', borderRadius: 1 }}
          /><br />
          <Button
            variant="contained"
            color="primary"
            onClick={handleLogin}
            fullWidth
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            Login
          </Button>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default Login;
