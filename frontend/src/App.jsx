
import React from 'react';
import './App.css';

import { BrowserRouter as Router } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';

import PageList from './PageList';
const stripe = loadStripe('pk_test_51OxR4GBZWJO5ZDijSlsErT4b9LfVNRyaeuQM2mOJWkTRwg00Qqf5KqyvA0Gte7e4g1yFFkssc398hBMab5XciqCw00rsfMd7mK');

const App = () => {
	return (
		<>
			<Router>
				<PageList stripe={stripe} />
			</Router>
		</>
	);
}

export default App;
