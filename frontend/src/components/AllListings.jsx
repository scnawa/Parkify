import React, { useState, useEffect } from "react";
import { TextField, Box, Grid, ThemeProvider, Typography, createTheme, Button, MenuItem, FormControl, Select, InputLabel } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import AllProviderListing from "./AllProviderListing";
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import location from '../assets/location.png';
import { MapChild } from "./CreateListings";
const placeholder = L.icon({
    iconUrl: location,
    iconSize: [30, 35]
});

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
function PanMap(props) {
    const map = useMap();
    const userLocation = props.userLocation;
    if (userLocation[0] != -33.9062434 && userLocation[1] != 151.23465683738365) {
        map.panTo(new L.LatLng(userLocation[0], userLocation[1]));
    }
    return null;
}
function AllListings(props) {
    const [listings, setListings] = useState([]);
    const [priceOrder, setPriceOrder] = useState('');
    const [distance, setDistance] = useState('10');
    const [userLocation, setUserLocation] = useState([-33.9062434, 151.23465683738365]);
    const [initialListingsLoaded, setInitialListingsLoaded] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Initial fetch for all listings
        fetch('http://localhost:8080/filterByPriceAndDistance', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'order': priceOrder,
                'distance': distance,
                'email': props.token,
                'lat': userLocation[0],
                'lon': userLocation[1],
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
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log(position);
                    const { latitude, longitude } = position.coords;
                    setUserLocation([latitude, longitude]);
                }
            )
        }
    }, []);
    // we leverage reacts design here. the useffects are ran before the initial render is complete
    // meaning that any variable changes (such as initialistings loaded = true) are not reflected
    // and done UNTIL the useffects and initial render are fully finished. Hence we can use this
    // fact to ensure that the listings first appear as normal and the stuff to do with 
    // showing the listings for a search (which is done below, in the useffect where 
    // the search function in a different file changes props.listing to the new 
    // searched listings) only appears when props.listing is changed and not when
    // we are on initial render. initiallistingsload will be set to true AFTER
    // the useffects are finished AND the initial render is finished, meaning
    // that the below on initial will never run. hence we leverage how react is 
    // designed to achieve this.
    useEffect(() => {
        if (initialListingsLoaded) {
            setListings(props.listings);
            setPriceOrder('');
            setDistance('')
        }
    }, [props.listings]);


    const handlePriceOrderChange = (event) => {
        setPriceOrder(event.target.value);
    };

    const handleDistanceChange = (event) => {
        const value = event.target.value;
    
        const numericOnly = value.replace(/[^\d]/g, '');
    
        const intValue = parseInt(numericOnly, 10);
    
        if (!isNaN(intValue)) {
            setDistance(intValue.toString()); 
        } else {
            setDistance(''); 
        }
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
                    'order': priceOrder,
                    'distance': distance,
                    'email': props.token,
                    'lat': userLocation[0],
                    'lon': userLocation[1],

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
    console.log(userLocation);

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
                            <Button type="submit" sx={{
                                ml: 1,
                                bgcolor: 'black',
                                '&:hover': {
                                    bgcolor: 'black', // lighter green on hover
                                },
                                borderRadius: '4px',
                                padding: '10px 16px'
                            }} variant="contained">Apply</Button>
                        </form>
                    </Box>
                </Box>
                {/* the below code of map is from https://www.youtube.com/watch?v=rmIhGPy8rSY and
						    https://react-leaflet.js.org/docs/example-popup-marker/*/}
                <div style={{ width: "100%", height: "80vh", 'margin-top': '3px' }}>
                    <MapContainer center={userLocation} zoom={12} style={{ width: '100%', height: '100%' }}>
                        <TileLayer
                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            style={{ width: '100%', height: '100%' }}
                        />

                        {listings.map((listing, key) => {
                            let locations = [50, 50];
                            let mapProps = { ...listing };
                            if (listing && listing.latitude
                                && listing.longitude) {
                                locations = [listing.latitude, listing.longitude];
                                mapProps.lat = listing.latitude;
                                mapProps.lon = listing.longitude;
                            }
                            return (
                                <>
                                    <div key={String(listing.latitude) + String(listing.longitude) + key}>
                                        <Marker icon={placeholder} position={locations}>
                                            <Popup maxHeight='400' autoClose>
                                                <Link to={'/listing/' + listing.listing_id} style={{ textDecoration: 'none' }} target="_blank">
                                                    <AllProviderListing listing={listing} height={'100%'} imageHeight={'150px'} objectFit='contain' />
                                                </Link>
                                            </Popup>
                                        </Marker>
                                    </div>


                                </>
                            );
                        })}
                        <PanMap userLocation={userLocation} />

                    </MapContainer>
                </div>

                <Grid container spacing={4} style={{ 'margin-top': '10px' }}>
                    {listings.map((listing) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={listing.listing_id}>
                            <Link to={'/listing/' + listing.listing_id} style={{ textDecoration: 'none' }} target="_blank">
                                <AllProviderListing listing={listing} height={'100%'} imageHeight={'300px'} objectFit='cover' />
                            </Link>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </ThemeProvider>
    );
}

export default AllListings;
