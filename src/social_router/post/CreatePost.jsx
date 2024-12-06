import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link,useNavigate } from 'react-router-dom';
import './css/CreatePost.css'
const CreatePost = ({ token }) => {
  const [user, setUser] = useState(null);
  const [postText, setPostText] = useState('');
  const [error, setError] = useState('');
  const [pictures, setPictures] = useState([]);
  const navigate = useNavigate();
  // ユーザー情報の取得
  const fetchUserData = async () => {
    try {
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

  // 画像の選択を処理
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    console.log(files)
    setPictures((prevPictures) => [...prevPictures, ...files]);
  };

  // 投稿テキストの変更を処理
  const handlePostTextChange = (e) => {
    setPostText(e.target.value);
  };

  // 投稿送信処理
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (postText.trim() === '') {
      alert('投稿内容を入力してください');
      return;
    }

    const formData = new FormData();
    formData.append('content', postText);
    formData.append('userId', user._id);
    if (pictures) {
      pictures.forEach((picture) => {
        formData.append('pictures', picture);
      })
    };
    console.log(formData)
    try {
      await axios.post('http://localhost:5000/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // 画像を送信するために必要
          Authorization: `Bearer ${token}`,
        },
      });
      setPostText('');
      setPictures([]); // 投稿後は画像をリセット
      navigate('/home')
    } catch (error) {
      setError('投稿の作成に失敗しました');
      console.error('Error posting', error);
    }
  };

  // 初回データ取得
  useEffect(() => {
    fetchUserData();
  }, [token]);

  return (
    <div className="post-page">
      <h1 className="post-title">投稿ページ</h1>
      <form className="post-form" onSubmit={handlePostSubmit}>
      <textarea
        className="post-textarea"
        value={postText}
        onChange={handlePostTextChange}
        placeholder="今どうしてる"
        rows="4"
        cols="50"
      />
      <div className="input-li">
        <label className="input-label" htmlFor="pictures">
          画像を選択
        </label>
        <input
          className="file-input"
          type="file"
          name="pictures"
          id="pictures"
          multiple
          accept="image/*"
          onChange={handleFileChange}
        />
        <button 
          className="custom-file-input" 
          onClick={(event) => {
            event.preventDefault(); // フォーム送信を防止
            document.getElementById('pictures').click(); // ファイル選択ボックスをクリック
          }}
        >
          画像を選択
        </button>
      </div>
      
      <div className="image-previews">
        {pictures.map((picture, index) => (
          <img 
            key={index}
            className="image-preview"
            src={URL.createObjectURL(picture)}
            alt={`preview-${index}`}
          />
        ))}
      </div>
      <button className="submit-button" type="submit">投稿</button>
      </form>
      <Link className="back-link" to="/home">戻る</Link>
    </div>
  );
};

export default CreatePost;
