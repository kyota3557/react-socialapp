const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const PORT = 5000;
const bcrypt = require('bcrypt');



mongoose.connect('mongodb://localhost:27017/SignupDatabase',{
    useNewUrlParser:true,
    useUnifiedTopology:true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:',err));

// ミドルウェア
app.use(cors());
app.use(bodyParser.json());

const storage = multer.diskStorage({
    destination:(req,file,cb) => {
        cb(null,'uploads/');
    },
    filename: (req,file,cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});

const upload = multer({storage});

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    profilePicture: String,
});

const User = mongoose.model('User',userSchema);

app.post('/api/signup',upload.single('profilePicture'), async (req, res) => {
    const { username, email, password } = req.body; // パスワードを取得
    const hashedPassword = await bcrypt.hash(password, 10);
    const formData = {
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword, // ハッシュ化したパスワードを保存
        profilePicture: req.file.path , // アップロードした画像のパスを取得
    };


    try {
        const newUser = new User(formData);
        await newUser.save();
        
        console.log('Received data:', formData);
        res.status(201).json({ message: 'User registered successfully', data: formData });
    } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
});

app.get('/api/users',async (req,res) => {
    try{
        const users = await User.find();
        res.status(200).json(users);
    } catch(error) {
        console.error('Error fetching users:',error);
        res.status(500).json({message:'Error fetching users'});
    }
});

app.get('/api/users/:id',async (req,res) => {
    try {
        const user = await User.findById(req.params.id);
        if(!user) {
            return res.status(404).json({message:'User not found'});
        }
        res.status(200).json(user);
    } catch(error) {
        console.error('Error fetching user:',error);
        res.status(500).json({message:'Error fetching user'});
    }
});

app.put('/api/users/:id',async (req,res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id,req.body,{new:true});
        if(!updatedUser) {
            return res.status(404).json({message:'User not found'});
        }
        res.status(200).json({message:'User updated succesfully',data:updatedUser});
    } catch (error) {
        console.error('Error updating user:',error);
        res.status(500).json({message:'Error updating user'});
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        console.log(user);
        if (!user) {
            return res.status(401).json({ message: 'ユーザーが見つかりません' });
        }

        // ユーザーが見つかった後にパスワードを比較
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Do passwords match?', isMatch);
        if (!isMatch) {
            return res.status(401).json({ message: 'wrong password' });
        }

        const token = generateToken(user._id);
        console.log(token);
        res.status(200).json({ message: 'Login successful', token, user });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    // トークンを検証（例: JWTを使用）
    jwt.verify(token, process.env.JWT_SECRET,(err, decoded) => {
        if (err) return res.status(500).json({ message: 'Failed to authenticate token' });
        req.userId = decoded.id; // デコードしたIDをリクエストに追加
        next();
    });
};

// 認証ミドルウェアを使用
app.get('/api/users/me', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user' });
    }
});

app.listen(PORT,() => {
    console.log(`Server is running on http://localhost:${PORT}`)
});