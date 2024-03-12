import React from "react";
import { Box, Grid, ThemeProvider, Typography, createTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AllProviderListing from "./AllProviderListing";

const theme = createTheme({
    palette: {
        primary: {
            main: '#00897B',
            light: '#E0F2F1',
            dark: '#004D40',
            contrastText: '#FFFFFF',
        },
    },
});

function AllListings(props) {
    const [listings, setListings] = React.useState([]);
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!props.token) {
            navigate('/login');
        }
    }, [props.token]);

    React.useEffect(() => {
		if (!props.token) {
			navigate('/login');
		}
		const fetchListings = async () => {
			try {
				const response = await fetch('http://localhost:8080/getAllListings', {
					method: 'Get',
					headers: {
						'Content-Type': 'application/json',
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

		fetchListings();
	}, []);

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ margin: 2 }}>
                <Typography variant="h4" component="div" gutterBottom sx={{ mb: 4 }}>
                    Active Parking Spaces
                </Typography>
                <Grid container spacing={4}>
                    {listings.map((listing) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={listing.listing_id}>
                            <AllProviderListing listing={listing} />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </ThemeProvider>
    );
}

export default AllListings;
