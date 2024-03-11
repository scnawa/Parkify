import { Box, Button, ThemeProvider, Typography, createTheme } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import Grid from '@mui/material/Unstable_Grid2';
import ProviderListing from "./ProviderListing";
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
					return data
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

			{/* the grid/card structure is from https://stackoverflow.com/questions/69259870/react-material-ui-card-using-grid */}
			{/* i used a similar ui/ux approach with mui grid/card structure in my own comp6080 assignment4 but 
				i redesigned the style of card and restructured the layout of card content 
			*/}
			<Grid container spacing={1.5}>
				{listings.map((listing) => {
					// the key is somehow nessary for the child component to render
					// https://stackoverflow.com/questions/73577213/list-components-not-rendering-properly-after-applying-array-filter-reactjs
					return (<Grid key={listing.listing_id - listing.listing_no} xs={12} sm={6} md={4}>
						<ProviderListing key={listing.listing_id} token={props.token} listing={listing} listings={listings} setListings={setListings} />
					</Grid>)
				})}
			</Grid>
		</>
	)
}
export default MyListings;