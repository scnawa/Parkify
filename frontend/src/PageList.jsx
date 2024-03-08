import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

import CreateListings from './components/CreateListings';
import NavBar from './components/NavBar';
// const LandingPage = () => {
//   // const navigate = useNavigate();
//   // navigate('/login');
//   return <>Hi</>
// }

const PageList = () => {

  const navigate = useNavigate();

  React.useEffect(() => {

  }, []);

  return (
    <>
      <NavBar/>

      <Routes>
        <Route path="/create-listings" element={<CreateListings/>} />
      </Routes>
    </>
  );
}

export default PageList;
