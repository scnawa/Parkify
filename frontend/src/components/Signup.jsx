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
// The signUp page to handle user sign up
function Signup(props) {
	const [email, setEmail] = React.useState('');
	const [username, setUsername] = React.useState('');
	const [firstName, setFirstName] = React.useState('');
	const [lastName, setLastName] = React.useState('');
	const [password, setPassword] = React.useState('');
	const [confirmPassword, setConfirmPassword] = React.useState('');
	const navigate = useNavigate();

	const handleSignup = async () => {
		if (password !== confirmPassword) {
			alert('Passwords need to match!');
			return;
		}

		try {
			const response = await fetch('/signup', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					email: email,
					username: username,
					password: password,
					listings: [],
					creditCards: [],
					sessionId: [],
					profilePicture: "",
				}),
			});
			const data = await response.json();
			if (data.error) {
				alert(data.error);
			} else {
				navigate('/verify', { state: { email: email, password: password } });
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
					padding: 3,
				}}
			>
				<Typography variant="h4" gutterBottom color="primary">
					Sign up
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
						label="Username"
						type="text"
						value={username}
						onChange={e => setUsername(e.target.value)}
						variant="outlined"
						margin="normal"
						fullWidth
						sx={{ backgroundColor: 'secondary.main', borderRadius: 1 }}
					/><br />
					<TextField
						label="First Name"
						type="text"
						value={firstName}
						onChange={e => setFirstName(e.target.value)}
						variant="outlined"
						margin="normal"
						fullWidth
						sx={{ backgroundColor: 'secondary.main', borderRadius: 1 }}
					/><br />
					<TextField
						label="Last Name"
						type="text"
						value={lastName}
						onChange={e => setLastName(e.target.value)}
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
					<TextField
						label="Confirm Password"
						type="password"
						value={confirmPassword}
						onChange={e => setConfirmPassword(e.target.value)}
						variant="outlined"
						margin="normal"
						fullWidth
						sx={{ backgroundColor: 'secondary.main', borderRadius: 1 }}
					/><br />
					<Button
						variant="contained"
						color="primary"
						onClick={handleSignup}
						fullWidth
						sx={{ mt: 3, mb: 2, py: 1.5 }}
					>
						Sign up
					</Button>
				</Box>
			</Box>
		</ThemeProvider>
	);
}

export default Signup;
