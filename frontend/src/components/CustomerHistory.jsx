import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography, Button, Box } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useLocation, useNavigate } from 'react-router-dom';

function CustomerHistory(props) {
  const [selectedListing, setSelectedListing] = useState(null);
  const [listings, setListings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8080/get_listings', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'email': props.token,
          },
        });
        const data = await response.json();
        setListings(data.map(listing => ({ ...listing, label: listing.address })));
      } catch (error) {
        console.error('An error occurred during data fetching:', error);
      }
    };
    fetchData();
  }, []);

  const handleListingChange = (_, newValue) => {
    setSelectedListing(newValue);
  };

  const handleDispute =  async(booking) => {
    navigate('/disputePage', { state: { booking, email: booking.email } });
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.ceil(totalSeconds / 3600);
    return `${hours} hr${hours > 1 ? 's' : ''}`;
  };

  return (
    <div>
      <Autocomplete
        id="listing-select-combo"
        options={listings}
        sx={{ width: 300, marginLeft: 2, marginTop: 2 }}
        value={selectedListing}
        onChange={handleListingChange}
        autoHighlight
        getOptionLabel={(option) => option.label}
        renderInput={(params) => <TextField {...params} label="Select Listing" variant="outlined" />}
      />
      {selectedListing && selectedListing.recentBookings && (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            {selectedListing.recentBookings.map((booking, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper elevation={3} sx={{ p: 2 }}>
                  <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
                    {booking.address}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Total Price: ${booking.end_price}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Time: {formatTime(booking.total_time)} 
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    User: {booking.email} 
                  </Typography>
                  <Box display="flex" justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      onClick={() => handleDispute(booking)}
                      sx={{ borderColor: "red", color: "red", ':hover': { bgcolor: 'red', color: 'white', borderColor: 'red' } }}
                    >
                      Dispute
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      )}
    </div>
  );
}

export default CustomerHistory;
