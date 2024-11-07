import React from 'react'
import { useLocation } from 'react-router-dom'
import AllPost from './post/AllPost';
import { Link } from 'react-router-dom';

const Home = ({ token }) => {
  const location = useLocation();
  const { formData } = location.state || {};
  const { loginUser} = location.state || {};
  

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
        <h1>こんにちは {formData.username}</h1> // formDataがある場合
      ) : loginUser ? (
        <h1>こんにちは {loginUser}</h1> // loginUserがある場合
      ) : (
        <h1>データが存在しません</h1> // 両方ともない場合
      )}
      
      <AllPost token={token} />
    </div>
  )
}

export default Home