import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './css/AllPost.css';
import { Link } from 'react-router-dom';

const AllPost = ({ token, currentUserId }) => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [newComments, setNewComments] = useState({}); // 投稿ごとのコメント状態を管理

  // コメント入力変更時の処理
  const handleCommentChange = (postId, comment) => {
    setNewComments((prevComments) => ({
      ...prevComments,
      [postId]: comment,
    }));
  };

  // コメント送信処理
  const handleCommentSubmit = (postId) => {
    const comment = newComments[postId]; // 特定の投稿のコメント
    if (comment.trim().length > 0) {
      handleAddComment(postId, comment); // コメントを追加
      setNewComments((prevComments) => ({
        ...prevComments,
        [postId]: '', // 送信後、入力フィールドをリセット
      }));
    }
  };

  // 投稿を取得する関数
  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError(`Error fetching posts: ${error.message || 'Unknown error'}`);
    }
  };

  // いいね処理
  const handleLike = async (postId) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/posts/${postId}/like`, {
          userId: currentUserId
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
      setError(`Error liking post: ${error.message || 'Unknown error'}`);
    }
  };

  // コメント追加処理
  const handleAddComment = async (postId, comment) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/posts/${postId}/comment`, {
          content: comment,
          userId: currentUserId
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
      setError(`Error adding comment: ${error.message || 'Unknown error'}`);
    }
  };

  // 投稿削除処理
  const deletePost = async (postId) => {
    try {
      await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      setError(`Error deleting post: ${error.message || 'Unknown error'}`);
    }
  };

  // 初回データ取得
  useEffect(() => {
    fetchPosts();
  }, []); // tokenやcurrentUserIdが変更された場合に再度データを取得

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
              {post.userId.profilePicture && post.userId.profilePicture !== 'undefined' ? (
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
                    {comment.userId.profilePicture && comment.userId.profilePicture !== 'undefined' ? (
                      <img
                        src={`http://localhost:5000/${comment.userId.profilePicture.replace(/\\/g, '/')}`}
                        alt="Profile"
                        className="profile-picture"
                      />
                    ) : (
                      <div>No Profile Picture</div>
                    )}
                    <strong>{comment.userId.username}</strong>: {comment.content}
                  </div>
                ))
              ) : (
                <p>No comments yet</p>
              )}
              <input
                type="text"
                value={newComments[post._id] || ''}
                onChange={(e) => handleCommentChange(post._id, e.target.value)}
                placeholder="Add a comment"
              />
              <button onClick={() => handleCommentSubmit(post._id)}>Post Comment</button>
            </div>

            {/* 自分の投稿に対してのみ削除ボタンを表示 */}
            {post.userId._id === currentUserId && (
              <button className="delete-button" onClick={() => deletePost(post._id)}>
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
