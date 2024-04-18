import { Box, Button, List, ThemeProvider, Typography, createTheme } from "@mui/material";
import React from "react";
import ListItem from '@mui/material/ListItem';

import { useNavigate } from "react-router-dom";
import ProviderListing from "./ProviderListing";
import { rentOutInfoOnclick } from "./NavBar";

const theme = createTheme({
	palette: {
		yellow: {
			main: '#00897B',
			light: '#E0F2F1',
			dark: '#004D40',
			contrastText: '#CDDC39',
		},
	},
});
function MyListings(props) {
	const token = props.token;
	const [listings, setListings] = React.useState([]);
	const navigate = useNavigate();
	React.useEffect(() => {
		if (!token) {
			navigate('/login');
			return
		}
		// eslint-disable-next-line
	}, [token]);
	React.useEffect(() => {
		if (!token) {
			navigate('/login');
			return
		}
		const fetchStripeStatus = async () => {
			try {
				const response = await fetch('http://localhost:8080/userIsprovider', {
					method: 'Get',
					headers: {
						'Content-Type': 'application/json',
						'token': token
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

		const fetchListings = async () => {
			try {
				const response = await fetch('http://localhost:8080/get_listings', {
					method: 'Get',
					headers: {
						'Content-Type': 'application/json',
						'token': token,
						'email': props.email
					},
				});


				const data = await response.json();
				if (data.error) {
					alert(data.error);
				} else {
					setListings(data);
					return data
				}
			} catch (error) {
				console.error(error);
			}
		};

		fetchStripeStatus().then((data) => {
			if (data["stripeConnected"] === false) {
				if (window.confirm("You need to update provider details to continue. Redirect now?")) {
					rentOutInfoOnclick(props);
					return;
				} else {
					navigate(-1)
				}
			} else {
				return fetchListings();
			}
		}).catch((e) => {
			if (!props.isAdmin) {
				if (window.confirm("You need to update provider details to continue. Redirect now?")) {
					rentOutInfoOnclick(props);
					return;
				} else {
					navigate(-1)
				}
			}
			return fetchListings();
		});
		// eslint-disable-next-line
	}, [token]);

	const createOnClick = () => {
		navigate('/create-listings', { state: { token: token, email: props.email } })
	};
	return (
		<ThemeProvider theme={theme}>
			<Box display='flex' flexDirection="column" sx={{ justifyContent: "space-between", margin: 2 }}>
				<Box display='flex' justifyContent="space-between" alignItems="center" mb={4}>
					<Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
						{props.isAdmin ? `${props.username}'s Parking Spaces` : 'Manage Your Parking Spaces'}
					</Typography>
					{!props.isAdmin && <Button variant="contained" onClick={createOnClick} color="success">
						Create
					</Button>}
				</Box>
				<List sx={{ width: '100%' }}>
					{listings.map((listing, index) => (
						<ListItem key={listing.listingId} sx={{
							my: 0.5,
							borderRadius: 1,
							border: 1,
						}}>
							<ProviderListing token={token} email={props.email} listing={listing} listings={listings} setListings={setListings} />
						</ListItem>
					))}
				</List>
			</Box>
		</ThemeProvider>
	);
}
export default MyListings;