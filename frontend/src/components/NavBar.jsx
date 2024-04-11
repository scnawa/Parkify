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
import TextField from '@mui/material/TextField';

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
const searchBarStyle = {
	// from https://stackoverflow.com/questions/67139471/how-can-i-change-the-focused-color-of-a-textfield
	"& label.Mui-focused": {
		'color': "#E0F2F1"
	},
	"& .MuiFilledInput-underline:after": {
		'borderBottomColor': "#E0F2F1"
	},
}

const font1 = "'Nunito Sans', sans-serif";
export function rentOutInfoOnclick(props) {
	console.log("here", props);
	const fetchAccountLink = async () => {
		try {
			const response = await fetch('http://localhost:8080/providerDetails', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'email': props.token
				},
			});

			const data = await response.json();
			if (data.error) {
				return Promise.reject(data.error);
			} else {
				return Promise.resolve(data);
			}
		} catch (error) {
			return Promise.reject(error);
		}
	};
	fetchAccountLink().then((data) => {
		let link = data["account_link"];
		window.location.href = link;
	}).catch(alert);
}

function NavBar(props) {
	const [userMenuLocation, setUserMenuLocation] = React.useState(null);
	const [notiLocation, setnotiLocation] = React.useState(null);
	const [searchQuery, setSearchQuery] = React.useState("");
	const token = props.token;
	const SID = props.SID;
	const setToken = props.setToken;
	const setSID = props.setSID;
	const isAdmin = props.isAdmin;
	const setIsAdmin = props.setIsAdmin;
	const location = useLocation();
	const [pages, setPages] = React.useState([]);

	const navigate = useNavigate();

	React.useEffect(() => {
		if (isAdmin) {
			setPages(["MANAGE USERS", "DISPUTES"]);
		} else {
			setPages([]);
		}
	}, [isAdmin]);

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
	const addPaymentOnClick = (props) => {
		setUserMenuLocation(null);
		navigate("/managePayment");
		return;
	}

	// TODO: navigate different page
	const pageOnClick = (e) => {
		const text = e.target.innerText;
		switch (text) {
			case "MY SPACES":
				navigate("/myListing");
				break;
			case "MANAGE USERS":
				navigate("/adminViewListings")
				break;
			case "DISPUTES":
				navigate("/adminDisputes")
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
		Logout(token, SID, setToken, setSID, setIsAdmin);
		navigate("/");
	}
	const historyOnclick = () => {
		setUserMenuLocation(null);
		navigate("/history");

	}
	const customerHistoryOnclick = () => {
		setUserMenuLocation(null);
		navigate("/customerHistory");

	}
	const customerRentOutOnclick = () => {
		setUserMenuLocation(null);
		navigate("/myListing");

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
			<Box sx={{ flexGrow: 1 }}>
				<AppBar color="green" position="static">
					<Container maxWidth="xl">
						<Toolbar disableGutters>
							<button style={{
								"cursor": "pointer",
								"border": "0px",
								"background-color": "transparent",
								"color": "#CDDC39",
								"margin": "2px",
								"padding": "2px",
							}}>
								<Typography
									variant="h6"
									noWrap
									component="a"
									sx={{
										mr: 0.5,
										fontWeight: 700,
										letterSpacing: '.2rem',
										fontFamily: 'future',
									}}
									onClick={() => {
										navigate("/");
									}}
								>
									Parkify
								</Typography>
							</button>
							<Box sx={{ display: { xs: 'flex', sm: 'flex', md: 'flex' }, flexGrow: 1, }}>
								{pages.map((item) => (
									<Button key={item} onClick={pageOnClick}
										sx={{
											color: 'green.light',
											fontFamily: 'time',
											letterSpacing: '.06rem',
										}}>

										{item}
									</Button>
								))}
								{(location.pathname === "/" || location.pathname === "/alllistings") && (
									<form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'row' }}>
										<TextField sx={searchBarStyle}
											label="search for space" type="search" variant="filled"
											onChange={(e) => setSearchQuery(e.target.value)}
											value={searchQuery}
										/>
										<Button
											type="submit"
											variant="contained"
											sx={{
												ml: 0.4,
												bgcolor: 'black',
												'&:hover': {
													bgcolor: 'black', // lighter green on hover
												},
												borderRadius: '4px',
												padding: '10px 16px'
											}}
										>
											Search
										</Button>
									</form>
								)}

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
										{!isAdmin && (
											[
												(<MenuItem key="history" onClick={() => historyOnclick(props)}>My Booking History</MenuItem>),
												(<MenuItem key="customerHistory" onClick={() => customerHistoryOnclick(props)}>Customer Booking History</MenuItem>),
												(<MenuItem key="rentOut" onClick={() => rentOutInfoOnclick(props)}>Set up rent out information</MenuItem>),
												(<MenuItem key="payment" onClick={() => addPaymentOnClick(props)}>Add customer payment method</MenuItem>),
												(<MenuItem key="RentSpaces" onClick={() => customerRentOutOnclick(props)}>Rent out my spaces</MenuItem>)
											]
										)}
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
			</Box>
		</ThemeProvider >

	)

}
export default NavBar;