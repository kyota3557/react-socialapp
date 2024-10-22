import React from 'react'
import { useLocation } from 'react-router-dom'

const Home = () => {
  const location = useLocation();
  const { formData } = location.state || {};
  return (
    <div>
      {formData ? (
        <h1>ようこそ　{formData.username}</h1>
      ) : (
        <h1>データが存在しません</h1>
      )}
      
    </div>
  )
}

export default Home