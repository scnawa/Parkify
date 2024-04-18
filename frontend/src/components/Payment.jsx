import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import PaymentForm from './PaymentForm';

// code and api usage provided by https://docs.stripe.com/payments/accept-a-payment?platform=web&ui=elements
function Payment(props) {
    const navigate = useNavigate();
    const [clientSecret, setClientSecret] = useState("");
    const [errorMessage, setErrorMessage] = useState(null);

    React.useEffect(() => {
        if (!props.token) {
            navigate('/login');
            return
        }
        const fetchClinetSecret = async () => {
            try {
                const response = await fetch('http://localhost:8080/addPaymentMethod', {
                    method: 'POST',
                    headers: {
                        'token': props.token,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({}),
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
        }
        fetchClinetSecret().then((data) => {
            setClientSecret(data["clientSecret"]);
        }).catch(alert);
    }, []);
    const options = {
        clientSecret: clientSecret,
        appearance: {
            theme: 'stripe'
        },
    };
    return (
        <div>
            {clientSecret && (

                <Elements stripe={props.stripe} options={options}>
                    <PaymentForm clientSecret={clientSecret} />
                </Elements>
            )}
        </div>
    );
}
export default Payment;