import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography } from '@mui/material';
// The page for user to make a dispute
const DisputePage = (props) => {
	const location = useLocation();
	const navigate = useNavigate();
	const { booking, email } = location.state;
	const [disputeMessage, setDisputeMessage] = useState('');
	const [selectedFiles, setSelectedFiles] = useState([]);
	// handle dispute file upload
	const handleFileSelect = (event) => {
		setSelectedFiles([...event.target.files]);
	};
	// convert the file image to base 64
	const convertImageToBase64 = (file) => {
		const reader = new FileReader();
		return new Promise((resolve, reject) => {
			reader.onerror = () => reject(new Error("An error occurred while reading the file."));
			reader.onload = () => resolve(reader.result);
			reader.readAsDataURL(file);
		});
	};

	const convertMultipleFilesToBase64 = (files) => {
		const promises = Array.from(files).map(file => convertImageToBase64(file));
		return Promise.all(promises);
	};

	const handleDisputeSubmit = async () => {
		try {
			const base64Files = await convertMultipleFilesToBase64(selectedFiles);
			const dataSend = {
				address: booking.address,
				date: booking.date,
				endPrice: booking.endPrice,
				totalTime: booking.totalTime,
				startTime: booking.startTime,
				disputeBy: props.email,
				disputeAgainst: email,
				disputeMessage: disputeMessage,
				disputeImages: base64Files
			};
			const response = await fetch('/createDispute', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'token': props.token,
					'email': props.email
				},
				body: JSON.stringify(dataSend),
			});
			const data = await response.json();
			if (data.error) {
				console.error('An error occurred during fetch:', data.error);
			} else {
				alert('Dispute successfully created');
				navigate('/');
			}
		} catch (error) {
			console.error('An error occurred:', error);
		}
	};

	return (
		<Box sx={{ p: 3 }}>
			<Typography variant="h4" gutterBottom>
				Submit a Dispute
			</Typography>
			<TextField
				label="Dispute Message"
				multiline
				rows={14}
				fullWidth
				variant="outlined"
				value={disputeMessage}
				onChange={(e) => setDisputeMessage(e.target.value)}
				sx={{ mb: 2 }}
			/>
			<input
				type="file"
				multiple
				onChange={handleFileSelect}
			/>
			<Button
				variant="contained"
				onClick={handleDisputeSubmit}
			>
				Submit Dispute
			</Button>
		</Box>
	);
};

export default DisputePage;
