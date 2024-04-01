import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import './ListingPage.css'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

function ListingPage() {
    const { listing_id } = useParams();
    const [listing, setListing] = useState(null);
    const [error, setError] = useState(null);

    const [start, setStart] = useState(null);
	const [end, setEnd] = useState(null);

    const hardcodedListing = {
        _id: "65feacafb942b065c2e9f8a5",
        listing_id: "c9ab808c0a8848239d545096b0a5ec4a",
        listing_no: 0,
        address: "88 Christie Street",
        price: 20,
        quantity: 1,
        details: "Very good parking space",
        restrictions: "no pets",
        image_url: ""
    };
    console.log(start, end);
    /* useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchListing = async () => {
            try {
                const response = await fetch('getListingByID/c9ab808c0a8848239d545096b0a5ec4a', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    signal: signal
                });
                const data = await response.json();
                if (data.error) {
                    setError(data.error);
                } else {
                    setListing(data);
                    console.log(data);
                }
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.log('Request aborted');
                } else {
                    console.error(error);
                    setError("Failed to fetch listing data");
                }
            }
        };

        fetchListing();

        // Cleanup function to abort fetch on component unmount
        return () => {
            abortController.abort();
        };
    }, [listing_id]);
    */
    useEffect(() => {
        // Simulate fetch with hardcoded data
        setListing(hardcodedListing);
    }, []);
    
    const handleStartDateChange = (date) => {
        setStart(date);
    };

    const handleEndDateChange = (date) => {
        setEnd(date);
    };


    return (
        <div>
            {error && <div>Error: {error}</div>}
            {listing ? (
                <div className="page-container">    
                    <div className="page">
                        <div className="left-box">
                            <h2>{listing.address}</h2>
                            <img src="data:image/jpeg;base64,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" alt="Parking space"></img>
                            <div className="details-box">
                                <h4>Description:</h4>
                                <p>{listing.details}</p>
                            </div>
                            <div className="restrictions-box">
                                <h4>Restrictions:</h4>
                                <p>{listing.restrictions}</p>
                            </div>
                        </div>
                        <div className="right-box">
                            <div className="price-box">
                                <div className="top-price-box"><h3>Price: ${listing.price}.00/hr</h3></div>
                                <div>Availability:</div>
                            </div>
                                <div className="booking-box">
                                    <div className="title-box">
                                        <div className="start-box">Start Date:</div>
                                        <div className="end-box">End Date:</div>
                                    </div>
                                    <div className="date-box">
                                        <div>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker value={start} onChange={handleStartDateChange} />
                                            </LocalizationProvider>
                                        </div>
                                        <div>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker value={end} onChange={handleEndDateChange} />
                                            </LocalizationProvider>
                                        </div>
                                    </div>
                                    <button>Book Now</button> {/**button to head to payhment page */}
                                </div>
                        </div>
                    </div>
                </div>    
            ) : (
                <div>Loading...</div>
            )}
        </div>
    );
}

export default ListingPage;