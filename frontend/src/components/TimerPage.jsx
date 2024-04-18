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

	const { listingId, listingNo } = location.state || {};
	useEffect(() => {
		const intervalId = setInterval(() => {
			setTimer((prevTimer) => prevTimer + 1);
		}, 1000);
		const fetchBooking = async () => {
			try {
				const response = await fetch('http://localhost:8080/getBookingTime', {
					method: 'GET',
					headers: {
						'token': token,
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
			console.log(data);
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
		// saveTimer saves the current end time and ends the booking phase, making
		// the state enter to the current 
		const saveTimer = async () => {
			try {
				const response = await fetch('http://localhost:8080/saveTimer', {
					method: 'POST',
					headers: {
						'token': token,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ 'timer': timer }),
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
		saveTimer()
			.then(() => {
				console.log('Save timer success');
				console.log('state variable timer: ' + timer)
				navigate('/park-end', { state: { timer, listingId, listingNo } });
			})
			.catch((error) => {
				console.error('Save timer failed:', error);
			});
	};
	const formatTime = (seconds) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
	};
	return (
		<ThemeProvider theme={theme}>
			<div style={{
				backgroundSize: "cover",
				height: "70vh",
				marginTop: '10px'
			}}>
				<Paper elevation={4}
					sx={{
						p: 2,
						margin: 'auto',
						maxWidth: "md",
						height: '100%',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'space-between'
					}}
				>
					<Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'black', alignSelf: 'start' }}>
						Your Booking is Underway
					</Typography>
					<div style={{ position: 'relative', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>  {/* Adjust height as needed */}
						<Typography variant="h3" display="block" gutterBottom color="green.dark" style={{
							position: 'absolute',
							top: '-145px',
							left: '50%',
							transform: 'translateX(-50%)'
						}}>
							TIMER: {formatTime(timer)}
						</Typography>
						<div style={{
							position: 'absolute',
							top: '-60px',
							left: '50%',
							transform: 'translateX(-50%)'
						}}>
							<Button variant="contained" color="green" onClick={handleEndBooking}>End Booking</Button>
						</div>
					</div>
				</Paper>
			</div>
		</ThemeProvider>


	)
}

export default TimerPage