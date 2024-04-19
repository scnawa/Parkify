import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import AccountCircle from '@mui/icons-material/AccountCircle';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import logo from '../assets/parkify.png'; // Adjust the path as necessary



import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';


import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Menu, MenuItem } from '@mui/material';
import Modal from './Modal';
import Logout from './logout';
import { fetchListingsSortedByPriceAndDistance } from './AllListings';

const theme = createTheme({
	palette: {
		green: {
			main: '#4caf50',
			light: '#E0F2F1',
			dark: '#000000',
			contrastText: '#CDDC39',
		},
	},
});
const searchBarStyle = {
	// from https://stackoverflow.com/questions/67139471/how-can-i-change-the-focused-color-of-a-textfield
	// Keeps the label transparent when the input is focused
	"& .MuiInputLabel-root.Mui-focused": {
		color: "#666666"
	},
	// Ensures label stays transparent when there's text in the field (both on focus and blur)
	"& .MuiInputLabel-root.Mui-filled": {
		color: "#666666"
	},
	// Target the label specifically when the field is filled but not focused
	"& .MuiInputLabel-root.Mui-filled.MuiInputLabel-shrink": {
		color: "#666666"
	},
	// Removes the underline in all states: normal, focused, and hover
	"& .MuiInput-underline:after, & .MuiInput-underline:before, & .MuiInput-underline:hover:not(.Mui-disabled):before": {
		borderBottom: "none"
	},
	// ensure the label is positioned correctly and acts as expected when viewport decreases
	"& .MuiInputLabel-root": {
		maxWidth: 'calc(100% - 24px)',
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
	},
	"display": { xs: 'block', sm: 'block', md: 'block' },
	"margin-left": "0px",
	"margin-right": "10px",
	"backgroundColor": "#ffffff",
	"border": '1px solid #ddd',
	"borderRadius": '4px',
	// ensures input text is positioned correctly
	"& .MuiInputBase-input": {
		transform: 'translate(0, -38%)',
		padding: '10px 12px',
	}



}
// fetch the link that redirect to stripe to update the provider details
export function rentOutInfoOnclick(props) {
	const fetchAccountLink = async () => {
		try {
			const response = await fetch('http://localhost:8080/providerDetails', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'token': props.token
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
		let link = data["accountLink"];
		window.location.href = link;
	}).catch(alert);
}

function NavBar(props) {
	const [userMenuLocation, setUserMenuLocation] = React.useState(null);
	const [notiLocation, setnotiLocation] = React.useState(null);
	const [searchQuery, setSearchQuery] = React.useState("");
	const token = props.token;
	const setToken = props.setToken;
	const isAdmin = props.isAdmin;
	const setIsAdmin = props.setIsAdmin;
	const setEmail = props.setEmail;
	const location = useLocation();
	const [pages, setPages] = React.useState(['My Parking Spaces']);
	// the default location is on UNSW
	const [userLocation, setUserLocation] = React.useState([-33.9062434, 151.23465683738365]);

	const navigate = useNavigate();
	// show different pages on admin or user account
	React.useEffect(() => {
		if (isAdmin) {
			setPages(["MANAGE USERS", "DISPUTES"]);
		} else {
			setPages(['My Parking Spaces']);
		}
	}, [isAdmin]);
	// if user enable the location permission
	// set user location to their physical location
	React.useEffect(() => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const { latitude, longitude } = position.coords;
					setUserLocation([latitude, longitude]);
				}
			)
		}
	}, []);

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
		setnotiLocation(null);
		navigate("/managePayment");
		return;
	}

	// navigate different page on menu if on click
	const pageOnClick = (e) => {
		const text = e.target.innerText;
		switch (text) {
			case "MY PARKING SPACES":
				setnotiLocation(null);
				navigate("/myListing");
				break;
			case "MANAGE USERS":
				setnotiLocation(null);
				navigate("/adminViewListings")
				break;
			case "DISPUTES":
				setnotiLocation(null);
				navigate("/adminDisputes")
				break;
			case "HOME":
				setnotiLocation(null);
				navigate("/");
				break;
			default:
				break;
		}
	}
	const profileOnClick = (event) => {
		setUserMenuLocation(null);
		setnotiLocation(null);
		navigate("/profilepage");
	}
	const loginOnClick = (event) => {
		navigate("/login");
	}
	const logOut = (event) => {
		setUserMenuLocation(null);
		setnotiLocation(null);
		Logout(token, setToken, setIsAdmin, setEmail);
		navigate("/");
	}
	const historyOnclick = () => {
		setUserMenuLocation(null);
		setnotiLocation(null);
		navigate("/history");

	}
	const customerHistoryOnclick = () => {
		setUserMenuLocation(null);
		setnotiLocation(null);
		navigate("/customerHistory");

	}
	const customerRentOutOnclick = () => {
		setUserMenuLocation(null);
		setnotiLocation(null);
		navigate("/myListing");

	}

	const manageUsers = () => {
		setUserMenuLocation(null);
		setnotiLocation(null);
		navigate("/adminViewListings");

	}

	const disputes = () => {
		setUserMenuLocation(null);
		setnotiLocation(null);
		navigate("/adminDisputes");
	}

	const signUpOnclick = (event) => {
		navigate("/signup");
	}

	const handleSearchSubmit = async (event) => {
		event.preventDefault();
		try {
			if (searchQuery !== "") {
				const response = await fetch('http://localhost:8080/searchForSpace', {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						'query': searchQuery,
					},
				});

				const data = await response.json();
				if (!data.error) {
					props.setListings(data);
					props.setTotalPage(1);
				} else {
					alert(data.error);
				}
			} else {

				fetchListingsSortedByPriceAndDistance('', '', props.setListings, props.setTotalPage, userLocation, 1);
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
								<img
									src={logo}
									alt="Parkify logo"
									style={{
										cursor: 'pointer',
										width: '100px',
										height: 'auto',
										marginRight: '0.5rem',
									}}
									onClick={() => {
										setnotiLocation(null);
										navigate("/");
									}}
								/>
							</button>
							<Box sx={{ display: { xs: 'flex', sm: 'flex', md: 'flex' }, flexGrow: 1, marginRight: { sm: 4 } }}>
								{pages.map((item) => (
									<Button key={item} onClick={pageOnClick}
										sx={{
											display: { xs: 'None', sm: 'block', md: 'block' },
											color: 'green.light',
											fontFamily: 'time',
											letterSpacing: '.06rem',
											marginLeft: '10px',
										}}>

										{item}
									</Button>
								))}
							</Box>
							{(location.pathname === "/" || location.pathname === "/alllistings") && (
								<form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'row', height: '45px' }}>

									<TextField sx={searchBarStyle}
										InputLabelProps={{
											style: {
												visibility: searchQuery.length > 0 ? 'hidden' : 'visible',
												top: '50%',
												left: '12px',
												// This ensures that the label starts off centered
												transform: 'translate(0, -50%)',


											},
											shrink: false,
										}}
										label="Search for space..." type="search" variant="standard"
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
												bgcolor: 'black',
											},
											borderRadius: '60px',
											padding: '0px',  // Adjust padding to better fit the icon
											mr: { xs: '0px', sm: '40px' },
											minWidth: '45px',
										}}
									>
										<SearchIcon />
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
										color="dark"
									>
										<NotificationsNoneOutlinedIcon />

									</IconButton>
									<Modal
										isOpen={notiLocation}
										setnotiLocation={setnotiLocation}
									>
									</Modal>
								</>
							)}
							{token && (
								<>
									<IconButton
										aria-haspopup={true}
										aria-label="user operation"

										size="large"
										onClick={userMenuOnclick}
										color="dark"
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
												(<MenuItem key="RentSpaces" sx={{ display: { xs: 'flex', sm: 'none', md: 'none' } }} onClick={() => customerRentOutOnclick(props)}>My Parking Spaces</MenuItem>)
											]
										)}
										{isAdmin && (
											[
												(<MenuItem key="adminViewListings" sx={{ display: { xs: 'flex', sm: 'none', md: 'none' } }} onClick={() => manageUsers(props)}>Manage Users</MenuItem>),
												(<MenuItem key="adminDisputes" sx={{ display: { xs: 'flex', sm: 'none', md: 'none' } }} onClick={() => disputes(props)}>Disputes</MenuItem>),
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