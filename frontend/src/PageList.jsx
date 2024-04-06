import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import CreateListings from './components/CreateListings';
import NavBar from './components/NavBar';
import Login from './components/Login';
import Signup from './components/Signup';
import AdminDashboard from './components/AdminDashboard';

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
import TestPayment from './components/TestPayment';
import ManagePayment from './components/ManagePayment';
import History from './components/History';
import AdminViewListings from './components/AdminViewListings';

const PageList = (props) => {

  const [token, setToken] = React.useState(localStorage.getItem('token'));
  const [SID, setSID] = React.useState(localStorage.getItem('SID'));
  const [listings, setListings] = useState([]);
  const [listingDetails, setListingDetails] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false)

  React.useEffect(() => {
    if (token) {
      const fetchData = async () => {
        try {
          const response = await fetch('http://localhost:8080/checkAdmin', {
            method: 'GET',
            headers: {
                'email': token,
                'Content-Type': 'application/json',
            },
          });
          const data = await response.json();
          setIsAdmin(data.isAdmin)
          console.log(data)
        } catch (error) {
          console.error('An error occurred during data fetching:', error);
        }
      };
      fetchData();
    }
  }, [token]);
  

  const navigate = useNavigate();
  //console.log(token, localStorage.getItem('token'));
  return (
    <>
      <NavBar token={token} SID={SID} setToken={setToken} setSID={setSID} setListings={setListings} 
      isAdmin={isAdmin} setIsAdmin={setIsAdmin}/>
      <Routes>
        <Route path="/"element={<AllListings token={token} listings={listings}/>} />
        <Route path="/create-listings" element={<CreateListings token={token} isAdmin={isAdmin}/>} />
        <Route path="/myListing" element={<MyListings token={token}/>} />
        <Route path="/editListings" element={<EditListings isAdmin={isAdmin}/>} />
        <Route path="/alllistings" element={<AllListings token={token} listings={listings}/>} />
        <Route path="/listing/:listing_id" element={<ListingPage token={token} SID={SID} listingDetails={listingDetails}/>} />
        <Route path="/book" element={<Booking token={token} SID={SID} />}/>
        <Route path="/timer" element={<TimerPage token={token} SID={SID}/>}/>
        <Route path="/park-end" element={<ParkEnd token={token} SID={SID}/>}/>
        <Route path="/history" element={<History token={token} SID={SID}/>} />
        <Route path="/login" element={<Login  token={token} setToken={setToken} SID={SID} setSID={setSID}/>} />
        <Route path="/signup" element={<Signup  />} />
        <Route path="/admindashboard" element={<AdminDashboard  />} />
        <Route path="/paymentAddedSuccess" element={<PaymentAddedSuccess  />} />
        <Route path="/providerDetailsExpired" element={<ProviderDetailsExpried  />} />
        <Route path="/providerDetailsReturn" element={<ProviderDetailsReturn  />} />
        <Route path="/testPayment" element={<TestPayment/>} />
        <Route path="/managePayment" element={<ManagePayment/>} />
        <Route path="/profilepage" element={<ProfilePage token={token} setToken={setToken} SID={SID} setSID={setSID} setIsAdmin={setIsAdmin}/>}/>
        <Route path="/verify" element={<Verify token={token} setToken={setToken} SID={SID} setSID={setSID}/>} />
        <Route path="/payment" element={<Payment token={token} stripe={props.stripe} setToken={setToken} SID={SID} setSID={setSID}/>} />
        <Route path="/adminViewListings" element={<AdminViewListings token={token} isAdmin={isAdmin}/>} />

      </Routes>
    </>
  );
}

export default PageList;
