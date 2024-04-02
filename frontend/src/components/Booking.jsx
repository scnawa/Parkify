import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Booking( props ) {
    const navigate = useNavigate(); 
    const location = useLocation();
    const { listing_id, ListingNo} = location.state || {};
    const [timer, setTimer] = useState('');

    useEffect(() => {
        const fetchPreBookingTimer = async () => {
            try {
                const response = await fetch('/getPreBookingTime', {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    "email": props.token,
                  }
                });
            
                if (!response.ok) {
                  throw new Error('Failed to get time info');
                }
                const preTimer = await response.json();
                console.log(preTimer);
                //get current time
                const currentTime = Date.now();
                console.log(currentTime);

                const [hoursStr, minutesStr, secondsStr] = preTimer.split(':');
                const preHours = parseInt(hoursStr);
                const preMinutes = parseInt(minutesStr);
                const preSeconds = parseInt(secondsStr);
                const preTime = new Date();
                preTime.setHours(preHours, preMinutes, preSeconds, 0); 
                const timeDifference = Math.round((preTime.getTime() + 600000 - currentTime)/(1000));
                setTimer(timeDifference);
              } catch (error) {
                console.error('Error getting time info:', error.message);
              }
          };
        
        const interval = setInterval(() => {
            setTimer((prevTimer) => Math.max(prevTimer - 1, 0));
        }, 1000);

        fetchPreBookingTimer();

        return () => clearInterval(interval);
    }, []);



    const handleIamHereClick = () => {
        //createBooking();
        const data = {
            "email": props.token,
            "listingId": listing_id,
            "listingNo": ListingNo
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
            navigate('/timer', { state: { listing_id, ListingNo} });
        }).catch(alert);
    };

    const handleCancel = () => {
        navigate('/');
        releaseListing();
    };

    const releaseListing = async () => {
        //console.log("release listing")
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

    /* const createBooking = async() => {
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
      } */

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