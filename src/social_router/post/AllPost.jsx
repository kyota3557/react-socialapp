import React,{ useState, useEffect } from 'react'
import axios from 'axios';

const AllPost = ({token}) => {

  const [user, setUser] = useState(null);
  const [posts,setPosts] = useState([]);
  const [error, setError] = useState('');

  const fetchPosts = async () => {
    
    try {
      const response = await axios.get('http://localhost:5000/api/posts');
      setPosts(response.data);
    }catch (error) {
      console.log('Error fetching posts:',error);
    }
  };

  const fetchUserData = async () => {
    try{
      console.log('tokenは',token);
      const response = await axios.get('http://localhost:5000/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`, // 認証トークンをヘッダーに追加
      },
      });
      setUser(response.data);
    } catch (err) {
      setError('ユーザー情報を取得できませんでした');
      console.error(err);
    }
  };

  const fetchData = async () => {
    try {
      await Promise.all([fetchPosts(),fetchUserData()]);
      console.log('fetch完了')
    } catch (error){
      console.error('データの取得に失敗しました:',error);
    }
  };
  
  useEffect(() => {
  
  fetchData();
  },[]);

  
    // userがまだ読み込まれていない場合、またはエラーが発生した場合はローディングやエラーメッセージを表示
    if (error) {
      return <div>Error: {error}</div>;
    }
  
    if (!user) {
      return <div>Loading user data...</div>; // ユーザー情報がまだロードされていない場合
    }
  const imagePath = user.profilePicture; // 例: "uploads\\1730295073801_player.png"
  const imageUrl = `http://localhost:5000/${imagePath.replace(/\\/g, '/')}`; // バックスラッシュをスラッシュに変換


  return (
    <div>
        <h2>投稿一覧</h2>
        <ul>
          <li>{user.username}</li>
          <li><img src={imageUrl} alt='Profile Preview' /></li>
          {posts.map((post) => (
            <li key={post._id}>
              <p>{post.content}</p>
            </li>
          ))}
        </ul>
      </div>
  )
}

export default AllPost