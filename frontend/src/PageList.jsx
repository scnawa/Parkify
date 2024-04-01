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

const PageList = () => {

  const [token, setToken] = React.useState(localStorage.getItem('token'));
  const [SID, setSID] = React.useState(localStorage.getItem('SID'));
  const [listings, setListings] = useState([]);
  const navigate = useNavigate();
  return (
    <>
      <NavBar token={token} SID={SID} setToken={setToken} setSID={setSID} setListings={setListings}/>
      <Routes>
        <Route path="/"element={<AllListings token={token} listings={listings}/>} />
        <Route path="/create-listings" element={<CreateListings token={token}/>} />
        <Route path="/myListing" element={<MyListings token={token}/>} />
        <Route path="/editListings" element={<EditListings />} />
        <Route path="/alllistings" element={<AllListings token={token} listings={listings}/>} />
        <Route path="/listing/:listing_id" element={<ListingPage />} />
        <Route path="/login" element={<Login  token={token} setToken={setToken} SID={SID} setSID={setSID}/>} />
        <Route path="/signup" element={<Signup  />} />
        <Route path="/admindashboard" element={<AdminDashboard  />} />
        <Route path="/profilepage" element={<ProfilePage token={token} SID={SID} setToken={setToken}/>}/>
        <Route path="/verify" element={<Verify token={token} setToken={setToken} SID={SID} setSID={setSID}/>} />
      </Routes>
    </>
  );
}

export default PageList;
