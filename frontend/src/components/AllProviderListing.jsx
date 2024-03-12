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
            <Card sx={{ display: 'flex', height: '100%', flexDirection: { xs: 'column', sm: 'row' } }}>
                <CardMedia
                    component="img"
                    sx={{ width: 151, height: '100%', objectFit: 'cover' }}
                    image={listing.image_url !== '' ? listing.image_url : Background}
                    alt="Parking space"
                />
                <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                        {listing.address}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        ${listing.price}
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
