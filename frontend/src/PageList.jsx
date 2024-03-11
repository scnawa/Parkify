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

const PageList = () => {
  const [token, setToken] = useState("");
  const [SID, setSID] = useState("");
  const navigate = useNavigate();
  return (
    <>
      <NavBar token={token} SID={SID}/>
      <Routes>
        <Route path="/"/>
        <Route path="/create-listings" element={<CreateListings token={token}/>} />
        <Route path="/myListing" element={<MyListings token={token}/>} />
        <Route path="/editListings" element={<EditListings />} />

        <Route path="/login" element={<Login  token={token} setToken={setToken} SID={SID} setSID={setSID}/>} />

        <Route path="/signup" element={<Signup  />} />
        <Route path="/admindashboard" element={<AdminDashboard  />} />
        <Route path="/profilepage" element={<ProfilePage token={token} SID={SID}/>}/>
        <Route path="/verify" element={<Verify/>} />
      </Routes>
    </>
  );
}

export default PageList;
