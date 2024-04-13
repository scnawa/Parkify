import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import './ListingPage.css'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import location from '../assets/location.png';
import { MapChild } from "./CreateListings";
import Background from '../assets/car.png';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';


import { Tooltip, Container, Grid, Card, CardMedia, CardContent, CardActions, Typography, Box, Button } from '@mui/material';






const placeholder = L.icon({
    iconUrl: location,
    iconSize: [30, 30]
});

const priceStyle = {
    backgroundColor: 'grey', 
    borderRadius: '4px',
    padding: '6.5px',
    display: 'inline-block', 
    marginRight: '8px', 
};

const availabilityStyle = {
    color: '#2e7d32', 
};  

function ListingPage(props) {
    const navigate = useNavigate();
    const [token, setToken] = React.useState(localStorage.getItem('token'));

    const { listing_id } = useParams();
    const [listing, setListing] = useState(null);
    const [defaultPayment, setDefaultPayment] = useState(null);
    const [liked, setLiked] = useState(false);
    const [totalLikes, setTotalLikes] = useState(0);

    const [error, setError] = useState(null);
    // console.log(props);
    useEffect(() => {
        /*         const abortController = new AbortController();
                const signal = abortController.signal; */
        // console.log(props);
        const fetchPayment = async () => {
            try {
                const response = await fetch('http://localhost:8080/getDefaultCard', {
                    method: 'Get',
                    headers: {
                        'Content-Type': 'application/json',
                        'email': token,
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

        const fetchListing = async () => {
            try {
                const response = await fetch('/getSpecificListing', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'email': props.token,
                        'listingId': listing_id
                    },
                    /* signal: signal */
                });
                const data = await response.json();
                if (data.error) {
                    setError(data.error);
                    console.log(error)
                } else {
                    setListing(data);
                    setLiked(data.has_liked)
                    setTotalLikes(data.likes)
                    // console.log(data);
                }
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.log('Request aborted');
                } else {
                    console.error(error);
                    setError("Failed to fetch listing data");
                }
            }
        };

        fetchListing();
        if (token) {
            fetchPayment().then((data) => {
                setDefaultPayment(data['default_payment']);
                return;
            }).catch(console.log);
        }

        // Cleanup function to abort fetch on component unmount
        /*  return () => {
             abortController.abort();
         }; */
    }, []);
    const handleBookNow = async () => {
        if (!token) {
            navigate("/login");
            return;
        }
        if (props.isAdmin) {
            alert("Admins cannot book a listing")
            return;
        }
        if (!defaultPayment) {
            alert("Please provide customer's payment method before booking");
            return;
        }
        const ListingNo = listing.listing_no;
        // pass real data
        // const data = {
        //     "email": token,
        //     "listingId": listing_id,
        //     "listingNo": ListingNo
        // }
        const data = {
            "email": props.token,
            "listingId": listing_id,
            "listingNo": ListingNo
        }
        try {
            const response = await fetch('/hold_listing', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                navigate('/book', { state: { listing_id, ListingNo } });
                //console.log("booked")
            } else {
                alert("Failed to book")
                console.error('Failed to hold listing');
            }
        } catch (error) {
            console.error('API call failed:', error);
        }
    };
    let locations = [50, 50];
    let mapProps = { ...listing };
    if (listing && listing.latitude
        && listing.longitude) {
        locations = [listing.latitude, listing.longitude];
        mapProps.lat = listing.latitude;
        mapProps.lon = listing.longitude;


    }
    console.log(listing);

    const toggleLike = async () => {
        const currentlyLiked = liked; 
        setLiked(!liked);
        const endpoint = currentlyLiked ? '/dislike' : '/like'; 
        setTotalLikes(currentlyLiked ? totalLikes - 1 : totalLikes + 1);
        try {
            const data = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'email': props.token,
                },
                body: JSON.stringify({
                    listingId: listing.listing_id,
                }),
            });
    
            if (data.error) {
                setError(data.error);
                console.log(error)
            } else {
                console.log("liked or unliked now")
            }
            // Optionally handle the response data if needed
        } catch (error) {
            console.error('API call failed:', error);
            setLiked(currentlyLiked); // Revert the liked state if the API call fails
        }
    };

    return (
        <Container maxWidth="lg">
            {listing ? (
                <Grid container spacing={4} mt={2} alignItems="center">
                    <Grid item xs={12} md={7}>
                        <Card sx={{borderRadius: '16px'}}>
                            <Splide options={{ type: 'fade', rewind: true, width: '100%', gap: '1rem' }}>
                                {listing.images && listing.images.length > 0 ? (
                                    listing.images.map((image, index) => (
                                        <SplideSlide key={index}>
                                            <CardMedia
                                                component="img"
                                                height="450"
                                                image={image || listing.image_url || Background}
                                                alt="Parking space"
                                            />
                                        </SplideSlide>
                                    ))
                                ) : (
                                    <CardMedia
                                        component="img"
                                        height="450"
                                        image={listing.image_url || Background}
                                        alt="Parking space"
                                    />
                                )}
                            </Splide>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={5} style={{ display: 'flex', flexDirection: 'column' }}>
                        <Card raised sx={{borderRadius: '16px'}}>
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="div">
                                    {listing.address}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Description: {listing.details}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                    Restrictions: {listing.restrictions}
                                </Typography>
                                {/* Price and availability with additional styles */}
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body1" sx={availabilityStyle}>
                                        Status: Parking space is available
                                    </Typography>
                                </Box>
                            </CardContent>
                            <CardActions disableSpacing>
                                <Typography variant="body1" sx={priceStyle}>
                                    Price: ${listing.price}.00/hr
                                </Typography>
                                <Button variant="contained" color="primary" onClick={handleBookNow}>
                                    Book Now
                                </Button>
                                <Typography component="span" sx={{ display: 'inline-flex', alignItems: 'center', ml: 1 }}>
                                    <Tooltip title={!listing.booked_previously ? "Book this listing to be able to like it" : "Click to like"}>
                                        <span>
                                            <IconButton onClick={toggleLike} color="error" disabled={!listing.booked_previously}>
                                                {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                    <span>{totalLikes}</span>
                                </Typography>

                            </CardActions>
                        </Card>
                    </Grid>
                    <Grid item xs={12}>
                        <Box sx={{ height: 400, width: '100%' }}>
                            <MapContainer center={locations} zoom={15} style={{ height: '100%', width: '100%' }}>
                                <TileLayer
                                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker icon={placeholder} position={locations} />
                            </MapContainer>
                        </Box>
                    </Grid>
                </Grid>
            ) : (
                <Typography variant="h6" align="center">Loading...</Typography>
            )}
        </Container>
    );
}

export default ListingPage;