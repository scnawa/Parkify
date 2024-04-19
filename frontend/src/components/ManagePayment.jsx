import { useNavigate } from 'react-router-dom';
import React from 'react';
import { Box, Button, Divider, List, ListItem, ThemeProvider, Typography, createTheme } from '@mui/material';
import CustomerCard from './CustomerCard';

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
// The page to show all the customer payment method and perform related operations on them
function ManagePayment(props) {
	// eslint-disable-next-line
	const [token, setToken] = React.useState(localStorage.getItem('token'));
	const [defaultCard, setdefaultCard] = React.useState("");
	const [cards, setCards] = React.useState([]);
	const navigate = useNavigate();

	React.useEffect(() => {
		if (!token) {
			navigate('/login');
			return
		}
		const fetchCards = async () => {
			try {
				const response = await fetch('http://localhost:8080/allCardList', {
					method: 'Get',
					headers: {
						'Content-Type': 'application/json',
						'token': token,
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
		fetchCards().then((data) => {
			setCards(data.payments);
			setdefaultCard(data.defaultPayment);
		}).catch(console.log);
		// eslint-disable-next-line
	}, [])
	const handleAddOnClick = () => {
		navigate('/payment');
		return;
	}
	console.log(cards);
	return (
		<ThemeProvider theme={theme}>
			<Box display='flex' flexDirection="column" sx={{ justifyContent: "space-between", margin: 2 }}>
				<Box display='flex' justifyContent="space-between" alignItems="center" mb={4}>
					<Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
						Manage Your Payment Method
					</Typography>
					<Button size="large" sx={{ backgroundColor: 'green.main', color: 'green.light' }} onClick={handleAddOnClick}>
						Add New Payment Method
					</Button>
				</Box>
				<List sx={{
					width: '100%', bgcolor: 'background.paper', borderRadius: 1.5,
					border: '1px solid',
					borderColor: 'divider',
				}}>
					{cards.map((card, index) => (
						<>
							<ListItem key={card.id + defaultCard} sx={{
								my: 0.5,
							}}>
								<CustomerCard key={card.id + defaultCard} token={token} card={card} setdefaultCard={setdefaultCard} defaultCard={defaultCard} cards={cards} setCards={setCards} />
							</ListItem>
							<Divider component="li" />
						</>


					))}
				</List>
			</Box>
		</ThemeProvider>
	);
}

export default ManagePayment;