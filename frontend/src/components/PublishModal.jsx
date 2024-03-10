import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, DateObject } from "react-multi-date-picker"
import { Box, Button, Modal, createTheme } from '@mui/material';
import "react-multi-date-picker/styles/colors/green.css"
import { ThemeProvider } from '@emotion/react';


const theme = createTheme({
    palette: {
      primary: {
        main: '#4caf50', // Green primary colour
        contrastText:'#ffffff',

      },
        contrastText:'#ffffff',
    },
});
// modal style is from https://mui.com/material-ui/react-modal/
const style = {
    minWidth: '320',
    position: 'absolute',

    bgcolor: 'background.paper',
    transform: 'translate(-50%, -50%)',

    left: '50%',
    display:'flex',
    border: '2px solid #000',

    flexDirection: 'column',
    top: '50%',

};

function PublishModal(props) {
    console.log(props);

    const [dateRange, setDateRange] = useState([
        new DateObject(props.listings.startDate),
        new DateObject(props.listings.endDate)
    ]);
    const [activated, isActivated] = useState(props.listings.isActive);
    const popoverLocation = props.popoverLocation;
    const  setPopOverLocation = props.setPopOverLocation;
    // TODO: useEffect fetch listing status
    console.log(props);
    const popoverOnClick = (event) => {
        setPopOverLocation(true);
    };
    // TODO: send request to backend and send notification
    const publishOnClick = (event) => {
        setPopOverLocation(false);

    }
    // TODO: send request to backend and send notification
    const deactivateOnClick = (event) => {
        setPopOverLocation(false);
    }
    const popoverOnClose = () => {
        setPopOverLocation(false);
    };
    
    return (<>
        <ThemeProvider theme={theme}>

        <Modal
            open={popoverLocation}
            onClose={popoverOnClose}
        >
            <Box sx={{ ...style,  }}>

            <Calendar
              className="green"

                value={dateRange}
                onChange={setDateRange}
                range
            />

                {activated && 
                    <Button variant="contained" onClick={publishOnClick} >
                    Publish
                    </Button>
                }
                {!activated && 
                    <Button variant="contained" onClick={deactivateOnClick} sx={{ mt:0.2 }}>
                        Deactivate
                    </Button>
                }
                
                <Button  variant="contained" onClick={popoverOnClose} sx={{ mt:0.2 }}>
                    Cancel
                </Button>
            </Box>

        </Modal>
        </ThemeProvider>

    </>)
      
}
export default PublishModal;