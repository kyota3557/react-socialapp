import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'
import AllPost from './post/AllPost';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = ({ token,currentUserId }) => {
  const [username,setUsername] = useState('');
  const [error,setError] = useState('');
  const location = useLocation();

  useEffect(() => {
    const fetchUserNameData = async () => {
      try{
        const response = await axios.get('http://localhost:5000/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`, // 認証トークンをヘッダーに追加
        },
        });
        setUsername(response.data);
      } catch (err) {
        setError('ユーザー情報を取得できませんでした');
        console.error(err);
      }
    };
    fetchUserNameData();

  },[]);

  
  return (
    
    <div>
      <header>
        <Link to={"/createpost"} >
          新しい投稿をする
        </Link>
        <br />
        <Link to={"/userinfo"} >
          ユーザー情報
        </Link>
      </header>
      <h1>こんにちは {username.username}</h1>
      <AllPost token={token} currentUserId={currentUserId} />
    </div>
  )
}

export default Home