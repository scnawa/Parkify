import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import './ListingPage.css'

function ListingPage(props) {
    const navigate = useNavigate(); 
    const { listing_id } = useParams();
    const [listing, setListing] = useState(null);
    const [error, setError] = useState(null);
    console.log(listing_id);
    useEffect(() => {
/*         const abortController = new AbortController();
        const signal = abortController.signal; */

        const fetchListing = async () => {
            try {
                const response = await fetch('/getSpecificListing', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'email': props.token,
                        'listingId': listing_id
                    },
                    /* signal: signal */
                });
                const data = await response.json();
                if (data.error) {
                    setError(data.error);
                    console.log(error)
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
       /*  return () => {
            abortController.abort();
        }; */
    }, [listing_id]);
    
    const handleBookNow = async () => {
        console.log("booking")
        try {
            const response = await fetch('/hold_listing', {
                method: 'POST',
            });

            if (response.ok) {
                navigate('/book');
                console.log("booked")
            } else {
                alert("Failed to book")
                console.error('Failed to hold listing');
            }
        } catch (error) {
            console.error('API call failed:', error);
        }
    };


    return (
        <div>
            {error && <div>Error: {error}</div>}
            {listing ? (
                <div className="page-container">    
                    <div className="page">
                        <div className="left-box">
                            <h2>{listing.address}</h2>
                            <img src="" alt="Parking space"></img>
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
                                    <button onClick={handleBookNow}>Book Now</button>
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