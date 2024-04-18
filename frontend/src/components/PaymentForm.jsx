import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Paper, Button, createTheme } from '@mui/material';
import { ThemeProvider } from "@emotion/react";


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

// the whole component is from https://docs.stripe.com/payments/save-and-reuse?platform=web&ui=elements
// since i am using the api service so the below code of handling the form is directly provided by the api
// and i can't modify it except the mui and css stuffs i added
function PaymentForm() {
	const elements = useElements();
	const stripe = useStripe();
	const handleSubmit = async (event) => {
		event.preventDefault();

		if (!stripe || !elements) {
			return null;
		}

		const { error } = await stripe.confirmSetup({
			// clientSecret:props.clientSecret,
			elements,
			confirmParams: {
				"return_url": 'https://localhost:3000/paymentAddedSuccess'
			},
		});

		if (error) {
			alert(error.message);
		} else {
		}
	};

	return (
		<ThemeProvider theme={theme} >

			<div
				style={{
					"backgroundSize": "cover",
					height: "70vh",
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

					<div>
						<form onSubmit={handleSubmit}>
							<PaymentElement />
							<Button variant="contained" color="green" type="submit">Submit</Button>
						</form>

					</div>
				</Paper>
			</div>
		</ThemeProvider>

	)
}
export default PaymentForm;