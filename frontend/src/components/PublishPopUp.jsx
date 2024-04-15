import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
// modal style is from https://mui.com/material-ui/react-modal/
const style = {
	minWidth: '320',
	position: 'absolute',

	bgcolor: 'background.paper',
	transform: 'translate(-50%, -50%)',

	left: '50%',
	display: 'flex',
	border: '2px solid #000',

	flexDirection: 'column',
	top: '50%',

};

function PublishPopUp(props) {
	const [start, setStart] = useState(
		(props.listings.start_date) ?
				new dayjs(props.listings.start_date) : new dayjs().utc().startOf('day')
	);
	const [end, setEnd] = useState(
		(props.listings.end_date) ?
				new dayjs(props.listings.end_date) : new dayjs().utc().add(7, 'day').startOf('day')
	);
	const popLocation = props.popoverLocation;
	const setPopOverLocation = props.setPopOverLocation;
	const popoverOnClose = props.popoverOnClose;
	const activated = props.activated;
	const setActivated = props.setActivated;


	const fetchPublish = async () => {
		try {
			const data = {
				listings: {
					"listing_id": props.listings.listing_id,
					"listing_no": props.listings.listing_no,
					"start_date": start,
					"end_date": end,

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
	// TODO: send request to backend and send notification
	const publishOnClick = (event) => {
		fetchPublish().then(() => {
			setActivated(true);
			alert("listing is now published");
		}).catch(alert);
		setPopOverLocation(false);
	}
	// TODO: send request to backend and send notification
	const deactivateOnClick = (event) => {
		const fetchPublish = async () => {
			try {
				const data = {
					listings: {
						"listing_id": props.listings.listing_id,
						"listing_no": props.listings.listing_no,
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
					<Box display='flex' sx={{ flexDirection:'column', justifyContent:'space-around', alignItems: 'center',rowGap:'2px', marginTop:'35px'}}>
						<div style={{ 
							display:'flex',
							flexDirection:'column',
							justifyContent:'space-around',
							alignItems: 'center',
							rowGap:'15px'
						}}>
							<LocalizationProvider dateAdapter={AdapterDayjs}>
								<DatePicker value={start} onChange={(input) => setStart(input)} />
							</LocalizationProvider>
							<Typography variant="button" display="block" gutterBottom sx={{justifySelf:'center'}}>to</Typography>
							<LocalizationProvider dateAdapter={AdapterDayjs}>
								<DatePicker value={end} onChange={(input) => setEnd(input)} />
							</LocalizationProvider>
						</div>

						<div style={{ 
							display:'flex',
							flexDirection:'column',
							justifyContent:'space-between',
							rowGap:'10px',
							marginTop:'30px'
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