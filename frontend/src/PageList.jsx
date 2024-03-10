import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import CreateListings from './components/CreateListings';
import NavBar from './components/NavBar';
import Login from './components/Login';
import Signup from './components/Signup';
import AdminDashboard from './components/AdminDashboard';

import ProfilePage from './components/ProfilePage';

import PublishModal from './components/PublishModal';
import ListingCard from './components/ListingCard';
import MyListings from './components/MyListings';
import EditListings from './components/EditListings';

const PageList = () => {
  const [token, setToken] = useState("");
  const navigate = useNavigate();
  return (
    <>
      <NavBar token={token}/>
      <Routes>
        <Route path="/"/>
        <Route path="/create-listings" element={<CreateListings token={token}/>} />
        <Route path="/myListing" element={<MyListings token={token}/>} />
        <Route path="/editListings" element={<EditListings />} />

        <Route path="/login" element={<Login  token={token} setToken={setToken}/>} />
        <Route path="/signup" element={<Signup  />} />
        <Route path="/admindashboard" element={<AdminDashboard  />} />
        <Route path="/profilepage" element={<ProfilePage/>} />
      </Routes>
    </>
  );
}

export default PageList;
