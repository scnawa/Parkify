import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";

// the whole component is from https://docs.stripe.com/payments/save-and-reuse?platform=web&ui=elements
// since i am using the api service so the below code of handling the form is directly provided by the api
// and i can't modify it
function PaymentForm(props) {
    const elements = useElements();
    const stripe = useStripe();
    const [errorMessage, setErrorMessage] = useState(null);
    const handleSubmit = async (event) => {
        event.preventDefault();
    
        if (!stripe || !elements) {
          return null;
        }
    
        const {error} = await stripe.confirmSetup({
          elements,
          confirmParams: {
            return_url: 'https://localhost:3000/paymentAddedSuccess'
          },
        });
    
        if (error) {
          setErrorMessage(error.message);
        } else {
        }
      };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <PaymentElement />
                <button>Submit</button>
            </form>

        </div>

    )
}
export default PaymentForm;