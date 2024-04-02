import React, { useState, useEffect } from 'react';
import './History.css'


const History = ( props ) => {
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
        setBookings(userInfo.recentBookings)
      } catch (error) {
        console.error('Error getting user info:', error.message);
      }
  };

  
  return (
    <div>
      <div className='history-page-container'>
      {bookings.map((booking, index) => (
        <div className='recent-booking-card' key={index}>
          <h2>{booking.address}</h2>
          <p>{booking.end_price}</p>
          <p>{booking.start_time}</p>
        </div>
      ))}
      </div>
    </div>
  );
};

export default History;