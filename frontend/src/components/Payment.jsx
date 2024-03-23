import {Elements, PaymentElement} from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import React from 'react';

// code and api usage provided by https://docs.stripe.com/payments/accept-a-payment?platform=web&ui=elements
function Payment(props) {
    // const navigate = useNavigate();

    // React.useEffect(() => {
	// 	if (!props.token) {
	// 		navigate('/login');
	// 		return
	// 	}
	// }, [props.token]);
    const options = {
        clientSecret: 'pi_3OxSbiBZWJO5ZDij0W3dg4SE_secret_CeESIt47Q5dBJZKCcJWtS4lHN',
        appearance: {  theme: 'stripe'
    },
    };    
    return (
        <Elements stripe={props.stripe} options={options}>
            <form>
            <PaymentElement />
            <button>Submit</button>
            </form>
        </Elements>
      );
    }
export default Payment;