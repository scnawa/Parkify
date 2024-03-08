import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';


import Login from './Components/Login';
import Signup from './Components/Signup';
import AdminDashboard from './Components/AdminDashboard';
import ProfilePage from './Components/profilePage';


const PageList = () => {
  const navigate = useNavigate();

  return (
    <>
      <Routes>
        <Route path="/"/>
        <Route path="/login" element={<Login  />} />
        <Route path="/signup" element={<Signup  />} />
        <Route path="/admindashboard" element={<AdminDashboard  />} />
        <Route path="/profilepage" element={<ProfilePage/>} />
      </Routes>

    </>
  );
}

export default PageList;
