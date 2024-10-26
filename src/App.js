import React from 'react';
import LoginSignup from './social_router/LoginSignup';
import Home from './social_router/Home';
import Edit from './social_router/Edit';
import Signup from './social_router/Signup';
import Login from './social_router/Login';
import CreatePost from './social_router/post/CreatePost';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import UserInfo from './UserInfo';

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
        <Route path='/createpost' element={<CreatePost />} />
        <Route path='/userinfo' element={<UserInfo />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
