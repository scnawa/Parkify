import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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
import Logout from './logout';

const theme = createTheme({
	palette: {
		green: {
			main: '#4caf50',
			light: '#E0F2F1',
			dark: '#004D40',
			contrastText: '#CDDC39',
		},
	},
});

const font1 = "'Nunito Sans', sans-serif";

function NavBar(props) {
	const [userMenuLocation, setUserMenuLocation] = React.useState(null);
	const [notiLocation, setnotiLocation] = React.useState(null);
	const [searchQuery, setSearchQuery] = React.useState("");
	const token = props.token;
	const SID = props.SID;
	const setToken = props.setToken;
	const setSID = props.setSID;
	const location = useLocation();

	const pages = ['HOME', 'MY PARKING SPACES'];
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
			case "MY PARKING SPACES":
				navigate("/myListing");
				break;
			case "HOME":
				navigate("/");
				break;

		}
	}
	const profileOnClick = (event) => {
		setUserMenuLocation(null);
		navigate("/profilepage");
	}
	const loginOnClick = (event) => {
		navigate("/login");
	}
	const logOut = (event) => {
		setUserMenuLocation(null);
		Logout(token, SID, setToken, setSID);
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

	const handleSearchSubmit = async (event) => {
		event.preventDefault();
		try {
			const response = await fetch('http://localhost:8080/searchForSpace', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'query': searchQuery, 
				},
			});

			const data = await response.json();
			if (!data.error) {
				console.log(data);
				props.setListings(data);
			} else {
				alert(data.error);
			}
		} catch (error) {
			console.error(error);
		}
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
								display: { xs: 'none', sm: 'block', md: 'block' },
							}}
						>
							Parkify
						</Typography>
						<Box sx={{ display: { xs: 'flex', sm: 'flex', md: 'flex' }, flexGrow: 1, }}>
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
						{(location.pathname === "/" || location.pathname === "/alllistings") && (
							<form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'row', marginLeft: 'auto', marginRight: '30px' }}>
								<input
									type="text"
									placeholder="Search for space..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									style={{ 
									flexGrow: 1,
									padding: '10px',
									marginRight: '8px',
									border: '1px solid #ddd',
									borderRadius: '4px',
									outline: 'none',
									}}
								/>
								<Button 
									type="submit" 
									variant="contained" 
									sx={{ 
									ml: 1, 
									bgcolor: 'black', 
									'&:hover': {
										bgcolor: 'green.main', // lighter green on hover
									},
									borderRadius: '4px', 
									padding: '10px 16px' 
									}}
								>
									Search
								</Button>
							</form>
						)}

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