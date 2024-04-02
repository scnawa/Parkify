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
        <div key={index}>
          <h2>{booking.title}</h2>
          <p>{booking.description}</p>
        </div>
      ))}
      </div>
    </div>
  );
};

export default History;