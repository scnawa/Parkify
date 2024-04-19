import React from "react";
import { Card, CardContent, CardMedia, Typography, ThemeProvider, createTheme } from "@mui/material";
import Background from '../assets/car.png';

const theme = createTheme({
	palette: {
		green: {
			main: '#00897B',
			contrastText: '#FFFFFF',
		},
	},
});
// The component to render a provider listing
function AllProviderListing({ listing, height, imageHeight, objectFit }) {
	return (
		<ThemeProvider theme={theme}>
			<Card sx={{ display: 'flex', height: { height }, flexDirection: 'column', borderRadius: '16px' }}>
				<CardMedia
					component="img"
					sx={{ width: '100%', height: imageHeight, objectFit: objectFit }} // height 300 is what controls the images size, width 100% making it responsive width wise
					image={listing.imageUrl !== '' ? listing.imageUrl : Background}
					alt="Parking space"
				/>
				<CardContent sx={{ flexGrow: 1 }}>
					<Typography variant="h6" gutterBottom>
						{listing.address}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						${listing.price}/hr
					</Typography>
				</CardContent>
			</Card>
		</ThemeProvider>
	);
}


export default AllProviderListing;
