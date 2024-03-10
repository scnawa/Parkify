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
	const [detail, setDetail] = React.useState('');
	// TODO: fetch the real data from backend

    const [listings, setListings] = React.useState([1,2,3]);
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
	}, [listings]);
	const createOnClick = () => {
		navigate('/create-listings')
	};
    return (
		<>
			<ThemeProvider theme={theme}>

				<Box display='flex' sx={{justifyContent:"space-between", margin:2} }>
					<Typography variant="h5" component="div">
						Manage you listings
					</Typography>
					<Button variant="contained"  sx={{height:35}} onClick={createOnClick} color="yellow">Create</Button>

				</Box>
			</ThemeProvider>


			<Grid container spacing={1.5} sx={{}}>
			{listings.map((key, listing) => {
				return (<Grid item xs={12} sm={6} md={4} key={key}>
					<ListingCard/>
				</Grid>)
				})}
			</Grid>
		</>
    )
}
export default MyListings;