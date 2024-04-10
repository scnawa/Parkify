import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardActions, Button, Modal, CardMedia, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function AdminDisputes(props) {
  const [disputes, setDisputes] = useState([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('getDisputes', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'email': props.token,
          },
        });
        const data = await response.json();
        setDisputes(data);
      } catch (error) {
        console.error('An error occurred during data fetching:', error);
      }
    };
    fetchData();
  }, [props.token]);

  const handleResolveDispute = async (disputeId) => {
    console.log(`Resolving dispute with ID: ${disputeId}`);//todo
  };

  const handleViewDetails = (dispute) => {
    setSelectedDispute(dispute);
    setDetailModalOpen(true);
  };

  const handleClose = () => setDetailModalOpen(false);

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
      <Grid container spacing={2}>
        {disputes.map((dispute) => (
          <Grid item xs={12} md={6} lg={4} key={dispute.dispute_id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{dispute.address}</Typography>
                <Typography variant="body1">Date: {dispute.date}</Typography>
                <Typography variant="body2">Dispute By: {dispute.dispute_by}</Typography>
              <Typography variant="body2">Dispute Against: {dispute.dispute_against}</Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => handleViewDetails(dispute)}>View Details</Button>
                <Button size="small" color="primary" onClick={() => handleResolveDispute(dispute.dispute_id)}>
                  Mark as Resolved
                </Button>
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
              <Typography variant="body2">Start Time: {selectedDispute.start_time}</Typography>
              <Typography variant="body2">End Price: {selectedDispute.end_price}</Typography>
              <Typography variant="body2">Total Time: {formatTime(selectedDispute.total_time)}</Typography>
              <Typography variant="body2">Dispute By: {selectedDispute.dispute_by}</Typography>
              <Typography variant="body2">Dispute Against: {selectedDispute.dispute_against}</Typography>
              <Typography variant="body2">Message: {selectedDispute.dispute_message}</Typography>
              {selectedDispute.dispute_image && selectedDispute.dispute_image.map((image, index) => (
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
