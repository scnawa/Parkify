import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
// component of the verify page used to handle user verification code input
function Verify(props) {
	const location = useLocation();
	const { email, password } = location.state || {};
	const [code, setCode] = useState(Array(6).fill(''));
	const navigate = useNavigate();
	const inputRefs = useRef(Array(6).fill(0).map(() => React.createRef()));
	const [confirmedCode, setConfirmedCode] = useState('')
	// fetch the verification code on load
	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch('/signup/verify', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						email: email,
					}),
				});
				const data = await response.json();
				setConfirmedCode(data);
				console.log(data)
			} catch (error) {
				console.error('An error occurred during verification:', error);
			}
		};

		fetchData();
	}, [email]);

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


		if (parseInt(verificationCode) === parseInt(confirmedCode)) {
			try {
				const response = await fetch('/login', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						email: email,
						password: password,
						isVerified: true
					}),
				});
				const data = await response.json();
				if (data.error) {
					alert(data.error);
				} else {
					props.setToken(data.sessionId[data.sessionId.length - 1]);
					localStorage.setItem('token', data.sessionId[data.sessionId.length - 1]);
					props.setEmail(email);
					localStorage.setItem('email', data.email);

					navigate('/');
				}
			} catch (error) {
				console.error('An error occurred during login:', error);
			}
		}
		else {
			alert('Invalid verification code, please try again.');
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
				<Box component="form" sx={{ mt: 1, display: 'flex', flexDirection: 'row', gap: '10px' }}>
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

export default Verify
