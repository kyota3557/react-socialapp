import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './css/AllPost.css';
import { Link } from 'react-router-dom';
import Like from './Like';

const AllPost = ({ token, currentUserId }) => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [newComments, setNewComments] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/posts');
      const postsWithUserInfo = await Promise.all(
        response.data.map(async (post) => {
          const commentsWithUserInfo = await Promise.all(
            post.comments.map(async (comment) => {
              const userResponse = await axios.get(
                `http://localhost:5000/api/users/${comment.userId}`
              );
              return { ...comment, userInfo: userResponse.data };
            })
          );
          return { ...post, comments: commentsWithUserInfo };
        })
      );
      setPosts(postsWithUserInfo);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError(`Error fetching posts: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (imageSrc) => {
    setCurrentImage(imageSrc);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentImage(null);
  };

  const handleLike = async (postId) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/posts/${postId}/togglelike`,
        { userId: currentUserId }
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

  const handleCommentChange = (postId, comment) => {
    setNewComments((prevComments) => ({
      ...prevComments,
      [postId]: comment,
    }));
  };

  const handleCommentSubmit = (postId) => {
    const comment = newComments[postId];
    if (comment.trim().length > 0) {
      handleAddComment(postId, comment);
      setNewComments((prevComments) => ({
        ...prevComments,
        [postId]: '',
      }));
    }
  };

  const handleAddComment = async (postId, comment) => {
    try {
      await axios.post(
        `http://localhost:5000/api/posts/${postId}/comment`,
        { content: comment, userId: currentUserId }
      );
      fetchPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

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

  useEffect(() => {
    fetchPosts();
  }, [token, currentUserId]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
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
            {post.pictures &&
              post.pictures.map((picture) => (
                <img
                  key={picture}
                  src={`http://localhost:5000/${picture}`}
                  alt="Post Picture"
                  className="post-picture"
                  onClick={() => openModal(`http://localhost:5000/${picture}`)}
                />
              ))}
            {isModalOpen && (
              <div className="modal open" onClick={closeModal}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <button className="close-button" onClick={closeModal}>
                    ✖
                  </button>
                  <img src={currentImage} alt="Full Post Picture" />
                </div>
              </div>
            )}
            <Like postId={post._id} initialLikes={post.likes} userId={currentUserId} />
            <div className="comments">
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((comment) => (
                  <div key={comment._id} className="comment">
                    {comment.userInfo.profilePicture ? (
                      <img
                        src={`http://localhost:5000/${comment.userInfo.profilePicture.replace(/\\/g, '/')}`}
                        alt="Profile"
                        className="profile-picture"
                      />
                    ) : (
                      <div>No Profile Picture</div>
                    )}
                    <strong>{comment.userInfo.username}</strong>: {comment.content}
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
