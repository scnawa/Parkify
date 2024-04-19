import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardActions, Button, Modal, CardMedia, IconButton, FormControl, InputLabel, Select, MenuItem, Chip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
// The page for admin to handle disputes
function AdminDisputes(props) {
	const [disputes, setDisputes] = useState([]);
	const [filteredDisputes, setFilteredDisputes] = useState([]);
	const [detailModalOpen, setDetailModalOpen] = useState(false);
	const [selectedDispute, setSelectedDispute] = useState(null);
	const [filter, setFilter] = useState('default');

	useEffect(() => {
		fetchData();
		// eslint-disable-next-line
	}, [props.token]);
	// To handle the dispute filter change to show only resolved/unresolved disputes
	useEffect(() => {
		let filtered = [...disputes];
		if (filter === 'unresolved') {
			filtered = filtered.filter(dispute => !dispute.resolved);
		} else if (filter === 'resolved') {
			filtered = filtered.filter(dispute => dispute.resolved);
		}
		filtered.sort((a, b) => a.resolved - b.resolved);
		setFilteredDisputes(filtered);
		// eslint-disable-next-line
	}, [disputes, filter]);
	// fetch the disputes from backend
	const fetchData = async () => {
		try {
			const response = await fetch('getDisputes', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'token': props.token,
				},
			});
			const data = await response.json();
			if (data.error) {
				console.error('An error occurred during fetch:', data.error);
			} else {
				setDisputes(data);
				setFilteredDisputes(data);
			}
		} catch (error) {
			console.error('An error occurred during data fetching:', error);
		}
	};

	const handleResolveDispute = async (disputeId) => {
		console.log(`Resolving dispute with ID: ${disputeId}`);
		try {
			const response = await fetch('resolveDispute', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'token': props.token,
				},
				body: JSON.stringify({ disputeId: disputeId }),
			});
			const data = await response.json();
			if (data.error) {
				console.error('An error occurred during fetch:', data.error);
			} else {
				fetchData();
			}
		} catch (error) {
			console.error('An error occurred during data fetching:', error);
		}
	};

	const handleViewDetails = (dispute) => {
		setSelectedDispute(dispute);
		setDetailModalOpen(true);
	};

	const handleClose = () => setDetailModalOpen(false);

	const handleChangeFilter = (event) => {
		setFilter(event.target.value);
	};
	// format the time of booking from milli sec to readible format
	const formatTime = (totalSeconds) => {
		const hours = Math.ceil(totalSeconds / 3600);
		return `${hours} hr${hours > 1 ? 's' : ''}`;
	};

	const modalStyle = {
		position: 'absolute',
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		width: '100%',
		maxWidth: {
			xs: '55%',
			sm: 400,
			md: 400,
		},
		height: '100%',
		maxHeight: '90vh',
		overflowY: 'auto',
		bgcolor: 'background.paper',
		boxShadow: 24,
		p: 2,
		outline: 'none',
	};

	return (
		<Box sx={{ margin: 2 }}>
			<Typography variant="h4" gutterBottom>Disputes Review</Typography>
			<FormControl fullWidth margin="normal" sx={{ width: '150px' }}>
				<InputLabel>Filter Disputes</InputLabel>
				<Select value={filter} label="Filter Disputes" onChange={handleChangeFilter}>
					<MenuItem value="default">All</MenuItem>
					<MenuItem value="unresolved">Unresolved</MenuItem>
					<MenuItem value="resolved">Resolved</MenuItem>
				</Select>
			</FormControl>
			<Grid container spacing={2}>
				{filteredDisputes.map((dispute) => (
					<Grid item xs={12} md={6} lg={4} key={dispute.disputeId}>
						<Card sx={{ bgcolor: dispute.resolved ? 'action.disabledBackground' : 'action.disabledBackground' }}>
							<CardContent>
								<Typography variant="h6">{dispute.address}</Typography>
								<Typography variant="body1">Date: {dispute.date}</Typography>
								<Typography variant="body2">Dispute By: {dispute.disputeBy}</Typography>
								<Typography variant="body2">Dispute Against: {dispute.disputeAgainst}</Typography>
								{dispute.resolved ? (
									<Chip icon={<CheckCircleIcon />} label="Resolved" color="success" size="small" sx={{ mt: 1 }} />
								) : <Chip icon={<ReportProblemIcon />} label="Unresolved" color="warning" size="small" sx={{ mt: 1 }} />}
							</CardContent>
							<CardActions>
								<Button size="small" onClick={() => handleViewDetails(dispute)}>View Details</Button>
								{!dispute.resolved && (
									<Button size="small" color="primary" onClick={() => handleResolveDispute(dispute.disputeId)}>
										Mark as Resolved
									</Button>
								)}
							</CardActions>
						</Card>
					</Grid>
				))}
			</Grid>

			<Modal
				open={detailModalOpen}
				onClose={handleClose}
				aria-labelledby="dispute-detail-title"
				aria-describedby="dispute-detail-description"
			>
				<Box sx={modalStyle}>
					<IconButton
						aria-label="close"
						onClick={handleClose}
						sx={{
							position: 'absolute',
							right: 8,
							top: 8,
							color: (theme) => theme.palette.grey[500],
						}}
					>
						<CloseIcon />
					</IconButton>
					{selectedDispute && (
						<>
							<Typography id="dispute-detail-title" variant="h6" component="h2" sx={{ mt: 2 }}>
								{selectedDispute.address}
							</Typography>
							<Typography variant="body1">Date: {selectedDispute.date}</Typography>
							<Typography variant="body2">Start Time: {selectedDispute.startTime}</Typography>
							<Typography variant="body2">End Price: {selectedDispute.endPrice}</Typography>
							<Typography variant="body2">Total Time: {formatTime(selectedDispute.totalTime)}</Typography>
							<Typography variant="body2">Dispute By: {selectedDispute.disputeBy}</Typography>
							<Typography variant="body2">Dispute Against: {selectedDispute.disputeAgainst}</Typography>
							<Typography variant="body2">Message: {selectedDispute.disputeMessage}</Typography>
							{selectedDispute.disputeImage && selectedDispute.disputeImage.map((image, index) => (
								<CardMedia
									component="img"
									image={image}
									alt={`Dispute Image ${index + 1}`}
									sx={{ width: '100', height: '100', maxWidth: '100%', my: 2, objectFit: 'cover' }}
									key={index}
								/>
							))}
						</>
					)}
				</Box>
			</Modal>
		</Box>
	);
}

export default AdminDisputes;
