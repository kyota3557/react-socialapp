import React,{ useState, useEffect } from 'react'
import axios from 'axios';
const CreatePost = () => {
  const [postText,setPostText] = useState('');
  const [posts,setPosts] = useState([]);
  
  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/posts');
      setPosts(response.data);
    }catch (error) {
      console.log('Error fetching posts:',error);
    }
  };

  useEffect(() => {
    fetchPosts();
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
      const response = await axios.post('http://localhost:5000/api/posts', { content: postText });
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
       
        
        {/* 投稿リスト */}
      <div>
        <h2>投稿一覧</h2>
        <ul>
          {posts.map((post) => (
            <li key={post._id}>
              <p>{post.content}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default CreatePost