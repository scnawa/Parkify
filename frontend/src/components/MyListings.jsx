import { Box, Button, List, Stack, ThemeProvider, Typography, createTheme } from "@mui/material";
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
	const [listings, setListings] = React.useState([]);
	const navigate = useNavigate();
	React.useEffect(() => {
		if (!props.token) {
			navigate('/login');
			return
		}
	}, [props.token]);
	React.useEffect(() => {
		if (!props.token) {
			navigate('/login');
			return
		}
		const fetchStripeStatus = async () => {
			try {
				const response = await fetch('http://localhost:8080/userIsprovider', {
					method: 'Get',
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

		const fetchListings = async () => {
			try {
				const response = await fetch('http://localhost:8080/get_listings', {
					method: 'Get',
					headers: {
						'Content-Type': 'application/json',
						'email': props.token
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

		fetchStripeStatus().then((data)=> {
			if (!data["is_stripe_connected"]) {
				return Promise.resolve(()=>rentOutInfoOnclick(props));
			} else {
				return Promise.resolve(fetchListings);
			}
		}).catch(alert);
	}, []);

	const createOnClick = () => {
		navigate('/create-listings')
	};
	return (
        <ThemeProvider theme={theme}>
            <Box display='flex' flexDirection="column" sx={{ justifyContent: "space-between", margin: 2 }}>
                <Box display='flex' justifyContent="space-between" alignItems="center" mb={4}>
                    <Typography variant="h4" component="div">
                        Manage Your Parking Spaces
                    </Typography>
                    <Button variant="contained" onClick={createOnClick} color="success">
                        Create
                    </Button>
                </Box>
                <List sx={{ width: '100%' }}>
                    {listings.map((listing, index) => (
                        <ListItem key={listing.listing_id} sx={{
                            my: 0.5,
                            borderRadius: 1,
							border: 1,
                        }}>
                            <ProviderListing token={props.token} listing={listing} listings={listings} setListings={setListings} />
                        </ListItem>
                    ))}
                </List>
            </Box>
        </ThemeProvider>
    );
}
export default MyListings;