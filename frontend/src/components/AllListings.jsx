import React, { useState, useEffect } from "react";
import { Box, Grid, ThemeProvider, Typography, createTheme, Button, MenuItem, FormControl, Select, InputLabel } from "@mui/material";
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
    const [listings, setListings] = useState([]);
    const [priceOrder, setPriceOrder] = useState(''); 
    const [initialListingsLoaded, setInitialListingsLoaded] = useState(false);
    const navigate = useNavigate();
    
    useEffect(() => {
        // Initial fetch for all listings
        fetch('http://localhost:8080/getAllListings', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            if (!data.error) {
                console.log(data)
                setListings(data);
                setInitialListingsLoaded(true)
            } else {
                alert(data.error);
            }
        })
        .catch(error => console.error(error));
    }, []);

    useEffect(() => {
        if (initialListingsLoaded) {
            setListings(props.listings);
            setPriceOrder('');
        }
    }, [props.listings]);

    const handlePriceOrderChange = (event) => {
        const order = event.target.value;
        setPriceOrder(order);
        if (order) {
            fetchListingsSortedByPrice(order);
        }
    };

    const fetchListingsSortedByPrice = async (order) => {
        try {
            const response = await fetch('http://localhost:8080/filterByPrice', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'order' : order,
                    'email': props.token
                },
            });

            const data = await response.json();
            if (!data.error) {
                console.log(data)
                setListings(data);
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ margin: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4" component="div">
                        Active Parking Spaces
                    </Typography>
                    <FormControl variant="outlined" sx={{ minWidth: 140 }}>
                        <InputLabel id="price-order-label">Filter by Price</InputLabel>
                        <Select
                            labelId="price-order-label"
                            id="price-order-select"
                            value={priceOrder}
                            onChange={handlePriceOrderChange}
                            label="Filter by Price"
                        >
                            <MenuItem value="ascending">Low to High</MenuItem>
                            <MenuItem value="descending">High to Low</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
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
