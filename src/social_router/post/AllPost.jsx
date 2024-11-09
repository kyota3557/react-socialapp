import React,{ useState, useEffect } from 'react'
import axios from 'axios';
import './css/AllPost.css'

const AllPost = ({token}) => {

  const [user, setUser] = useState(null);
  const [posts,setPosts] = useState([]);
  const [error, setError] = useState('');

  const fetchPosts = async () => {
    
    try {
      const response = await axios.get('http://localhost:5000/api/posts');
      setPosts(response.data);
      console.log("postは",response);
    }catch (error) {
      console.log('Error fetching posts:',error);
    }
  };


  
  useEffect(() => {
  
  fetchPosts();
  },[]);

  
    // userがまだ読み込まれていない場合、またはエラーが発生した場合はローディングやエラーメッセージを表示
    if (error) {
      return <div>Error: {error}</div>;
    }
  
   
  // const imagePath = posts.userId.profilePicture; // 例: "uploads\\1730295073801_player.png"
  // const imageUrl = `http://localhost:5000/${imagePath.replace(/\\/g, '/')}`; // バックスラッシュをスラッシュに変換


  return (
    <div>
        <h2>投稿一覧</h2>
        <ul>
    {posts.map((post) => (
        <li key={post._id} className="post-item">
            <div className="user-info">
                <img 
                    src={`http://localhost:5000/${post.userId.profilePicture.replace(/\\/g, '/')}`} 
                    alt="Profile" 
                    className="profile-picture"
                />
                <h3 className="username">{post.userId.username}</h3>
            </div>
            <p className="post-content">{post.content}</p>  {/* 投稿内容 */}
        </li>
    ))}
</ul>

    </div>
  )
}

export default AllPost