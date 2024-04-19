import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import './ListingPage.css'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import location from '../assets/location.png';
import Background from '../assets/car.png';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css';
import 'leaflet-gesture-handling';



import { TextField, Tooltip, Container, Grid, Card, CardMedia, CardContent, CardActions, Typography, Box, Button } from '@mui/material';






const placeholder = L.icon({
	iconUrl: location,
	iconSize: [30, 35]
});

const priceStyle = {
	backgroundColor: '#4CAF50',
	borderRadius: '4px',
	padding: '6.5px',
	display: 'inline-block',
	marginRight: '8px',
	marginTop: 3,
};
// The page to show the listing details and let user perform booking
function ListingPage(props) {
	const navigate = useNavigate();
	// eslint-disable-next-line
	const [token, setToken] = React.useState(localStorage.getItem('token'));

	const { listingId } = useParams();
	const [listing, setListing] = useState(null);
	const [defaultPayment, setDefaultPayment] = useState(null);
	const [liked, setLiked] = useState(false);
	const [totalLikes, setTotalLikes] = useState(0);

	const [error, setError] = useState(null);
	const [numberPlate, setNumberPlate] = useState('');
	const [isNumberPlateValid, setIsNumberPlateValid] = useState(false);
	useEffect(() => {
		// To ensure user have entered their payment method in their account
		// otherwise stop them from booking
		const fetchPayment = async () => {
			try {
				const response = await fetch('http://localhost:8080/getDefaultCard', {
					method: 'Get',
					headers: {
						'Content-Type': 'application/json',
						'token': token,
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
						'token': props.token,
						'listingId': listingId
					},
					/* signal: signal */
				});
				const data = await response.json();
				if (data.error) {
					setError(data.error);
					console.log(error)
				} else {
					setListing(data);
					setLiked(data.hasLiked)
					setTotalLikes(data.likes)
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
				setDefaultPayment(data['defaultPayment']);
				return;
			}).catch((error) => { 
                if (window.confirm("You need to provide at least one payment method before booking. Redirect now?")) {
                    navigate("/managePayment");
                }
            });
		}

		// Cleanup function to abort fetch on component unmount
		/*  return () => {
			 abortController.abort();
		 }; */
		// eslint-disable-next-line
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
            if (window.confirm("You need to provide at least one payment method before booking. Redirect now?")) {
                navigate("/managePayment");
                return;
            }
			return;
		}
		const listingNo = listing.listingNo;
		const data = {
			"token": props.token,
			"listingId": listingId,
			"listingNo": listingNo,
			"carNumberPlate": numberPlate.toUpperCase()
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
				navigate('/book', { state: { listingId, listingNo, numberPlate } });
			} else {
				alert("Failed to book")
				console.error('Failed to hold listing');
			}
		} catch (error) {
			console.error('API call failed:', error);
		}
	};
	// set the listing location for the map below
	let locations = [50, 50];
	let mapProps = { ...listing };
	if (listing && listing.latitude
		&& listing.longitude) {
		locations = [listing.latitude, listing.longitude];
		mapProps.lat = listing.latitude;
		mapProps.lon = listing.longitude;


	}
	// controll the like button with liked or disliked state
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
					'token': props.token,
				},
				body: JSON.stringify({
					listingId: listing.listingId,
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

	const validateNumberPlate = (input) => {
		const isValid = /^[A-Za-z0-9]{6}$/.test(input);
		setIsNumberPlateValid(isValid);
	};

	const handleNumberPlateChange = (event) => {
		const input = event.target.value;
		setNumberPlate(input);
		validateNumberPlate(input);
	};


	return (
		<Container maxWidth="lg">
			{listing ? (
				<Grid container spacing={4} mt={2} alignItems="center">
					<Grid item xs={12} md={7}>
						<Card sx={{ borderRadius: '16px' }}>
							<Splide options={{ type: 'fade', rewind: true, width: '100%', gap: '1rem' }}>

								{listing.images && listing.images.length > 0 ? (
									<>
										<SplideSlide>
											<CardMedia
												component="img"
												height="450"
												image={listing.imageUrl || Background}
												alt="Parking space"
											/>
										</SplideSlide>

										{listing.images.map((image, index) => (

											<SplideSlide key={index + 1}>
												<CardMedia
													component="img"
													height="450"
													image={image}
													alt="Parking space"
												/>
											</SplideSlide>
										))}
									</>
								) : (
									<CardMedia
										component="img"
										height="450"
										image={listing.imageUrl || Background}
										alt="Parking space"
									/>
								)}
							</Splide>
						</Card>
					</Grid>
					<Grid item xs={12} md={5} style={{ display: 'flex', flexDirection: 'column' }}>
						<Card raised sx={{ borderRadius: '16px' }}>
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
								<Typography variant="body1" sx={priceStyle}>
									Price: ${listing.price}.00/hr
								</Typography>
							</CardContent>
							<CardActions disableSpacing>
								<TextField
									label="Number Plate"
									variant="outlined"
									value={numberPlate}
									onChange={handleNumberPlateChange}
									error={!isNumberPlateValid && numberPlate.length > 0}
									inputProps={{
										maxLength: 6,
										style: { textTransform: 'uppercase' }
									}}
									sx={{
										width: '140px',
										height: '37px',
										mr: '7px',
										'.MuiInputBase-input': {
											padding: '7px',
										},
										'.MuiInputLabel-outlined': {
											transform: 'translate(14px, 7px) scale(1)',
										},
										'& .MuiInputLabel-outlined.MuiInputLabel-shrink': {
											transform: 'translate(14px, -6px) scale(0.75)',
										}
									}}
								/>
								<Tooltip
									title={numberPlate.length === 6 && isNumberPlateValid ? "" : (!isNumberPlateValid && numberPlate.length > 0 ? "Invalid number plate" : "Enter 6 character number plate")}
								>
									<span>
										<Button
											variant="contained"
											color="primary"
											onClick={handleBookNow}
											disabled={!isNumberPlateValid}
										>
											Book Now
										</Button>
									</span>
								</Tooltip>
								<Typography component="span" sx={{ display: 'inline-flex', alignItems: 'center', ml: 1 }}>
									<Tooltip title={!listing.bookedPreviously ? "Book this listing to be able to like it" : "Click to like"}>
										<span>
											<IconButton onClick={toggleLike} color="error" disabled={!listing.bookedPreviously}>
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
							<MapContainer center={locations} zoom={15} style={{ height: '100%', width: '100%' }} gestureHandling={true}>
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