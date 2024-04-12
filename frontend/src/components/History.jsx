import React, { useState, useEffect } from 'react';
import { Container, Paper, Grid, Typography, Button, Box} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';

const History = (props) => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [likeStatus, setLikeStatus] = useState([]);
  
  useEffect(() => {
    fetchBookings();
  }, []);

 /*  useEffect(()=> {
    //console.log("After: ", likeStatus);
    console.log(likeStatus)
    console.log(bookings[0])
  }, [likeStatus]); */

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
      //console.log(userInfo.recentBookings);
      setBookings(userInfo.recentBookings);
      setLikeStatus(Array(userInfo.recentBookings.length).fill(false));
    } catch (error) {
      console.error('Error getting user info:', error.message);
    }
  };

  const handleDispute =  async(booking) => {
    try {
          const response = await fetch('/getEmail', {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
                  'email': props.token,
                  'listingId': booking.listing_id
              },
          });
          const data = await response.json();
          if (data.error) {
            console.error('An error occurred during fetch:', data.error);
          } else {
            const email = data;
            navigate('/disputePage', { state: { booking, email } });
          }
      } catch (error) {
          console.error('An error occurred during fetch:', error);
      }
    };

  const formatTime = (totalSeconds) => {
    const hours = Math.ceil(totalSeconds / 3600);
    return `${hours} hr${hours > 1 ? 's' : ''}`;
  };

  const handleThumbClick = async (index) => {
    //console.log("Before: ", likeStatus);
    // Create a copy of the current like status array
    const updatedLikeStatus = [...likeStatus];
    // Toggle the like status for the specific booking
    updatedLikeStatus[index] = !updatedLikeStatus[index];
    // Update the state with the new like status array
    setLikeStatus(updatedLikeStatus); 
    console.log(bookings[index].listing_id)
    const endpoint = updatedLikeStatus[index] ? '/like' : '/dislike';
    console.log(endpoint)
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'email': props.token
        },
        body: JSON.stringify({ bookingId: bookings[index].id })
      });
  
      if (!response.ok) {
        throw new Error('Failed to update like status');
      }
  
      console.log('liked');
    } catch (error) {
      console.error('Error updating like status:', error.message);
    }
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
                <Box sx={{ mt: 1 , mr: 1}}>
                  {likeStatus[index] ? (
                    <ThumbUpAltIcon 
                      onClick={() => handleThumbClick(index)}
                      sx={{ color: "blue", fontSize: 30 }} 
                    />
                  ) : (
                    <ThumbUpOffAltIcon 
                      onClick={() => handleThumbClick(index)} 
                      sx={{ color: "blue", fontSize: 30 }} 
                    />
                  )}
                </Box>
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
