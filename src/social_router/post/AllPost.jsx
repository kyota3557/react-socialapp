import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './css/AllPost.css';
import { Link } from 'react-router-dom';

const AllPost = ({ token, currentUserId }) => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newComments, setNewComments] = useState({});

  const handleCommentChange = (postId, comment) => {
    setNewComments((prevComments) => ({
      ...prevComments,
      [postId]: comment,
    }));
  };

 const handleCommentSubmit = (postId) => {
  const comment = newComments[postId];
  if (comment.trim()) {
    handleAddComment(postId, comment);
    setNewComments((prevComments) => ({
      ...prevComments,
      [postId]: '',  // コメント入力をリセット
    }));
  }
};

const fetchPosts = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/posts');
    setPosts(response.data);
    console.log("responseは", response);
  } catch (error) {
    console.error('Error fetching posts:', error);
    
    // AxiosError の場合の処理
    if (error.response) {
      // サーバーからエラーレスポンスが返ってきた場合
      console.error('Response error status:', error.response.status);
      console.error('Response error data:', error.response.data);
    } else if (error.request) {
      // リクエストは送信されたが、レスポンスがない場合
      console.error('No response received from server:', error.request);
    } else {
      // その他のエラー（ネットワークエラーなど）
      console.error('Error message:', error.message);
    }

    // 状況に応じてエラーメッセージをステートに設定
    setError(`Error fetching posts: ${error.message || 'Unknown error'}`);
  }
};


  const handleLike = async (postId) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/posts/${postId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, likes: response.data.likes }
            : post
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleAddComment = async (postId, comment) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/posts/${postId}/comment`,
        { content: comment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, comments: response.data.comments }
            : post
        )
      );
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const deletePost = async (postId) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/posts/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPosts((prevPosts) => prevPosts.filter(post => post._id !== postId));
      console.log('Deleted post:', response.data);
    } catch (error) {
      console.error('Error deleting post:', error);
      setError(`Error deleting post: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchPosts();
    console.log('更新');
  }, []); // 初回のみデータ取得

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
              <Link to={`/userpage/${post.userId._id}`} className="username">
                {post.userId.username}
              </Link>
            </div>
            <p className="post-content">{post.content}</p>
            {/* いいねボタン */}
            <button onClick={() => handleLike(post._id)}>
              {post.likes.includes(currentUserId) ? 'Unlike' : 'Like'} ({post.likes.length})
            </button>
            {/* コメントリストと入力フォーム */}
            <div className="comments">
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((comment) => (
                  <div key={comment._id} className="comment">
                    <strong>{comment.userId.username}</strong>: {comment.content}
                  </div>
                ))
              ) : (
                <p>No comments yet</p>
              )}
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment"
              />
              <button onClick={() => handleCommentSubmit(post._id)}>Post Comment</button>
            </div>
            {/* 自分の投稿に対してのみ削除ボタンを表示 */}
            {post.userId._id === currentUserId && (
              <button
                className="delete-button"
                onClick={() => deletePost(post._id)}
              >
                削除
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AllPost;
