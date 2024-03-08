import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import CreateListings from './components/CreateListings';
import NavBar from './components/NavBar';
import Login from './components/Login';
import Signup from './components/Signup';
import AdminDashboard from './components/AdminDashboard';


const PageList = () => {
  const navigate = useNavigate();

  return (
    <>
      <NavBar/>
      <Routes>
        <Route path="/"/>
        <Route path="/create-listings" element={<CreateListings/>} />

        <Route path="/login" element={<Login  />} />
        <Route path="/signup" element={<Signup  />} />
        <Route path="/admindashboard" element={<AdminDashboard  />} />
      </Routes>
    </>
  );
}

export default PageList;
