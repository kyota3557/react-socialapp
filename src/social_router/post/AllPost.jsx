import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './css/AllPost.css';
import { Link } from 'react-router-dom';

const AllPost = ({ token }) => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/posts');
      setPosts(response.data);
      console.log("responseは", response);
    } catch (error) {
      setError('Error fetching posts');
      console.log('Error fetching posts:', error);
    }
  };

  const deletePost = async (postId) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,  // トークンを送信する場合
        }
      });

      // 投稿が削除されたら、投稿一覧から削除する
      setPosts((prevPosts) => prevPosts.filter(post => post._id !== postId));
      console.log('Deleted post:', response.data);
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Error deleting post');
    }
  };

  useEffect(() => {
    fetchPosts();
    console.log(posts);
  }, []);

  useEffect(() => {
    console.log("postsが更新されました:", posts);
  }, [posts]);

  // userがまだ読み込まれていない場合、またはエラーが発生した場合はローディングやエラーメッセージを表示
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>投稿一覧</h2>
      <ul>
        {posts.map((post) => (
          <li key={post._id} className="post-item">
            <div className="user-info">
              {post.userId.profilePicture ? (
                <img
                  src={`http://localhost:5000/${post.userId.profilePicture.replace(/\\/g, '/')}`}
                  alt="Profile"
                  className="profile-picture"
                />
              ) : (
                <div>No Profile Picture</div>
              )}
              <Link to={`/userpage/${post.userId._id}`} className="username">{post.userId.username}</Link>
            </div>
            <p className="post-content">{post.content}</p>  {/* 投稿内容 */}
            
            {/* 削除ボタン */}
            <button
              className="delete-button"
              onClick={() => deletePost(post._id)}
            >
              削除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AllPost;
