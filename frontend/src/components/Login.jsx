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
// The page for user login
function Login(props) {
	const [email, setEmail] = React.useState('');
	const [password, setPassword] = React.useState('');
	const navigate = useNavigate();
	// redirect user to homepage on success or redirect them to verify page
	// if they haven't entered the verification code yet
	// otherwise alert the failure
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
			} else if (data.hasOwnProperty('isAdmin')) {
				props.setToken(data.sessionId[data.sessionId.length - 1]);
				localStorage.setItem('token', data.sessionId[data.sessionId.length - 1]);
				props.setEmail(data.email);
				localStorage.setItem('email', data.email);

				navigate('/')
			} else {
				props.setToken(data.sessionId[data.sessionId.length - 1]);
				localStorage.setItem('token', data.sessionId[data.sessionId.length - 1]);
				props.setEmail(data.email);
				localStorage.setItem('email', data.email);
				console.log(localStorage);
				console.log(data);

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
