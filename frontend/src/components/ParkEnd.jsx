import React from 'react';
import { useLocation } from 'react-router-dom';

function ParkEnd() {

    const location = useLocation();
    const timer = location.state ? location.state.timer : 0;
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };
    
    return (
        <div>
            <h1>Parking has Ended</h1>
            <p>Thank you for using our parking service!</p>
            <p>Duration: {formatTime(timer)}</p>
            <button>Pay</button>
        </div>
    );
}

export default ParkEnd;