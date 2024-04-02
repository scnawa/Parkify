import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import './ListingPage.css'

function ListingPage(props) {
    const navigate = useNavigate(); 
    const [token, setToken] = React.useState(localStorage.getItem('token'));

    const { listing_id } = useParams();
    const [listing, setListing] = useState(null);
    const [defaultPayment, setDefaultPayment] = useState(null);

    const [error, setError] = useState(null);
    console.log(props);
    useEffect(() => {
/*         const abortController = new AbortController();
        const signal = abortController.signal; */
        const fetchPayment = async () => {
			try {
				const response = await fetch('http://localhost:8080/getDefaultCard', {
					method: 'Get',
					headers: {
						'Content-Type': 'application/json',
						'email': token,
					},
				});


				const data = await response.json();
                if (data.error) {
                    return Promise.reject(data.error);
                } else {
                    return Promise.resolve(data);
                }
            } catch (error) {
                return Promise.reject(error);
            }
		};

        const fetchListing = async () => {
            try {
                const response = await fetch('/getSpecificListing', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
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
        if (token) {
            fetchPayment().then((data) => {
                setDefaultPayment(data['default_payment']);
                return;
            }).catch(console.log);
        }

        // Cleanup function to abort fetch on component unmount
       /*  return () => {
            abortController.abort();
        }; */
    }, [listing_id, defaultPayment]);
    const handleBookNow = async () => {
        if (!token) {
            navigate("/login");
            return;
        }
        if (!defaultPayment) {
            alert("Please provide customer's payment method before booking");
            return;
        }
        const ListingNo = listing.listing_no;
        // pass real data
        // const data = {
        //     "email": token,
        //     "listingId": listing_id,
        //     "listingNo": ListingNo
        // }
        const data = {
            // real data
        }
        try {
            const response = await fetch('/hold_listing', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }, 
                body: JSON.stringify(data),
            });

            if (response.ok) {
                navigate('/book', { state: { listing_id, ListingNo} });
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