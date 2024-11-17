import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './css/UserPage.css';  // 必要に応じてスタイルを追加
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
const UserPage = () => {
  const { userId } = useParams();  // URLからuserIdを取得
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // ユーザー情報の取得
        const userResponse = await axios.get(`http://localhost:5000/api/users/${userId}`);
        setUser(userResponse.data);
        
        // 投稿情報の取得
        const postsResponse = await axios.get(`http://localhost:5000/api/posts?userId=${userId}`);
        setPosts(postsResponse.data);
      } catch (error) {
        setError('Error fetching user data');
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [userId]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>{user.username}のプロフィール</h2>
      <div className="user-profile">
        {user.profilePicture ? (
          <img
            src={`http://localhost:5000/${user.profilePicture.replace(/\\/g, '/')}`}
            alt="Profile"
            className="profile-picture"
          />
        ) : (
          <div>No Profile Picture</div>
        )}
        <p>Username: {user.username}</p>
        <p>Email: {user.email}</p> {/* 必要に応じて他の情報も表示 */}
      </div>

      <h3>{user.username}の投稿</h3>
      <ul>
        {posts.map((post) => (
          <li key={post._id} className="post-item">
            <p>{post.content}</p>
          </li>
        ))}
      </ul>
      <Link to={"/home"}>戻る</Link>
    </div>
  );
};

export default UserPage;
