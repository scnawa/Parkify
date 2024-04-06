import { Box, Button, List, Stack, ThemeProvider, Typography, createTheme } from "@mui/material";
import React, { useState } from "react";
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
	console.log("mylistings " + token)	
    //const [token, setToken] = React.useState(localStorage.getItem('token'));
	const [listings, setListings] = React.useState([]);
	const navigate = useNavigate();
	React.useEffect(() => {
		if (!token) {
			navigate('/login');
			return
		}
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
						'email': token
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
						'email': token
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
			console.log(data);
			if (data["stripe_connected"] === false) {
				alert("Redirecting to update provider details");

				rentOutInfoOnclick(props);
				return;
			} else {
				console.log(data);

				console.log("wrong");
				return fetchListings();
			}
		}).catch((e) => {
			if (!props.isAdmin) {
				alert("Redirecting to update provider details");
				rentOutInfoOnclick(props);
				return;
			}
			return fetchListings();
		});
	}, [token]);

	const createOnClick = () => {
		navigate('/create-listings', { state: { token: token } })
	};
	return (
        <ThemeProvider theme={theme}>
            <Box display='flex' flexDirection="column" sx={{ justifyContent: "space-between", margin: 2 }}>
                <Box display='flex' justifyContent="space-between" alignItems="center" mb={4}>
				<Typography variant="h4" component="div">
					{props.isAdmin ? `${props.username}'s Parking Spaces` : 'Manage Your Parking Spaces'}
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
                            <ProviderListing token={token} listing={listing} listings={listings} setListings={setListings} />
                        </ListItem>
                    ))}
                </List>
            </Box>
        </ThemeProvider>
    );
}
export default MyListings;