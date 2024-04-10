import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, List, ListItem, Button, Divider } from '@mui/material';

function AdminDisputes(props) {
  const navigate = useNavigate();
  
  const goToUserDisputes = () => {
    console.log("Go to User Disputes");
  };

  const goToUserSupport = () => {
    console.log("Go to User Support");
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Admin Dashboard (this page is a placeholder for now, maybe we should get rid of it or change it.
        whatever you think is best design wise.)
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 1 }}>
          User Disputes
        </Typography>
        <List>
          <ListItem>
            Dispute 1 - Joe v 5 High St UNSW
            <Button onClick={() => { console.log("Navigate to Dispute 1 details"); }}>View Details</Button>
          </ListItem>
          <Divider component="li" />
          <ListItem>
            Dispute 2 - Bob v 23 Parliament Rd
            <Button onClick={() => { console.log("Navigate to Dispute 2 details"); }}>View Details</Button>
          </ListItem>
        </List>
        <Button variant="contained" color="primary" onClick={goToUserDisputes}>
          View All Disputes
        </Button>
      </Box>
      
      <Box>
        <Typography variant="h5" sx={{ mb: 1 }}>
          User Support
        </Typography>
        <List>
          <ListItem>
            Support Ticket 1 - aditya
            <Button onClick={() => { console.log("Navigate to Support Ticket 1 details"); }}>View Details</Button>
          </ListItem>
          <Divider component="li" />
          <ListItem>
            Support Ticket 2 - Joe
            <Button onClick={() => { console.log("Navigate to Support Ticket 2 details"); }}>View Details</Button>
          </ListItem>
        </List>
        <Button variant="contained" color="primary" onClick={goToUserSupport}>
          LOOL
        </Button>
      </Box>
    </Box>
  );
}

export default AdminDisputes;
