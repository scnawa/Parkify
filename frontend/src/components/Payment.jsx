import { Elements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import PaymentForm from './PaymentForm';

// code and api usage provided by https://docs.stripe.com/payments/accept-a-payment?platform=web&ui=elements
function Payment(props) {
    const navigate = useNavigate();
    const [clientSecret, setClientSecret] = useState("");

    React.useEffect(() => {
        if (!props.token) {
            navigate('/login');
            return
        }
        // clientSecret is used by stripe to handle the request
        // since the payment details is sent directly to stripe
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
        // clientSecret is used by stripe to handle the request
        // since the payment details is sent directly to stripe
        fetchClinetSecret().then((data) => {
            setClientSecret(data["clientSecret"]);
        }).catch(alert);
        // eslint-disable-next-line
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