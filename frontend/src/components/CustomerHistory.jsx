import React, { useState, useEffect } from 'react';
import { Container, Paper, Grid, Typography, Button, Box } from '@mui/material';

const CustomerHistory = (props) => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/getUserInfo', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          "email": props.token,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get user info');
      }
      const userInfo = await response.json();
      console.log(userInfo);
      setBookings(userInfo.recentBookings);
    } catch (error) {
      console.error('Error getting user info:', error.message);
    }
  };

  const handleDispute = (bookingId) => {
    console.log("Disputing booking with ID:", bookingId);
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.ceil(totalSeconds / 3600);
    return `${hours} hr${hours > 1 ? 's' : ''}`;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        {bookings.map((booking, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
                {booking.address}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Total Price: ${booking.end_price}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Time: {formatTime(booking.total_time)}
              </Typography>
              <Box display="flex" justifyContent="flex-end">
                <Button 
                  variant="outlined" 
                  onClick={() => handleDispute(booking.id)}
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
  );
};

export default CustomerHistory;
