import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, List, ListItem, Button, Divider } from '@mui/material';

function AdminDashboard(props) {
  const navigate = useNavigate();
  
  // Placeholder function to navigate to the user disputes page (you would need to implement this page)
  const goToUserDisputes = () => {
    // navigate('/user-disputes');
    console.log("Go to User Disputes");
  };

  // Placeholder function to navigate to the user support page (you would need to implement this page)
  const goToUserSupport = () => {
    // navigate('/user-support');
    console.log("Go to User Support");
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Admin Dashboard
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      {/* User Disputes Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 1 }}>
          User Disputes
        </Typography>
        {/* Placeholder list for disputes */}
        <List>
          {/* Map through disputes here, using a ListItem for each dispute */}
          <ListItem>
            Dispute 1 - Joe v 5 High St UNSW
            {/* This button would take you to the dispute details page */}
            <Button onClick={() => { console.log("Navigate to Dispute 1 details"); }}>View Details</Button>
          </ListItem>
          <Divider component="li" />
          <ListItem>
            Dispute 2 - Bob v 23 Parliament Rd
            <Button onClick={() => { console.log("Navigate to Dispute 2 details"); }}>View Details</Button>
          </ListItem>
          {/* ... add more disputes as needed */}
        </List>
        <Button variant="contained" color="primary" onClick={goToUserDisputes}>
          View All Disputes
        </Button>
      </Box>
      
      {/* User Support Section */}
      <Box>
        <Typography variant="h5" sx={{ mb: 1 }}>
          User Support
        </Typography>
        {/* Placeholder list for support tickets */}
        <List>
          {/* Map through support tickets here, using a ListItem for each ticket */}
          <ListItem>
            Support Ticket 1 - Bob
            <Button onClick={() => { console.log("Navigate to Support Ticket 1 details"); }}>View Details</Button>
          </ListItem>
          <Divider component="li" />
          <ListItem>
            Support Ticket 2 - Joe
            <Button onClick={() => { console.log("Navigate to Support Ticket 2 details"); }}>View Details</Button>
          </ListItem>
          {/* ... add more tickets as needed */}
        </List>
        <Button variant="contained" color="primary" onClick={goToUserSupport}>
          View All Support Tickets
        </Button>
      </Box>
    </Box>
  );
}

export default AdminDashboard;
