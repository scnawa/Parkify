import { Box, Button, Card, CardContent, CardMedia, ListItem, Typography } from "@mui/material";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {  useNavigate } from 'react-router-dom';

import Background from '../assets/car.png'
import PublishPopUp from "./PublishPopUp";
import { useState } from "react";
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
const theme = createTheme({
    palette: {
        green: {
            main: '#00897B',
            light: '#E0F2F1',
            dark: '#004D40',
            contrastText: '#E0F2F1',
        },
        anotherGreen: {
            main: '#4caf50', // Green primary colour
            light: '#E0F2F1',
            contrastText: '#E0F2F1',

        },
        red:{
            main: '#5e1914', // Green primary colour
            light: '#E0F2F1',
            contrastText: '#E0F2F1',


        }
    },
});

function ProviderListing(props) {
    const [popoverLocation, setPopOverLocation] = useState(false);
    const [listing, _] = useState(props.listing);
    const [activated, setActivated] = useState(props.listings.is_active === "True");

    const navigate = useNavigate();

    const hadnelEdit = () => {
        navigate('/editListings', { state: { token: props.token, listing: listing } });

    }
    const popoverOnClick = (event) => {
		setPopOverLocation(event.currentTarget);
    };
	const popoverOnClose = () => {
		setPopOverLocation(null);
	};
    return (

            <ThemeProvider theme={theme} >
                    <ListItemAvatar >
                        <Avatar
                            src={listing.image_url !== '' ? listing.image_url : Background}
                        />
                    </ListItemAvatar>
                    <Box  sx={{ display: { xs: 'block', sm: 'block', md: 'none' }, width:'100%' }}>
                                <Typography variant="h6" component="div">
                                    Address: {listing.address}
                                </Typography>
                                <Typography variant="h6" color="text.secondary">
                                    ${listing.price}

                                </Typography>
                    </Box>
                    {/* TODO improve the apperance on desktop */}
                    <Box  sx={{ display: { xs: 'none', sm: 'none', md: 'block' }, width:'100%' }}>
                                <Typography variant="h6" component="div">
                                    {listing.address}
                                </Typography>
                                <Typography variant="h6" color="text.secondary">
                                    ${listing.price}

                                </Typography>
                    </Box>
                        <Box display='flex' sx={{width:'100%', "justifyContent":"end"}}>
                            <Box sx={{ display: 'flex', flexDirection: "column", justifyContent: "space-between", rowGap: 0.4 }}>
                            {activated &&
                                <Button size="small" color='anotherGreen' variant="contained" onClick={popoverOnClick}>Live Status</Button>

							}
							{!activated &&
                                <Button size="small" color='red' variant="contained" onClick={popoverOnClick}>Live Status</Button>

							}
                                <PublishPopUp listings={listing} token={props.token}
                                    popoverLocation={popoverLocation} setPopOverLocation={setPopOverLocation}
                                    popoverOnClose={popoverOnClose} activated={activated} setActivated={setActivated}
                                    />

                                <Box sx={{ display: 'inline-flex', columnGap: 0.3 }}>
                                    <Button size="small" color='green' variant="contained" fullWidth onClick={hadnelEdit}>Edit</Button>
                                </Box>

                            </Box>
                        </Box>
            </ThemeProvider>

    )
}
export default ProviderListing; 