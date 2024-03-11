import { Box, Button, Card, CardContent, CardMedia, Typography } from "@mui/material";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {  useNavigate } from 'react-router-dom';

import Background from '../assets/car.png'
import PublishPopUp from "./PublishPopUp";
import { useState } from "react";
const theme = createTheme({
    palette: {
        green: {
            main: '#00897B',
            light: '#E0F2F1',
            dark: '#004D40',
            contrastText: '#E0F2F1',
        },
    },
});

function ProviderListing(props) {
    const [popoverLocation, setPopOverLocation] = useState(false);
    const [listing, _] = useState(props.listing);
    const navigate = useNavigate();


    const handleDelete = (event) => {
        const fetchDelete = async () => {
            const data = {
                listings: {
                    "listing_id": listing.listing_id,
                    "listing_no": listing.listing_no

                }
            }
            try {
                const response = await fetch('http://localhost:8080/delete_listing', {
                    method: 'DELETE',
                    headers: {
                        'email': props.token,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                const res = await response.json();
                if (res.error) {
                    return Promise.reject(res.error);
                } else {
                    return Promise.resolve(res);
                }
            } catch (error) {
                return Promise.reject(error);
            }
        };
        fetchDelete().then((res) => {
            const new_listings = res
            props.setListings(new_listings);
            alert("listing deleted");
        }).catch(alert);
    }
    const hadnelEdit = () => {
        navigate('/editListings', { state: { token: props.token, listing: listing } });

    }
    const popoverOnClick = (event) => {
		setPopOverLocation(event.currentTarget);
    };
	const popoverOnClose = () => {
		setPopOverLocation(null);
	};


    // the card structure is from https://mui.com/material-ui/react-card/
    return (
        <ThemeProvider theme={theme}>
            <Card key={listing.listing_id} sx={{ maxWidth: 400, border: 0, boxShadow: 0, borderRadius: 3.5 }}>
                <CardMedia
                    sx={{ height: 280, borderRadius: 3.5 }}
                    component="img"
                    image={listing.image_url !== '' ? listing.image_url : Background}
                />
                <CardContent sx={{ border: 0, padding: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: "space-between" }}>
                        <Box>
                            <Typography variant="h5" component="div">
                                {listing.address}
                            </Typography>
                            <Typography variant="h6" color="text.secondary">
                                ${listing.price}

                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: "column", justifyContent: "space-between", rowGap: 0.4 }}>
                            <Button size="small" color='green' variant="contained" onClick={popoverOnClick}>Live Status</Button>
                            <PublishPopUp listings={listing} token={props.token}
                                popoverLocation={popoverLocation} setPopOverLocation={setPopOverLocation}
                                popoverOnClose={popoverOnClose}
                                 />

                            <Box sx={{ display: 'inline-flex', columnGap: 0.3 }}>
                                <Button size="small" color='green' variant="contained" onClick={hadnelEdit}>Edit</Button>
                                <Button size="small" color='green' variant="contained" onClick={handleDelete}>Delete</Button>
                            </Box>

                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </ThemeProvider>
    )
}
export default ProviderListing; 