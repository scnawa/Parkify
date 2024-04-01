import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Booking() {
    const navigate = useNavigate(); 
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
        navigate('/timer');
    };

    const releaseListing = async () => {
        console.log("release listing")
        try {
            const response = await fetch('/release_listing', {
                method: 'POST',
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

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    return (
        <div>
            <h2>Timer: {formatTime(timer)}</h2>
            <button onClick={handleIamHereClick}>I am here</button>
        </div>
    );
}

export default Booking;