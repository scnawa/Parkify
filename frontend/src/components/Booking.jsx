import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Booking( props ) {
    const navigate = useNavigate(); 
    const location = useLocation();
    const { listing_id, ListingNo} = location.state || {};
    const [timer, setTimer] = useState(600);
    useEffect(() => {
        const storedStartTime = localStorage.getItem('bookingStartTime');

        if (storedStartTime) {
            const startTime = parseInt(storedStartTime, 10);
            const currentTime = Date.now();
            const elapsedTime = Math.floor((currentTime - startTime) / 1000);
            const remainingTime = Math.max(600 - elapsedTime, 0);

            setTimer(remainingTime);
        } else {
            const startTime = Date.now();
            localStorage.setItem('bookingStartTime', startTime.toString());
        }

        const interval = setInterval(() => {
            setTimer((prevTimer) => Math.max(prevTimer - 1, 0));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (timer === 0) {
            console.log("api call")
            releaseListing();
            localStorage.clear();
            navigate("/")
        }
    }, [timer]);

    const handleIamHereClick = () => {
        createBooking();
        navigate('/timer');
    };

    const handleCancel = () => {
        navigate('/');
        releaseListing();
    };

    const releaseListing = async () => {
        console.log("release listing")
        const data = {
            "email": props.token,
            "listingId": listing_id,
            "listingNo": ListingNo
        }
        try {
            const response = await fetch('/release_listing', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }, 
                body: JSON.stringify(data),
            });

            if (response.ok) {
                console.log('Listing released successfully.');
            } else {
                console.error('Failed to release listing.');
            }
        } catch (error) {
            console.error('API call failed:', error);
        }
    };

    const createBooking = async() => {
        const userData = {
            "email": props.token,
            "listingId": listing_id,
        }
        try {
          const response = await fetch('/create_booking', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
          });
      
          if (!response.ok) {
            throw new Error('Failed to create booking');
          } 
          const responseData = await response.json();
          console.log(responseData);
        } catch (error) {
          console.error('Error creating booking:', error.message);
        }
      }

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    return (
        <div>
            <h2>Timer: {formatTime(timer)}</h2>
            <button onClick={handleIamHereClick}>I am here</button>
            <button onClick={handleCancel}>Cancel</button>
        </div>
    );
}

export default Booking;