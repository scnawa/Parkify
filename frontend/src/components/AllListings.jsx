import React, { useState, useEffect } from "react";
import { TextField, Box, Grid, ThemeProvider, Typography, createTheme, Button, MenuItem, FormControl, Select, InputLabel } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
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
    const [distance, setDistance] = useState('10');
    const navigate = useNavigate();
    
    useEffect(() => {
        // Initial fetch for all listings
        fetch('http://localhost:8080/filterByPriceAndDistance', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'order' : priceOrder,
                    'distance' : distance,
                    'email': props.token
                },
            })
        .then(response => response.json())
        .then(data => {
            if (!data.error) {
                console.log(data)
                setListings(data);
            } else {
                alert(data.error);
            }
        })
        .catch(error => console.error(error));
    }, []);

    useEffect(() => {
            setListings(props.listings);
            setPriceOrder('');
            setDistance('')
    }, [props.listings]);

    

    const handlePriceOrderChange = (event) => {
        setPriceOrder(event.target.value);
    };

    const handleDistanceChange = (event) => {
        setDistance(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault(); // Prevent the default form submission behavior
        fetchListingsSortedByPriceAndDistance(priceOrder, distance);
    };



    const fetchListingsSortedByPriceAndDistance = async (priceOrder, distance) => {
        try {
            const response = await fetch('http://localhost:8080/filterByPriceAndDistance', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'order' : priceOrder,
                    'distance' : distance,
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
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center' }}>
                            <TextField
                                label="Distance (km)"
                                type="number"
                                value={distance}
                                onChange={handleDistanceChange}
                                variant="outlined"
                                sx={{ maxWidth: 160, marginRight: 1 }}
                            />
                            <FormControl variant="outlined" sx={{ minWidth: 140, marginRight: 1 }}>
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
                            <Button type="submit" variant="contained">Apply</Button>
                        </form>
                    </Box>
                </Box>
                <Grid container spacing={4}>
                    {listings.map((listing) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={listing.listing_id}>
                            <Link to={'/listing/'+ listing.listing_id} style={{ textDecoration: 'none' }} target="_blank">
                                <AllProviderListing listing={listing} />
                            </Link>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </ThemeProvider>
    );
}

export default AllListings;
