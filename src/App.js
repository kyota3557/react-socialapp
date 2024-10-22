import React from 'react';
import LoginSignup from './social_router/LoginSignup';
import Home from './social_router/Home';
import Edit from './social_router/Edit';
import Signup from './social_router/Signup';
import Login from './social_router/Login';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
        <Route path='/' element={<LoginSignup />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/home' element={<Home />} />
        <Route path='/edit' element={<Edit />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
