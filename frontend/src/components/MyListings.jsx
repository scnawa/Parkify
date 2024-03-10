import { Box, Button, Grid, ThemeProvider, Typography, createTheme } from "@mui/material";
import React from "react";
import ListingCard from "./ListingCard";
import { useNavigate } from "react-router-dom";

const theme = createTheme({
	palette: {
		yellow: {
			main: '#00897B',
			light: '#E0F2F1',
			dark: '#004D40',
			contrastText: '#CDDC39',
		},
	},
});
function MyListings(props) {
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
				const response = await fetch('http://localhost:8080/get_listings', {
					method: 'Get',
					headers: {
						'Content-Type': 'application/json',
						'email': props.token
					},
				});


				const data = await response.json();
				if (data.error) {
					alert(data.error);
				} else {
					setListings(data);
				}
			} catch (error) {
				console.error(error);
			}
		};

		fetchListings();
	}, []);
	const createOnClick = () => {
		navigate('/create-listings')
	};

	return (
		<>
			<ThemeProvider theme={theme}>

				<Box display='flex' sx={{ justifyContent: "space-between", margin: 2 }}>
					<Typography variant="h5" component="div">
						Manage you listings
					</Typography>
					<Button variant="contained" sx={{ height: 35 }} onClick={createOnClick} color="yellow">Create</Button>

				</Box>
			</ThemeProvider>


			<Grid container spacing={1.5} sx={{}}>
				{listings.map((listing) => {
					// the key is somehow nessary for the child component to render
					// https://stackoverflow.com/questions/73577213/list-components-not-rendering-properly-after-applying-array-filter-reactjs
					return (<Grid key={listing.listing_id} item xs={12} sm={6} md={4}>
						<ListingCard key={listing.listing_id} token={props.token} listing={listing} listings={listings} setListings={setListings} />
					</Grid>)
				})}
			</Grid>
		</>
	)
}
export default MyListings;