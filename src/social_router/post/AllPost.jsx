import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './css/AllPost.css';
import { Link } from 'react-router-dom';

const AllPost = ({ token, currentUserId }) => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // ローディング状態を追加
  const [newComments, setNewComments] = useState({}); // 投稿ごとのコメント状態を管理
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null); // モーダル用の画像

  // 投稿を取得する関数
  const fetchPosts = async () => {
    setLoading(true); // APIリクエスト前にローディング開始
    try {
      const response = await axios.get('http://localhost:5000/api/posts');
      const postsWithUserInfo = await Promise.all(
        response.data.map(async (post) => {
          const commentsWithUserInfo = await Promise.all(
            post.comments.map(async (comment) => {
              const userResponse = await axios.get(
                `http://localhost:5000/api/users/${comment.userId}`
              );
              return {
                ...comment,
                userInfo: userResponse.data, // コメントにユーザー情報を追加
              };
            })
          );
          return { ...post, comments: commentsWithUserInfo };
        })
      );
      setPosts(postsWithUserInfo);
      console.log("今のデータは",response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError(`Error fetching posts: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false); // ローディング完了
    }
  };


  // モーダルを開く
  const openModal = (imageSrc) => {
    setCurrentImage(imageSrc);
    setIsModalOpen(true);
  };

  // モーダルを閉じる
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentImage(null);
  };

  // いいね処理
  const handleLike = async (postId) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/posts/${postId}/like`, {
          userId: currentUserId
        }
      );
      console.log('resはきた')
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

  const handleAddComment = async (postId, comment) => {
    try {
      await axios.post(
        `http://localhost:5000/api/posts/${postId}/comment`, {
          content: comment,
          userId: currentUserId
        }
      );
      // コメント追加後、データを再取得
      fetchPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
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
  }, [token, currentUserId]); // tokenやcurrentUserIdが変更された場合に再度データを取得

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (loading) {
    return <div>Loading...</div>; // ローディング中の表示
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
            {post.picture && (
              <img
                src={`http://localhost:5000/${post.picture}`}
                alt="Post Picture"
                className="post-picture"
                onClick={() => openModal(`http://localhost:5000/${post.picture}`)} // モーダルを開く
              />
            )}

            {isModalOpen && (
              <div className={`modal ${isModalOpen ? 'open' : ''}`} onClick={closeModal}>
                <img
                  src={currentImage}
                  alt="Full Post Picture"
                  onClick={(e) => e.stopPropagation()} // 画像をクリックしてもモーダルが閉じない
                />
              </div>)}

            {/* いいねボタン */}
            <button onClick={() => handleLike(post._id)}>
              {post.likes.includes(currentUserId) ? 'Unlike' : 'Like'} ({post.likes.length})
            </button>

            {/* コメントリストと入力フォーム */}
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
