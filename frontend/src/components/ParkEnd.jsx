import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FileInputField from './FileInputField';

// the general purpose file image processing function is from comp6080 assignment 4
const uploadFile = (file) => {
	let targetFile;
	if (file.length === 0) {
		return Promise.resolve('');
	} else {
		targetFile = file[0];
	}
	const expectedType = ['image/jpeg', 'image/png', 'image/jpg']
	const valid = expectedType.find(type => type === targetFile.type);
	if (!valid) {
		return new Promise(resolve => resolve(targetFile));
	}
	const reader = new FileReader();
	const dataPromise = new Promise((resolve, reject) => {
		reader.onerror = reject;
		reader.onload = () => resolve(reader.result);
	});
	reader.readAsDataURL(targetFile);
	return dataPromise;
}

function ParkEnd() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [feedback, setFeedback] = useState('');
    const [promo, setPromo] = useState('')

    const [thumbnail, setThumbnail] = useState([]);
	const [image, setImages] = useState([]);
    const location = useLocation();

    const timer = location.state ? location.state.timer : 0;
    const navigate = useNavigate(); 
    const { listing_id, ListingNo} = location.state || {};

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
            fetchEndBooking().then(()=> {
                alert("booking is ended");
                navigate('/');
            }).catch(alert);
        })




    }
    // Event handler to update the feedback state
    const handleFeedbackChange = (event) => {
        setFeedback(event.target.value);
    };

    const handlePromoChange = (event) => {
        setPromo(event.target.value);
    };

    return (
        <div>
            <h1>Parking has Ended</h1>
            <p>Thank you for using our parking service!</p>
            <p>Enter any feedback:</p>
                <textarea value={feedback} onChange={handleFeedbackChange}></textarea>
            <p>Upload empty spot</p>
            <FileInputField multiple={false} setImage={setThumbnail} content="Upload Thumbnail" />
            <p>Enter Promo Code<input type="text" value={promo} onChange={handlePromoChange}></input></p>
            <p>Duration: {formatTime(timer)}</p>
            <button onClick={handlePayment}>Pay</button>
        </div>
    );
}

export default ParkEnd;