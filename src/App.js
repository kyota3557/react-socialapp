import React,{ useState, useEffect } from 'react';
import axios from 'axios';
import LoginSignup from './social_router/LoginSignup';
import Home from './social_router/Home';
import Edit from './social_router/Edit';
import Signup from './social_router/Signup';
import Login from './social_router/Login';
import UserPage from './social_router/user/UserPage';
import CreatePost from './social_router/post/CreatePost';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import UserInfo from './social_router/user/UserInfo';

function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem('token') || '');

  useEffect(() => {
    if (token) {
        sessionStorage.setItem('token', token);
    } else {
        sessionStorage.removeItem('token');
    }
}, [token]);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
        <Route path='/' element={<LoginSignup />} />
        <Route path='/login' element={<Login token={token} setToken={setToken} />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/home' element={<Home token={token} />} />
        <Route path='/edit' element={<Edit />} />
        <Route path='/createpost' element={<CreatePost token={token} />} />
        <Route path='/userinfo' element={<UserInfo token={token} />} />
        <Route  path="/userpage/:userId" element={<UserPage token={token} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
