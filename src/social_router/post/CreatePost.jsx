import React,{ useState, useEffect } from 'react'
import axios from 'axios';
import { Link } from 'react-router-dom';
const CreatePost = ({token}) => {

  const [user, setUser] = useState(null);
  const [postText,setPostText] = useState('');
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

  const fetchData = async () => {
    try {
      await Promise.all([fetchPosts(),fetchUserData()]);
      console.log('user is',user);
    } catch (error){
      console.error('データの取得に失敗しました:',error);
    }
  };

  useEffect(() => {
    fetchData();
  },[]);

  const handlePostTextChange = (e) => {
    
    setPostText(e.target.value);
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if(postText.trim() === '') { 
      alert('投稿内容を入力してください');
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/api/posts', { 
        content: postText,
        userId: user._id
      });
      setPosts([response.data,...posts]);
      setPostText('');
    } catch (error){
      console.error('Error posting',error);
    }
  }

  return (
    <div>
        <h1>投稿ページ</h1>
        <form onSubmit={handlePostSubmit}>
          <textarea 
          value={postText}
          onChange={handlePostTextChange}
          placeholder='今どうしてる'
          rows="4"
          cols="50"
          />
          <br/>
        <button type='submit'>投稿</button>
        </form> 
        <Link to={"/home"}>戻る</Link>
        
    </div>
  )
}

export default CreatePost