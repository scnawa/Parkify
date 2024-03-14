import React from "react";
import { Box, Card, CardContent, CardMedia, Typography, Button, ThemeProvider, createTheme } from "@mui/material";
import Background from '../assets/car.png';

const theme = createTheme({
    palette: {
        green: {
            main: '#00897B',
            contrastText: '#FFFFFF',
        },
    },
});

function AllProviderListing({ listing }) {
    return (
        <ThemeProvider theme={theme}>
            <Card sx={{ display: 'flex', height: '100%', flexDirection: 'column', borderRadius: '16px' }}>
                <CardMedia
                    component="img"
                    sx={{ width: '100%', height: 300, objectFit: 'cover' }} // height 300 is what controls the images size, width 100% making it responsive width wise
                    image={listing.image_url !== '' ? listing.image_url : Background}
                    alt="Parking space"
                />
                <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                        {listing.address}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        ${listing.price}/day
                    </Typography>
                    <Box mt={2}>
                        <Button size="small" color="primary" variant="contained">Details</Button>
                    </Box>
                </CardContent>
            </Card>
        </ThemeProvider>
    );
}


export default AllProviderListing;
