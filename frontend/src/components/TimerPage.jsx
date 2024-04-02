import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function TimerPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [timer, setTimer] = useState(0);
    const { listing_id, ListingNo} = location.state || {};
    useEffect(() => {
        const intervalId = setInterval(() => {
            setTimer((prevTimer) => prevTimer + 1);
        }, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    const handleEndBooking = () => {
        navigate('/park-end', { state: { timer, listing_id, ListingNo } });
    };
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };
  return (
    <div>
        <h1>Timer: {formatTime(timer)}</h1>
        <button onClick={handleEndBooking}>End Booking</button>
    </div>
  )
}

export default TimerPage