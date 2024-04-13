import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardActions, Container, Paper, Grid, Typography, Button, Box } from '@mui/material';
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
          <Grid item xs={12} sm={6} md={4} key={index} sx={{ display: 'flex' }}>
            <Card 
              elevation={3} 
              sx={{ 
                width: '100%', 
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '100%', 
                cursor: 'pointer', 
                '&:hover': {
                  boxShadow: '0 4px 8px 0 rgba(0,0,0,0.5)' 
                }
              }} 
              onClick={() => handleCardClick(booking.listing_id)}
            >
              <CardContent>
                <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
                  {booking.address}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Total Price: ${booking.end_price}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Time: {formatTime(booking.total_time)}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Car Number Plate: {booking.carNumberPlate}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={(e) => {
                    e.stopPropagation(); 
                    handleDispute(booking);
                  }}
                  sx={{ borderColor: "red", color: "red", ':hover': { bgcolor: 'red', color: 'white', borderColor: 'red' } }}
                >
                  Dispute
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>

  );
};

export default History;
