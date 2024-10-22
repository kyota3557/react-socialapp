import React,{ useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css'

const Signup = () => {
    const navigate = useNavigate();
    const [formData,setFormData] = useState({
        username:'',
        email:'',
        password:''
    });

    const clearInput = () => {
        setFormData({
            username: '',
            email: '',
            password: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try{
            const response = await fetch('http://localhost:5000/api/signup',{
                method:'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body:JSON.stringify(formData),
            });
            const data = await response.json();
            navigate('/home', { state: { formData } });
            clearInput();
        } catch (error) {
            console.error('Error:',error);
        }
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]:value,
        });
    };

  return (
    <div>
        <h1>新規登録画面</h1>
        <form onSubmit={handleSubmit} className='input-form' >
            <ul className='input-ul' >
                <li className='input-li'>
                    <label className='input-label' htmlFor='username'> username</label>
                        <input 
                        type="text"
                        name='username'
                        id='username' 
                        value={formData.username}
                        onChange={handleChange}
                        required
                        />
                </li>
                <li className='input-li'>
                    <label className='input-label' htmlFor='email'>email</label>
                        <input 
                        type="email"
                        name='email'
                        id='email'
                        value={formData.email}
                        onChange={handleChange}
                        required
                        />
                </li>
                <li className='input-li'>
                    <label className='input-label' htmlFor='password'>password</label>
                        
                        <input 
                        type="password"
                        name='password'
                        id='password'
                        value={formData.password}
                        onChange={handleChange}
                        required
                        />
                </li>
            </ul>
            <div className='input-button'>
                <button type='submit'>新規登録</button>
            </div>
            
        </form>
    </div>
  );
};

export default Signup