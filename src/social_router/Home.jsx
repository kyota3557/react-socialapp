import React from 'react'
import { useLocation } from 'react-router-dom'
import NewPost from './post/NewPost';
import AllPost from './post/AllPost';
import { Link } from 'react-router-dom';

const Home = () => {
  const location = useLocation();
  const { formData } = location.state || {};
  return (
    <div>
      <header>
        <Link to={"/createpost"} >
          新しい投稿をする
        </Link>
        <br />
        <Link to={"/userinfo"} >
          ユーザー情報
        </Link>
      </header>
      {formData ? (
        <h1>ようこそ　{formData.username}</h1>
      ) : (
        <h1>データが存在しません</h1>
      )}
      <NewPost />
      <AllPost />
    </div>
  )
}

export default Home