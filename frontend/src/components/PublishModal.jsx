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

    const [dateRange, setDateRange] = useState(
        (props.listings.startDate !== "" && props.listings.endDate !== "") ?
        [
            new Date(props.listings.start_date),
            new Date(props.listings.end_date)
        ]
            :
        [   new DateObject(),
            new DateObject()
        ]
    );
    const [activated, isActivated] = useState(props.listings.is_active === "True");
    const popoverLocation = props.popoverLocation;
    const  setPopOverLocation = props.setPopOverLocation;
    console.log(activated, dateRange);
    const fetchPublish = async() => {
        try {
            const data = {
                listings: {
                    "listing_id": props.listings.listing_id,
                    "listing_no": props.listings.listing_no,
                    "start_date": dateRange[0],
                    "end_date": dateRange[1],

                }
            }
          const response = await fetch('http://localhost:8080/activate_listing', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'email': props.token,
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
    
    const popoverOnClick = (event) => {
        setPopOverLocation(true);
    };
    // TODO: send request to backend and send notification
    const publishOnClick = (event) => {
        fetchPublish().then(() => {
            isActivated(true);
            alert("listing is now published");
        }).catch(alert);
        setPopOverLocation(false);
    }
    // TODO: send request to backend and send notification
    const deactivateOnClick = (event) => {
        const fetchPublish = async() => {
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
                  'email': props.token,
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
            isActivated(false);
            setDateRange([new DateObject(),
                new DateObject()
            ]);
            alert("listing is now deactivated");
        }).catch(alert);
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
              readOnly={activated}
                value={dateRange}
                onChange={setDateRange}
                range
            />

                {!activated && 
                    <Button variant="contained" onClick={publishOnClick} >
                        Publish
                    </Button>
                }
                {activated && 
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