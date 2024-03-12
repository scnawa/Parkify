import React from 'react';
import { useNavigate } from 'react-router-dom';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import AccountCircle from '@mui/icons-material/AccountCircle';

import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';


import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Menu, MenuItem } from '@mui/material';
import Modal from './Modal';
const theme = createTheme({
	palette: {
		green: {
			main: '#00897B',
			light: '#E0F2F1',
			dark: '#004D40',
			contrastText: '#CDDC39',
		},
	},
});


function NavBar(props) {
	const [userMenuLocation, setUserMenuLocation] = React.useState(null);
	const [notiLocation, setnotiLocation] = React.useState(null);
	const token = props.token;


	const pages = ['Home', 'Parking', 'Rent out your slot'];
	const navigate = useNavigate();
	// TODO: navigate user profile
	const userMenuOnclick = (event) => {
		setUserMenuLocation(event.currentTarget);
	};
	const notiLocationOnclick = (event) => {
		setnotiLocation(event.currentTarget);
	};
	const userMenuClose = (event) => {
		setUserMenuLocation(null);
	}
	// TODO: navigate different page
	const pageOnClick = (e) => {
		const text = e.target.innerText;
		switch (text) {
			case "RENT OUT YOUR SLOT":
				navigate("/myListing");
				break;
			case "PARKING":
				navigate("/");
				break;
			case "HOME":
				navigate("/");

				break;

		}
	}
	const profileOnClick = (event) => {
		setUserMenuLocation(null);
		// ToDo: navigate the actual page
		navigate("/");
	}
	const loginOnClick = (event) => {
		navigate("/login");
	}
	const logOut = (event) => {
		setUserMenuLocation(null);
		// ToDo: actual logout
		props.setToken(null);
		localStorage.removeItem('token');
		navigate("/");
	}

	const signUpOnclick = (event) => {
		navigate("/signup");
	}
	const notiLocationClose = (event) => {
		setnotiLocation(null);
		console.log("close");
		console.log(notiLocation);

	};


	// the app bar and menu structure is from https://mui.com/material-ui/react-app-bar/#app-bar-with-responsive-menu

	return (
		<ThemeProvider theme={theme}>

			<AppBar color="green" position="static">
				<Container maxWidth="xl">
					<Toolbar disableGutters>
						<Typography
							variant="h6"
							noWrap
							component="a"
							sx={{
								mr: 1.8,
								fontWeight: 700,
								letterSpacing: '.2rem',
								fontFamily: 'future',
							}}
						>
							Parkify
						</Typography>
						<Box sx={{ display: { xs: 'none', sm: 'block' }, flexGrow: 1, }}>
							{pages.map((item) => (
								<Button key={item} onClick={pageOnClick}
									sx={{
										color: 'green.light',
										fontWeight: 500,

										fontFamily: 'time',
										letterSpacing: '.06rem',
									}}>

									{item}
								</Button>
							))}
						</Box>
						{token && (
							<>
								<IconButton
									aria-haspopup={true}
									aria-label="notifications"
									size="large"
									onClick={notiLocationOnclick}
									color="inherit"
								>
									<NotificationsNoneOutlinedIcon />

								</IconButton>
								<Modal isOpen={notiLocation} setnotiLocation={setnotiLocation} content=""></Modal>
							</>
						)}
						{token && (
							<>
								<IconButton
									aria-haspopup={true}
									aria-label="user operation"

									size="large"
									onClick={userMenuOnclick}
									color="inherit"
								>
									<AccountCircle />
								</IconButton>
								<Menu
									id="menu-appbar"
									anchorEl={userMenuLocation}
									open={Boolean(userMenuLocation)}
									onClose={userMenuClose}
								>
									<MenuItem onClick={profileOnClick}>Profile</MenuItem>
									<MenuItem onClick={logOut}>Log out</MenuItem>
								</Menu>
							</>
						)}
						{!token && (
							<Button onClick={loginOnClick}
								sx={{
									color: 'green.light',
									fontWeight: 500,

									fontFamily: 'time',
									letterSpacing: '.06rem',
								}}>

								Log In
							</Button>
						)}
						{!token && (
							<Button onClick={signUpOnclick}
								sx={{
									color: 'green.light',
									fontWeight: 500,

									fontFamily: 'time',
									letterSpacing: '.06rem',
								}}>

								Sign Up
							</Button>
						)}

					</Toolbar>
				</Container>
			</AppBar>
		</ThemeProvider>

	)

}
export default NavBar;