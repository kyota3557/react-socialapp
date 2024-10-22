import React from 'react'
import { Link } from 'react-router-dom'

const LoginSignup = () => {
  return (
    <div>
        <h1>Hello!!!</h1>
        <ul>
            <Link to={"/signup"}>
                <li>新規登録</li>
            </Link>
            <Link to={"/login"}>
                <li>ログイン</li>
            </Link>          
        </ul>
    </div>
  )
}

export default LoginSignup