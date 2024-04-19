import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import { Typography, Paper, Button, createTheme } from '@mui/material';
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
// The page is to show the window time and let user cancel or confirm their pre booking
function Booking(props) {
	const navigate = useNavigate();
	const location = useLocation();
	const { listingId, listingNo, numberPlate } = location.state || {};
	const [initialTime, setinitialTime] = useState(null);
	// fetch the timer from backend for persistence 
	useEffect(() => {
		const fetchPreBookingTimer = async () => {
			try {
				const response = await fetch('/getPreBookingTime', {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						"token": props.token,
					}
				});

				if (!response.ok) {
					throw new Error('Failed to get time info');
				}
				const preTimer = await response.json();
				//get current time
				const currentTime = Date.now();
				// calculate the time and give a readible format
				const [hoursStr, minutesStr, secondsStr] = preTimer.split(':');
				const preHours = parseInt(hoursStr);
				const preMinutes = parseInt(minutesStr);
				const preSeconds = parseInt(secondsStr);
				const preTime = new Date();
				preTime.setHours(preHours, preMinutes, preSeconds, 0);
				const timeDifference = Math.round((preTime.getTime() + 600000 - currentTime) / (1000));
				setinitialTime(timeDifference);
			} catch (error) {
				console.error('Error getting time info:', error.message);
			}
		};

		fetchPreBookingTimer();

		return;
	}, [props.token]);

	const handleIamHereClick = () => {
		const data = {
			"token": props.token,
			"listingId": listingId,
			"listingNo": listingNo,
			"carNumberPlate": numberPlate,
		}
		const fetchCreateBook = async () => {
			try {
				const response = await fetch('http://localhost:8080/create_booking', {
					method: 'POST',
					headers: {
						'token': props.token,
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
			navigate('/timer', { state: { listingId, listingNo } });
		}).catch(alert);
	};

	// ensure that navigation to the main page only occurs after release listings completes
	const handleCancel = async () => {
		try {
			await releaseListing();
			console.log('Navigation can proceed now');
			navigate('/');
		} catch (error) {
			console.error('Failed to release listing:', error);
		}
	};


	const releaseListing = async () => {

		const data = {
			"token": props.token,
			"listingId": listingId,
			"listingNo": listingNo
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
					height: "85vh",
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
					<div>
						<Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'black' }}>
							Your Booking Has Been Reserved!
						</Typography>

						<Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: 'black', mt: 1 }}>
							Please Arrive Within The Time Given Below and Start Your Booking
						</Typography>
					</div>

					{initialTime &&
						<div style={{ display: "flex", flexDirection: "column", rowGap: "30px", justifyItems: 'space-between', marginTop: '100px' }}>
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