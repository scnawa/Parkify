import React, { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Box, Button, Popover, Typography, createTheme } from '@mui/material';
import "react-multi-date-picker/styles/colors/green.css"
import { ThemeProvider } from '@emotion/react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';


const theme = createTheme({
	palette: {
		primary: {
			main: '#4caf50', // Green primary colour
			contrastText: '#ffffff',

		},
		contrastText: '#ffffff',
	},
});
// popup used for contain manage the publish dates of listing
function PublishPopUp(props) {
	const [start, setStart] = useState(
		(props.listings.startDate) ?
			dayjs(props.listings.startDate) : dayjs(dayjs().format('MM/DD/YY'))
	);
	const [end, setEnd] = useState(
		(props.listings.endDate) ?
			dayjs(props.listings.endDate) : dayjs(dayjs().add(7, 'day').format('MM/DD/YY'))
	);
	const popLocation = props.popoverLocation;
	// controll the popover
	const setPopOverLocation = props.setPopOverLocation;
	const popoverOnClose = props.popoverOnClose;
	const activated = props.activated;
	const setActivated = props.setActivated;


	const fetchPublish = async () => {
		try {
			const data = {
				listings: {
					"listingId": props.listings.listingId,
					"listingNo": props.listings.listingNo,
					"startDate": start,
					"endDate": end,

				}
			}
			const response = await fetch('http://localhost:8080/activate_listing', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'token': props.token,
					'email': props.email,
				},
				body: JSON.stringify(data),
			});

			const res = await response.json();
			if (res.error) {
				return Promise.reject(res.error);
			} else {
				return Promise.resolve();
			}
		} catch (error) {
			return Promise.reject(error);
		}
	}
	// send request to backend and send notification
	const publishOnClick = (event) => {
		fetchPublish().then(() => {
			setActivated(true);
			alert("listing is now published");
		}).catch(alert);
		setPopOverLocation(false);
	}
	// request to backend and send notification
	const deactivateOnClick = (event) => {
		const fetchPublish = async () => {
			try {
				const data = {
					listings: {
						"listingId": props.listings.listingId,
						"listingNo": props.listings.listingNo,
					}
				}
				const response = await fetch('http://localhost:8080/deactivate_listing', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'token': props.token,
						'email': props.email,
					},
					body: JSON.stringify(data),
				});

				const res = await response.json();
				if (res.error) {
					return Promise.reject(res.error);
				} else {
					return Promise.resolve();
				}
			} catch (error) {
				return Promise.reject(error);
			}
		};
		fetchPublish().then(() => {
			setActivated(false);
			setStart(null);
			setEnd(null);

			alert("listing is now deactivated");
		}).catch(alert);
		setPopOverLocation(false);
	}
	// track the status of the popup
	const isTriggered = Boolean(popLocation);
	const id = isTriggered ? 'box' : undefined;

	return (<>
		<ThemeProvider theme={theme}>

			<Popover
				id={id}
				open={isTriggered}
				anchorEl={popLocation}
				onClose={popoverOnClose}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'left',
				}}
			>
				<div
					style={{
						width: '300px',
						height: '300px',
					}}
				>
					<Box display='flex' sx={{ flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center', rowGap: '2px', marginTop: '35px' }}>
						<div style={{
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'space-around',
							alignItems: 'center',
							rowGap: '15px'
						}}>
							{activated &&
								<>
									<LocalizationProvider dateAdapter={AdapterDayjs}>
										<DatePicker value={start} readOnly />
									</LocalizationProvider>
									<Typography variant="button" display="block" gutterBottom sx={{ justifySelf: 'center' }}>to</Typography>
									<LocalizationProvider dateAdapter={AdapterDayjs}>
										<DatePicker value={end} readOnly />
									</LocalizationProvider>
								</>
							}
							{!activated &&
								<>
									<LocalizationProvider dateAdapter={AdapterDayjs}>
										<DatePicker value={start} maxDate={end} disablePast onChange={(input) => setStart(input)} />
									</LocalizationProvider>
									<Typography variant="button" display="block" gutterBottom sx={{ justifySelf: 'center' }}>to</Typography>
									<LocalizationProvider dateAdapter={AdapterDayjs}>
										<DatePicker value={end} minDate={start} disablePast onChange={(input) => setEnd(input)} />
									</LocalizationProvider>
								</>
							}
						</div>

						<div style={{
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'space-between',
							rowGap: '10px',
							marginTop: '30px'
						}}
						>
							{!activated &&
								<Button variant="contained" onClick={publishOnClick} >
									Activate
								</Button>
							}
							{activated &&
								<Button variant="contained" onClick={deactivateOnClick}>
									Deactivate
								</Button>
							}

							<Button variant="contained" onClick={popoverOnClose}>
								Cancel
							</Button>
						</div>
					</Box>


				</div>
			</Popover>
		</ThemeProvider>

	</>)

}
export default PublishPopUp;