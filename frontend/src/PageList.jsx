import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import CreateListings from './components/CreateListings';
import NavBar from './components/NavBar';
import Login from './components/Login';
import Signup from './components/Signup';
import AdminDashboard from './components/AdminDashboard';
=======


import Login from './Components/Login';
import Signup from './Components/Signup';
import AdminDashboard from './Components/AdminDashboard';
import ProfilePage from './Components/profilePage';
>>>>>>> backend-frontend


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
        <Route path="/profilepage" element={<ProfilePage/>} />
      </Routes>
    </>
  );
}

export default PageList;
