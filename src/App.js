import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginSignup from './social_router/LoginSignup';
import Home from './social_router/Home';
import Edit from './social_router/Edit';
import Signup from './social_router/Signup';
import Login from './social_router/Login';
import UserPage from './social_router/user/UserPage';
import CreatePost from './social_router/post/CreatePost';
import UserInfo from './social_router/user/UserInfo';

function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem('token') || '');
  const [currentUserId, setCurrentUserId] = useState(null);

  // 現在のユーザー情報を取得する非同期関数
  const fetchCurrentUser = async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`  // 認証トークンを送信
        }
      });
      console.log('Current user:', response.data);
      setCurrentUserId(response.data._id);  // ユーザーIDを state に保存
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  // トークンが変更された時に sessionStorage を更新
  useEffect(() => {
    if (token) {
      sessionStorage.setItem('token', token);
    } else {
      sessionStorage.removeItem('token');
    }
  }, [token]);

  // トークンが変更されるたびにユーザー情報を取得
  useEffect(() => {
    if (token) {
      fetchCurrentUser(token);  // トークンが存在すればユーザー情報を取得
    }
  }, [token]);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<LoginSignup />} />
          <Route path='/login' element={<Login token={token} setToken={setToken} />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/home' element={<Home token={token} currentUserId={currentUserId} />} />
          <Route path='/edit' element={<Edit />} />
          <Route path='/createpost' element={<CreatePost token={token} />} />
          <Route path='/userinfo' element={<UserInfo token={token} />} />
          <Route path="/userpage/:userId" element={<UserPage token={token} currentUserId={currentUserId} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
