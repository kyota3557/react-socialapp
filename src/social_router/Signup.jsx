import React,{ useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Signup.css'

const Signup = () => {
    const navigate = useNavigate();
    const [formData,setFormData] = useState({
        username:'',
        email:'',
        password:''
    });
    
    const [profilePicture,setProfilePicture] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if(file) {
            setProfilePicture(file);
        };
        };
    

    const clearInput = () => {
        setFormData({
            username: '',
            email: '',
            password: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formDataToSubmit = new FormData();
        formDataToSubmit.append('username', formData.username);
        formDataToSubmit.append('email', formData.email);
        formDataToSubmit.append('password', formData.password);
        if (profilePicture) {
            formDataToSubmit.append('profilePicture', profilePicture);
        }
       
        try{
            const response = await fetch('http://localhost:5000/api/signup',{
                method:'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body:JSON.stringify(formDataToSubmit),
            });
           console.log(response);
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
                <li className='input-li'>
                    <label className='input-label' htmlFor='profilePicture'>
                        プロフィール画像
                    </label>
                    <input
                        type='file'
                        name='profilePicture'
                        id='profilePicuture'
                        accept='image/*'
                        onChange={handleFileChange}
                    >
                    </input>
                </li>
                {profilePicture && (
                    <img src={URL.createObjectURL(profilePicture)} alt='Profile Preview' className='profile-preview' />
                )}
            </ul>

            <div className='input-button'>
                <button type='submit'>新規登録</button>
            </div>
            
        </form>
    </div>
  );
};

export default Signup