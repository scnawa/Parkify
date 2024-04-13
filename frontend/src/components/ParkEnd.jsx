import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FileInputField from './FileInputField';
import { Paper, Button, createTheme } from '@mui/material';
import { ThemeProvider } from '@emotion/react';
import Typography from '@mui/material/Typography';
import TextInputField from './TextInputField';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';
import { uploadFile } from './CreateListings';
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

function ParkEnd() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [feedback, setFeedback] = useState('');
    const [promo, setPromo] = useState('')
    const thumbnailRef = React.useRef();
    const [thumbnailFile, setThumbnailFile] = React.useState('');


    const [thumbnail, setThumbnail] = useState('');
    const location = useLocation();

    const timer = location.state ? location.state.timer : 0;
    const navigate = useNavigate();
    const { listing_id, ListingNo } = location.state || {};

    React.useEffect(() => {
        if (!token) {
            navigate('/login');
            return
        }
    }, []);
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    // testing data
    // const data = {
    //     "listings": {
    //         "listing_no":1,
    //         'price':7,
    //         "listing_id":'5998000f7717462684933a534f806d6c',

    //     },
    //     "booking": {
    //         "listing_id":'5998000f7717462684933a534f806d6c',
    //         "total_time":2,
    //         "feedback": "good",
    //         "end_image_url": "example.png",
    //         "recentbooking_no":0,
    //     },
    // }
    const handlePayment = (e) => {
        e.preventDefault();
        uploadFile(thumbnail).then((url) => {
            const data = {
                "listingId": listing_id,
                "listingNo": ListingNo,
                "totalTime": timer,
                "feedback": feedback,
                "endImageUrl": url,
                "promoCode": promo
            }
            console.log(data);
            const fetchEndBooking = async () => {
                try {
                    const response = await fetch('http://localhost:8080/end_booking', {
                        method: 'POST',
                        headers: {
                            'email': token,
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
            fetchEndBooking().then(() => {
                alert("booking is ended");
                navigate('/');
            }).catch(alert);
        })




    }
    const handleThubnailChange = (e) => {
        setThumbnailFile(e.target.value);
        uploadFile(e.target.files[0]).then((url) => { setThumbnail(url); }).catch(alert);
    }
    const handleThumbnailDelete = () => {
        thumbnailRef.current = '';
        setThumbnail('');
        setThumbnailFile('');
    }

    // Event handler to update the feedback state
    const handleFeedbackChange = (event) => {
        setFeedback(event.target.value);
    };

    const handlePromoChange = (event) => {
        setPromo(event.target.value);
    };

    return (
        <ThemeProvider theme={theme} >

            <div
                style={{
                    "backgroundSize": "cover",
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
                    <form onSubmit={handlePayment}>

                        <div style={{ display: "flex", flexDirection: "column", rowGap: "30px", height: '100%', justifyContent: 'center', justifyItems: 'space-between' }}>

                            <Typography variant="h4" color={"green.dark"}>Parking has Ended</Typography>
                            <Typography variant="h5">Thank you for using our parking service!</Typography>
                            <div style={{ width: "90%", maxWidth: "500px" }}>
                                {/* <Typography variant="subtitle1">Enter any feedback:</Typography> */}

                                <TextInputField sx={{ width: "500px" }} setFunction={setFeedback} label="Enter any feedback:" value={feedback} multiline={true} required={false}></TextInputField>
                            </div>
                            <div style={{ width: "300px" }}>
                                <TextInputField setFunction={setPromo} value={promo} label="Enter Promo Code:"></TextInputField>

                            </div>

                            <div>

                                <FileInputField multiple={false} required={true} color="green" setImage={setThumbnail} onChange={handleThubnailChange} inputRef={thumbnailRef} content="Upload empty spot" images={thumbnailFile} />
                                {thumbnail ? (
                                    <>
                                        <ImageListItem>
                                            <img src={thumbnail} style={{ 'height': '200px', 'object-fit': 'cover' }} />

                                            <ImageListItemBar
                                                title="thumbnail"
                                                actionIcon={
                                                    <IconButton
                                                        sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                                                        aria-label={'button to remove thumbnail'}
                                                        onClick={handleThumbnailDelete}
                                                    >
                                                        <ClearIcon />
                                                    </IconButton>
                                                }
                                            />

                                        </ImageListItem>
                                    </>
                                ) : null}

                                <Typography variant="subtitle1" >Duration: {formatTime(timer)}</Typography>

                            </div>
                            <div>
                                <Button variant="contained" color="green" type="submit">Pay</Button>
                            </div>
                        </div>
                    </form>
                </Paper>
            </div>
        </ThemeProvider>

    );
}

export default ParkEnd;