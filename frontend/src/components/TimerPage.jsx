import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DigitalClock } from '@mui/x-date-pickers/DigitalClock';
import { Paper, Button, createTheme } from '@mui/material';
import { ThemeProvider } from '@emotion/react';
import Typography from '@mui/material/Typography';

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

function TimerPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [timer, setTimer] = useState(0);
    const [token, setToken] = React.useState(localStorage.getItem('token'));

    const { listing_id, ListingNo } = location.state || {};
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
            setTimer(Math.round((Date.now() - preTime) / (1000)));
            return;
        })
        return () => {
            clearInterval(intervalId);
        };
    }, []);

    const handleEndBooking = () => {
        // send timer to backend for data retrieval purposes
        navigate('/park-end', { state: { timer, listing_id, ListingNo } });
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
                    <div style={{ display: "flex", flexDirection: "column", rowGap: "30px", height: '100%', justifyContent: 'center', justifyItems: 'space-between' }}>
                        <div style={{ alignSelf: 'center' }}>
                            <Typography variant="h3" display="block" gutterBottom color="green.dark">
                                TIMER: {formatTime(timer)}
                            </Typography>
                        </div>
                        <div style={{ display: "flex", flexDirection: "row", justifyContent: 'center' }}>
                            <Button variant="contained" color="green" onClick={handleEndBooking}>End Booking</Button>
                        </div>
                    </div>
                </Paper>
            </div>
        </ThemeProvider>

    )
}

export default TimerPage