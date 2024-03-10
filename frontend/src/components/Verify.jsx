import React, { useState, useRef } from 'react';
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

function Verify(props) {
  const [code, setCode] = useState(Array(6).fill(''));
  const navigate = useNavigate();
  const inputRefs = useRef(Array(6).fill(0).map(() => React.createRef()));

  const handleInput = (e, index) => {
    const { value } = e.target;
    const newCode = [...code];
    if (/\D/.test(value)) return;
    newCode[index] = value.replace(/[^0-9]/gi, '');

    setCode(newCode);
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyUp = (e, index) => {
    if (e.key === "Backspace" && index > 0 && !code[index]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerification = async () => {
    const verificationCode = code.join('');
    if (verificationCode.length !== 6) {
      alert('Verification code must be 6 characters long');
      return;
    }

    try {
      const response = await fetch('/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: verificationCode,
        }),
      });
      const data = await response.json();
      if (data.success) {
        navigate('/'); 
      } else {
        alert('Invalid verification code, please try again.');
      }
    } catch (error) {
      console.error('An error occurred during verification:', error);
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
          padding: 3,
        }}
      >
        <Typography variant="h4" gutterBottom color="primary">
          Verify Your Account
        </Typography>
        <Box component="form" sx={{ mt: 1, display: 'flex', gap: '10px' }}>
          {code.map((num, index) => (
            <TextField
              key={index}
              type="tel"
              value={num}
              onChange={(e) => handleInput(e, index)}
              onKeyUp={(e) => handleKeyUp(e, index)}
              inputProps={{ maxLength: 1, pattern: '[0-9]*' }}
              variant="outlined"
              margin="normal"
              sx={{ width: '40px', backgroundColor: 'secondary.main', borderRadius: 1 }}
              inputRef={(e) => inputRefs.current[index] = e}
            />
          ))}
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={handleVerification}
          sx={{ mt: 3, mb: 2, py: 1.5 }}
        >
          Verify
        </Button>
      </Box>
    </ThemeProvider>
  );
}

export default Verify;
