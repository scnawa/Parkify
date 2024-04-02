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
        const data = {
            //pass real data
        }
        // testing data
        // const data = {
        //     'email': props.token,
        //     "listings": {
        //         'listing_id': '5998000f7717462684933a534f806d6c',
        //         'listing_no': 1,
        //         'address': '新南威尔斯大学, Anzac Parade, Kensington, Eastern Suburbs, 悉尼, Randwick City Council, 新南威尔士州, 2033, 澳大利亚 / 澳洲',
        //     },
        // }
        const fetchCreateBook = async () => {
            try {
                const response = await fetch('http://localhost:8080/create_booking', {
                    method: 'POST',
                    headers: {
                        'email': props.token,
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
        fetchCreateBook().then(()=>{
            navigate('/timer');
        }).catch(alert);
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