import React, { useState } from 'react';
import './css/Like.css'
const Like = ({ postId, initialLikes, userId }) => {
  const [likes, setLikes] = useState(initialLikes.length); // 初期いいね数
  const [hasLiked, setHasLiked] = useState(initialLikes.includes(userId)); // 初期状態を判定

  console.log('今の',likes)
  const toggleLike = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/toggleLike`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const result = await response.json();
        setHasLiked(!hasLiked); // トグルで状態を変更
        setLikes((prevLikes) =>
          hasLiked ? prevLikes - 1 : prevLikes + 1 // いいね数を増減
        );
      } else {
        console.error('Failed to toggle like');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <div className='like'>
    <button 
      onClick={toggleLike} 
      className={hasLiked ? 'hasLiked' : 'Like'}>
      {/* いいね状態によってハートの色やテキストを変更 */}
      {hasLiked ? '❤️' : '🤍'} {/* ❤️が赤いハート、🤍が白いハート */}
    </button>
    <p>{likes} likes</p>
  </div>
  );
};

export default Like;