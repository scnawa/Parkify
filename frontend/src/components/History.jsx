import React, { useState, useEffect } from 'react';
import { Container, Paper, Grid, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const History = (props) => {
  const navigate = useNavigate();
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
          "token": props.token,
          "email": props.email
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get user info');
      }
      const userInfo = await response.json();
      setBookings(userInfo.recentBookings);
    } catch (error) {
      console.error('Error getting user info:', error.message);
    }
  };

  const handleDispute = async (booking) => {
    try {
      const response = await fetch('/getEmail', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'token': props.token,
          "email": props.email,
          'listingId': booking.listing_id
        },
      });
      const data = await response.json();
      if (data.error) {
        console.error('An error occurred:', data.error);
      } else {
        navigate('/disputePage', { state: { booking, email: data } });
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.ceil(totalSeconds / 3600);
    return `${hours} hr${hours > 1 ? 's' : ''}`;
  };

  const handleCardClick = (listingId) => {
    navigate(`/listing/${listingId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        {bookings.map((booking, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper
              elevation={3}
              sx={{ p: 2, cursor: 'pointer' }}
              onClick={() => handleCardClick(booking.listing_id)}
            >
              <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
                {booking.address}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Total Price: ${booking.end_price}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Time: {formatTime(booking.total_time)}
              </Typography>
              <Box display="flex" justifyContent="flex-end" onClick={(e) => e.stopPropagation()}>
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
  );
};

export default History;
