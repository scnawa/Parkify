import { Box, Button, ListItemText, ThemeProvider, createTheme } from "@mui/material";
import { useState } from "react";
const theme = createTheme({
	palette: {
		green: {
			main: '#4caf50',
			light: '#E0F2F1',
			dark: '#004D40',
			contrastText: '#CDDC39',
			red: '#AF4F4c'
		},
	},
});

// the component to show a credit card
function creditCard(card, isDefault) {
	return (
		<>
			{isDefault &&
				<ListItemText primary={`${card.card.brand} (default)`} secondary={`xxxx-xxxx-xxxx-${card.card.last4}`} />
			}

			{!isDefault &&
				<ListItemText primary={`${card.card.brand}`} secondary={`xxxx-xxxx-xxxx-${card.card.last4}`} />

			}
		</>
	);

}

// the component to show a debit card
function debitCard(card, isDefault) {
	return (
		<>
			{isDefault &&

				<ListItemText primary={`${card.type} (default)`} secondary={`xxxx-xxxx-xxxx-${card['au_becs_debit'].last4}`} />

			}
			{!isDefault &&
				<ListItemText primary={`${card.type}`} secondary={`xxxx-xxxx-xxxx-${card['au_becs_debit'].last4}`} />

			}
		</>
	);
}
// The component show a added payment of user and let user set it as default or remove it 
function CustomerCard(props) {
	// eslint-disable-next-line
	const [card, _] = useState(props.card);
	let cardInfo = null;
	let isDefault = props.defaultCard === card.id;
	// render different component based on the type of payment method 
	switch (card.type) {
		case "au_becs_debit":
			cardInfo = debitCard(card, isDefault);
			break
		case "card":
			cardInfo = creditCard(card, isDefault);
			break
		default:
			break;

	}
	const fetchSetDefault = async () => {
		try {
			const response = await fetch('http://localhost:8080/setDefaultCard', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'token': props.token,
				},
				body: JSON.stringify({
					'defaultCard': card.id,
				}),
			});


			const data = await response.json();
			if (data.error) {
				return Promise.reject(data.error);
			} else {
				return Promise.resolve(data);
			}
		} catch (error) {
			return Promise.reject(error);
		};
	};
	const fetchRemove = async () => {
		try {
			const response = await fetch('http://localhost:8080/removeCard', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'token': props.token,
				},
				body: JSON.stringify({
					'cardId': card.id,
				}),
			});


			const data = await response.json();
			if (data.error) {
				return Promise.reject(data.error);
			} else {
				return Promise.resolve(data);
			}
		} catch (error) {
			return Promise.reject(error);
		};
	};
	const handleRemoveCard = () => {
		fetchRemove().then((data) => {
			console.log(data);
			props.setdefaultCard(data['defaultPayment']);
			props.setCards(data['cards']);
			return;
		}).catch(alert);
	}

	const handleSetDefault = () => {
		fetchSetDefault().then((data) => {
			console.log(data);
			props.setdefaultCard(data['defaultPayment']);
			return;
		}).catch(alert);
	}
	return (
		<ThemeProvider theme={theme} >

			{cardInfo}

			<Box display='flex' sx={{ width: '100%', "justifyContent": "end" }}>
				<div>
					<Box sx={{ display: 'flex', flexDirection: "column", justifyContent: "space-between", rowGap: 0.4 }}>

						{!isDefault &&
							<Button size="small" sx={{ backgroundColor: 'green.main', color: 'green.light' }} onClick={handleSetDefault}>Set Default</Button>

						}
						<Button size="small" sx={{ backgroundColor: 'green.red', color: 'green.light' }} onClick={handleRemoveCard}>Remove</Button>
					</Box>
				</div>

			</Box>
		</ThemeProvider>
	);
}
export default CustomerCard