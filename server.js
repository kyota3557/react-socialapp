const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

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

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
});

const User = mongoose.model('User',userSchema);

app.post('/api/signup', async (req, res) => {
    const formData = req.body;

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