import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function ParkEnd() {
    const [token, setToken] = React.useState(localStorage.getItem('token'));

    const location = useLocation();
    const timer = location.state ? location.state.timer : 0;
    const navigate = useNavigate(); 

    React.useEffect(() => {
		if (!token) {
			navigate('/login');
			return
		}
    }, []);
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };
    
    // testing data
    // const data = {
    //     "listings": {
    //         "listing_no":1,
    //         'price':7,
    //         "listing_id":'5998000f7717462684933a534f806d6c',

    //     },
    //     "booking": {
    //         "listing_id":'5998000f7717462684933a534f806d6c',
    //         "total_time":2,
    //         "feedback": "good",
    //         "end_image_url": "example.png",
    //         "recentbooking_no":0,
    //     },
    // };
    const data = {
        // pass real data
    }
    const handlePayment = () => {
        console.log(data);
        const fetchEndBooking = async () => {
            try {
                const response = await fetch('http://localhost:8080/end_booking', {
                    method: 'POST',
                    headers: {
                        'email': token,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
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
        fetchEndBooking().then(()=> {
            alert("booking is ended");
            // navigate('/myListing');
        }).catch(alert);
    };
    return (
        <div>
            <h1>Parking has Ended</h1>
            <p>Thank you for using our parking service!</p>
            <p>Enter Promo Code<input type="text"></input></p>
            <p>Duration: {formatTime(timer)}</p>
            <button onClick={handlePayment}>Pay</button>
        </div>
    );
}

export default ParkEnd;