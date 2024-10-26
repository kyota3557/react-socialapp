const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const app = express();
const PORT = 5000;

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


const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    profilePicture: String,
});

const User = mongoose.model('User',userSchema);

app.post('/api/signup',upload.single('profilePicture'), async (req, res) => {
   
    const formData = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        profilePicture: req.file.path, // アップロードした画像のパスを取得
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

app.listen(PORT,() => {
    console.log(`Server is running on http://localhost:${PORT}`)
});