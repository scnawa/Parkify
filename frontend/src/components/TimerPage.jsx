import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function TimerPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [timer, setTimer] = useState(0);
    const [token, setToken] = React.useState(localStorage.getItem('token'));

    const { listing_id, ListingNo} = location.state || {};
    useEffect(() => {
        const intervalId = setInterval(() => {
            setTimer((prevTimer) => prevTimer + 1);
        }, 1000);
        const fetchBooking = async () => {
            try {
                const response = await fetch('http://localhost:8080/getBookingTime', {
                    method: 'GET',
                    headers: {
                        'email': token,
                        'Content-Type': 'application/json',
                    },
                });

                const res = await response.json();
                if (res.error) {
                    return Promise.reject(res.error);
                } else {
                    return Promise.resolve(res);
                }
            } catch (error) {
                return Promise.reject(error);
            }
        };
        fetchBooking().then((data) => {
            const [hoursStr, minutesStr, secondsStr] = data.split(':');
            const preHours = parseInt(hoursStr);
            const preMinutes = parseInt(minutesStr);
            const preSeconds = parseInt(secondsStr);
            const preTime = new Date();
            preTime.setHours(preHours, preMinutes, preSeconds, 0); 
            setTimer(Math.round((Date.now() - preTime)/(1000)));
            return;
        })
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