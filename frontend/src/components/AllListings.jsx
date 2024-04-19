import React, { useState, useEffect } from "react";
import { Tooltip, Divider, TextField, Box, Grid, ThemeProvider, Typography, createTheme, Button, MenuItem, FormControl, Select, InputLabel, Pagination } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import AllProviderListing from "./AllProviderListing";
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import location from '../assets/location.png';
import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css';
import 'leaflet-gesture-handling';

export const fetchListingsSortedByPriceAndDistance = async (priceOrder, distance, setListings, setTotalPage, userLocation, curPage) => {
	try {
		const response = await fetch('http://localhost:8080/filterByPriceAndDistance', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'order': priceOrder,
				'distance': distance,
				'lat': userLocation[0],
				'lon': userLocation[1],
				'page': curPage - 1,
			},
		});

		const data = await response.json();
		if (!data.error) {
			setListings(data.listings);
			setTotalPage(data.totalPage);
		} else {
			alert(data.error);
		}
	} catch (error) {
		console.error(error);
	}
};

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
// used to controll to map, center the map and zoom in the map
function PanMap(props) {
	const map = useMap();
	const userLocation = props.userLocation;
	if (userLocation[0] !== -33.9062434 && userLocation[1] !== 151.23465683738365) {
		map.panTo(new L.LatLng(userLocation[0], userLocation[1]));
	}
	return null;
}
// The page to contains all the activated listings for user to navigate
function AllListings(props) {
	const [listings, setListings] = useState([]);
	const [priceOrder, setPriceOrder] = useState('');
	const [distance, setDistance] = useState('50');
	const [userLocation, setUserLocation] = useState([-33.9062434, 151.23465683738365]);
	const [initialListingsLoaded, setInitialListingsLoaded] = useState(false);
	const [totalPage, setTotalPage] = useState(1);
	const [curPage, setCurPage] = useState(1);
	const [recommendedListings, setRecommendedListings] = useState([]);
	const [showRecommendations, setShowRecommendations] = useState(false);


	const navigate = useNavigate();
	useEffect(() => {
		console.log(props.isAdmin)
		// Check if user is currently in a prebooking/booking
		if (props.token && (!props.isAdmin)) {
			fetch('http://localhost:8080/timerPersistence', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'token': props.token,
				},
			})
				.then(response => response.json())
				.then(data => {
					if (!data.error) {
						if (data.result === "prebooking") {
							navigate('/book', { state: { listingId: data.listingId, listingNo: data.listingNo, numberPlate: data.carNumberPlate } });
							console.log("in a prebooking")
						} else if (data.result === "booking") {
							navigate('/timer', { state: { listingId: data.listingId, listingNo: data.listingNo } });
							console.log("in a booking")
						} else if (data.result === "endbooking") {
							navigate('/park-end', { state: { timer: data.timer, listingId: data.listingId, listingNo: data.listingNo } });
							console.log("in endbooking")
						} else if (data.result === "none") {
							console.log("not in a booking");
						}

					} else {
						alert(data.error);
					}
				})
				.catch(error => console.error(error));
		}
		// eslint-disable-next-line
	}, []);


	useEffect(() => {
		// Initial fetch for all listings
		fetch('http://localhost:8080/filterByPriceAndDistance', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'order': priceOrder,
				'distance': distance,
				'token': props.token,
				'lat': userLocation[0],
				'lon': userLocation[1],
				'page': curPage - 1,
			},
		})
			.then(response => response.json())
			.then(data => {
				if (!data.error) {
					setListings(data.listings);
					setTotalPage(data.totalPage);

					setInitialListingsLoaded(true)
				} else {
					alert(data.error);
				}
			})
			.catch(error => console.error(error));
		// eslint-disable-next-line
	}, [curPage]);
	useEffect(() => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
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
			setTotalPage(props.totalPage);
			setCurPage(1);
			setPriceOrder('');
			setDistance('')
		}
		// eslint-disable-next-line
	}, [props.listings]);

    useEffect(() => {
        const fetchData = async () => {
            console.log(props.isAdmin)
            if (props.token && (!props.isAdmin)) {
                try {
                    // First fetch to check the number of users
                    const responseUsers = await fetch('http://localhost:8080/get_all_users', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                    const users = await responseUsers.json();
                    
                    // Check the number of users
                    if (users.length < 3) {
                        setRecommendedListings(false);
                        console.log('Not enough users for recommendations');
                        return; // Exit if not enough users
                    }

                    // If there are enough users, fetch recommendations
                    console.log('Recommended listings queried');
                    const responseRecommendations = await fetch('http://localhost:8080/recommendations', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'token': props.token,
                            'email': props.email,
                        },
                    });
                    const data = await responseRecommendations.json();
                    if (!data.error) {
                        setRecommendedListings(data);
                        console.log('Recommended listings SET');
                    } else {
                        alert(data.error);
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
		fetchListingsSortedByPriceAndDistance(priceOrder, distance, setListings, setTotalPage, userLocation, 1);
		setCurPage(1);
	};

	return (
		<ThemeProvider theme={theme}>
			<Box sx={{ margin: 2 }}>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', rowGap: '3px' }}>
					<Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
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
				<Box sx={{ position: 'relative', width: '100%', height: '80vh', marginTop: '3px' }}>
					<MapContainer center={userLocation} zoom={12} style={{ width: '100%', height: '100%' }} gestureHandling={true}>
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
												<Link to={'/listing/' + listing.listingId} style={{ textDecoration: 'none' }} target="_blank">
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
				</Box>

				<Grid container spacing={4} style={{ 'margin-top': '10px' }}>
					{listings.map((listing) => (
						<Grid item xs={12} sm={6} md={4} lg={3} key={listing.listingId}>
							<Link to={'/listing/' + listing.listingId} style={{ textDecoration: 'none' }} target="_blank">
								<AllProviderListing listing={listing} height={'100%'} imageHeight={'300px'} objectFit='cover' />
							</Link>
						</Grid>
					))}
				</Grid>
				<Box sx={{ width: "100%", display: "flex", 'margin-top': '40px', justifyContent: "center" }}>
					<Pagination count={totalPage} size="large" page={curPage} onChange={(_, value) => { setCurPage(value); }} />
				</Box>
				{props.token && (!props.isAdmin) && (
                    <Tooltip
                        title={recommendedListings === false ? "We cannot recommend you any listings since we have less than three users. Please check later" : ""}
                    >
                        <span>
                            <Button
                                variant="contained"
                                disabled={!recommendedListings}
                                sx={{
                                    bgcolor: '#4caf50',
                                    '&:hover': {
                                        bgcolor: '#4caf50',
                                    },
                                    color: 'white',
                                    borderRadius: '4px',
                                    padding: '10px 16px',
                                    my: 2
                                }}
                                onClick={() => setShowRecommendations(!showRecommendations)}
                            >
                                {showRecommendations ? 'Hide Recommendations' : 'Show Recommendations'}
                            </Button>
                        </span>
                    </Tooltip>
				
				)}
				{/* Recommended listings section */}
				{props.token && showRecommendations && (
					<>
						<Divider sx={{ my: 4 }} />
						<Box sx={{ mt: 4, p: 2 }}>
							<Typography variant="h5" sx={{ mb: 2, color: 'black', fontWeight: 'medium' }}>
								Recommended for You
							</Typography>
							<Grid container spacing={4} style={{ 'margin-top': '10px' }}>
								{recommendedListings.map((listing) => (
									<Grid item xs={12} sm={6} md={4} lg={3} key={listing.listingId}>
										<Link to={'/listing/' + listing.listingId} style={{ textDecoration: 'none' }} target="_blank">
											<AllProviderListing listing={listing} height={'100%'} imageHeight={'300px'} objectFit='cover' />
										</Link>
									</Grid>
								))}
							</Grid>
						</Box>
					</>
				)}
			</Box>
		</ThemeProvider>
	);
}

export default AllListings;
