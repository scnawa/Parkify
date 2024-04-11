import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import { Paper, Button, createTheme } from '@mui/material';
import { ThemeProvider } from '@emotion/react';
const theme = createTheme({
    palette: {
        green: {
            main: '#4caf50',
            light: '#E0F2F1',
            dark: '#004D40',
            contrastText: '#E0F2F1',
        },
    },
});

function Booking(props) {
    const navigate = useNavigate();
    const location = useLocation();
    const { listing_id, ListingNo } = location.state || {};
    const [timer, setTimer] = useState('');
    const [initialTime, setinitialTime] = useState(null);

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
                const timeDifference = Math.round((preTime.getTime() + 600000 - currentTime) / (1000));
                setinitialTime(timeDifference);
                setTimer(timeDifference);
            } catch (error) {
                console.error('Error getting time info:', error.message);
            }
        };

        // const interval = setInterval(() => {
        //     setTimer((prevTimer) => Math.max(prevTimer - 1, 0));
        // }, 1000);

        fetchPreBookingTimer();

        return;
    }, [props.token]);
    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prevTimer) => Math.max(prevTimer - 1, 0));
        }, 1000);
        return () => clearInterval(interval);
    }, [])


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
        fetchCreateBook().then(() => {
            navigate('/timer', { state: { listing_id, ListingNo } });
        }).catch(alert);
    };

    const handleCancel = () => {
        releaseListing();

        navigate('/');
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


    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };
    return (
        <ThemeProvider theme={theme} >

            <div
                style={{
                    "backgroundSize": "cover",
                    height: "70vh",
                    marginTop: '10px'
                }}>
                <Paper elevation={4}
                    sx={{
                        p: 2,
                        margin: 'auto',
                        maxWidth: "md",
                        height: '100%',
                    }}
                >

                    {initialTime &&
                        <div style={{ display: "flex", flexDirection: "column", rowGap: "30px", height: '100%', justifyContent: 'center', justifyItems: 'space-between' }}>
                            <div style={{ alignSelf: 'center' }}>
                                <CountdownCircleTimer
                                    isPlaying
                                    duration={600}
                                    initialRemainingTime={initialTime}
                                    colors={["#4caf50", "#CDDC39", "#990F02", "#000000"]}
                                    colorsTime={[600, 300, 180, 0]}
                                    onComplete={() => {
                                        handleCancel();
                                    }}
                                >
                                    {({ remainingTime, color }) => {
                                        return (
                                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                                <div style={{ color: color }}>Time Remaining:</div>
                                                <div style={{ color: color }}>{formatTime(remainingTime)}</div>
                                            </div>)
                                    }}

                                </CountdownCircleTimer>
                            </div>
                            <div style={{ display: "flex", flexDirection: "row", justifyContent: 'space-around' }}>
                                <Button variant="contained" color="green" onClick={handleIamHereClick}>Confirm Booking</Button>
                                <Button variant="contained" color="green" onClick={handleCancel}>Cancel</Button>
                            </div>
                        </div>
                    }
                </Paper>
            </div>
        </ThemeProvider>

    )
}

export default Booking;