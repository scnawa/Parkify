import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import CreateListings from './components/CreateListings';
import NavBar from './components/NavBar';
import Login from './components/Login';
import Signup from './components/Signup';
import AdminDisputes from './components/AdminDisputes';

import ProfilePage from './components/ProfilePage';
import Verify from './components/Verify';

import MyListings from './components/MyListings';
import EditListings from './components/EditListings';
import AllListings from './components/AllListings';
import ListingPage from './components/ListingPage';
import Booking from './components/Booking';
import TimerPage from './components/TimerPage';
import ParkEnd from './components/ParkEnd';
import Payment from './components/Payment';
import PaymentAddedSuccess from './components/PaymentAddedSuccess';
import ProviderDetailsExpried from './components/ProviderDetailsExpried';
import ProviderDetailsReturn from './components/ProviderDetailsReturn';
import ManagePayment from './components/ManagePayment';
import History from './components/History';
import AdminViewListings from './components/AdminViewListings';
import CustomerHistory from './components/CustomerHistory';
import DisputePage from './components/DisputePage'

const PageList = (props) => {

	const [token, setToken] = React.useState(localStorage.getItem('token'));
	const [email, setEmail] = React.useState(localStorage.getItem('email'));
	const [listings, setListings] = useState([]);
	const [totalPage, setTotalPage] = useState(1);
	const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin'))

	React.useEffect(() => {
		if (token) {
			const fetchData = async () => {
				try {
					const response = await fetch('http://localhost:8080/checkAdmin', {
						method: 'GET',
						headers: {
							'token': token,
							'Content-Type': 'application/json',
						},
					});
					const data = await response.json();
					setIsAdmin(data.isAdmin)
					localStorage.setItem('isAdmin', data.isAdmin);
					//set local storage for admin
				} catch (error) {
					console.error('An error occurred during data fetching:', error);
				}
			};
			fetchData();
		}
	}, [token]);

	return (
		<>
			<NavBar token={token} setToken={setToken} setListings={setListings}
				isAdmin={isAdmin} setIsAdmin={setIsAdmin} email={email} setEmail={setEmail} setTotalPage={setTotalPage} />
			<Routes>
				<Route path="/" element={<AllListings isAdmin={isAdmin} token={token} listings={listings} email={email} totalPage={totalPage} />} />
				<Route path="/create-listings" element={<CreateListings token={token} isAdmin={isAdmin} email={email} />} />
				<Route path="/myListing" element={<MyListings token={token} email={email} />} />
				<Route path="/editListings" element={<EditListings isAdmin={isAdmin} />} />
				<Route path="/alllistings" element={<AllListings isAdmin={isAdmin} token={token} listings={listings} email={email} totalPage={totalPage} />} />
				<Route path="/listing/:listingId" element={<ListingPage isAdmin={isAdmin} token={token} email={email} />} />
				<Route path="/book" element={<Booking token={token} />} />
				<Route path="/timer" element={<TimerPage token={token} />} />
				<Route path="/park-end" element={<ParkEnd token={token} />} />
				<Route path="/history" element={<History token={token} email={email} />} />
				<Route path="/customerHistory" element={<CustomerHistory token={token} email={email} />} />
				<Route path="/login" element={<Login token={token} setToken={setToken} setEmail={setEmail} />} />
				<Route path="/signup" element={<Signup />} />
				<Route path="/adminDisputes" element={<AdminDisputes token={token} />} />
				<Route path="/paymentAddedSuccess" element={<PaymentAddedSuccess />} />
				<Route path="/providerDetailsExpired" element={<ProviderDetailsExpried />} />
				<Route path="/providerDetailsReturn" element={<ProviderDetailsReturn />} />
				<Route path="/managePayment" element={<ManagePayment token={token} />} />
				<Route path="/profilepage" element={<ProfilePage token={token} setToken={setToken} setEmail={setEmail} setIsAdmin={setIsAdmin} email={email} />} />
				<Route path="/verify" element={<Verify token={token} setToken={setToken} setEmail={setEmail} email={email} />} />
				<Route path="/payment" element={<Payment token={token} stripe={props.stripe} setToken={setToken} />} />
				<Route path="/adminViewListings" element={<AdminViewListings token={token} isAdmin={isAdmin} />} />
				<Route path="/disputePage" element={<DisputePage token={token} email={email} />} />

			</Routes>
		</>
	);
}

export default PageList;
