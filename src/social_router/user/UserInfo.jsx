import React,{ useEffect, useState} from 'react'
import axios from 'axios'
import './css/UserInfo.css'

const UserInfo = ({token}) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const fetchUserData = async () => {
      try{
        console.log(token);
        const response = await axios.get('http://localhost:5000/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`, // 認証トークンをヘッダーに追加
        },
        });
        setUser(response.data);
        console.log('dataは',response.data);
      } catch (err) {
        setError('ユーザー情報を取得できませんでした');
        console.error(err);
      }
    };
    fetchUserData();
    
  },[]);



  if (error) {
    return <p>{error}</p>;
  }

  if (!user) {
    return <p>Loading...</p>; // データ取得中の表示
  }

  const imagePath = user.profilePicture; // 例: "uploads\\1730295073801_player.png"
  const imageUrl = `http://localhost:5000/${imagePath.replace(/\\/g, '/')}`; // バックスラッシュをスラッシュに変換


  return (
    <div>
      <h1>ユーザー情報</h1>
        <div className='user-item'>
          <p className='user-username'>名前: {user.username}</p>
          <p className='user-email'>メール: {user.email}</p>
          <img src={imageUrl} alt='Profile Preview' className='user-preview' />
          {/* 他のユーザー情報も必要に応じて表示 */}
        </div>
    </div>
  )
}

export default UserInfo