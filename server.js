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
app.use('/uploads',express.static('uploads'));

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

const postSchema = new mongoose.Schema(
    {
      content: { type: String, required: true },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  // いいねしたユーザーのID
      comments: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          content: { type: String, required: true },
        },
      ],
    },
    { timestamps: true }
  );
  
const User = mongoose.model('User',userSchema);
const Post = mongoose.model('Post', postSchema);

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
       
        res.status(201).json({ message: 'User registered successfully', data: formData });
    } catch (error) {
      
        res.status(500).json({ message: 'Error registering user' });
    }
});


app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
   
        const loginUsername = user.username;
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
        res.status(200).json({ message: 'Login successful', token, loginUsername});
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

const authenticate = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // "Bearer <token>"からトークンを抽出
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

app.get('/api/users/:userId', async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);  // MongoDBのUserモデルを使用
      if (!user) {
        return res.status(404).send('User not found');
      }
      res.send(user);
    } catch (err) {
      res.status(500).send('Server Error');
    }
  });

app.put('/api/users/me', authenticate, async (req, res) => {
    try {
        const updates = req.body; // リクエストボディから更新情報を取得
        const user = await User.findByIdAndUpdate(req.userId, updates, { new: true });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user); // 更新されたユーザー情報を返す
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user' });
    }
});


app.post('/api/:postId/like',  async (req, res) => {
    const { postId } = req.params;
    const userId = req.body; // 認証されたユーザーのIDを取得
    try {
      const post = await Post.findById(postId);
      
      // すでにいいねしているか確認
      if (post.likes.includes(userId)) {
        return res.status(400).json({ message: 'You already liked this post.' });
      }
  
      // いいねを追加
      post.likes.push(userId);
      await post.save();
  
      // 更新後のいいねリストを返す
      res.json({ likes: post.likes });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error adding like' });
    }
  });
  
  // いいねを削除
  app.delete('/api/posts/:postId/like', authenticate, async (req, res) => {
    const { postId } = req.params;
    const userId = req.user._id;  // 認証されたユーザーのIDを取得
    
    try {
      const post = await Post.findById(postId);
      
      // いいねしていない場合
      if (!post.likes.includes(userId)) {
        return res.status(400).json({ message: 'You have not liked this post yet.' });
      }
  
      // いいねを削除
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
      await post.save();
  
      // 更新後のいいねリストを返す
      res.json({ likes: post.likes });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error removing like' });
    }
  });

  // routes/posts.js

// コメントを追加
app.post('/api/posts/:postId/comment', async (req, res) => {
  const { postId } = req.params;
  const { content, userId } = req.body;  // ユーザーIDを使用

  try {
      // PostをIDで取得
      const post = await Post.findById(postId);

      // コメントを追加
      post.comments.push({ userId, content });
      
      // コメントを保存
      await post.save();

      // コメントをpopulateして返す
      await post.populate('comments.userId', 'username profilePicture');
      
      // 更新されたコメントを返す
      res.json({ comments: post.comments });
  } catch (err) {
      // エラーハンドリング
      res.status(500).json({ error: err.message });
  }
});


// app.get('/api/:postId', async (req, res) => {
//     const { postId } = req.params;
    
//     if (!mongoose.Types.ObjectId.isValid(postId)) {
//         return res.status(400).json({ message: 'Invalid post ID' });
//     }

//     try {
//       const post = await Post.findById(postId).populate('comments.userId', 'username');
//       res.json(post);
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ message: 'Error fetching post' });
//     }
//   });
  
  

  app.get('/api/posts', async (req, res) => {
    try {
      let { userId } = req.query;
    
      // userIdが存在する場合、バリデーションを実施
      if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid userId format' });
      }
  
      // userIdが提供されていない場合、すべての投稿を返す
      const filter = userId ? { userId: mongoose.Types.ObjectId(userId) } : {};
      const posts = await Post.find(filter).sort({ _id: -1 }).populate('userId', 'username profilePicture');
  
      res.json(posts);  // 投稿とユーザー情報を一緒に返す
    } catch (err) {
      console.error('Error fetching posts:', err);
      res.status(500).json({ message: err.message });
    }
  });
  
  



app.post('/api/posts', async (req, res) => {
    try {
        const { content, userId } = req.body;  // ユーザーIDを使用
        const newPost = new Post({
            content,
            userId  // 投稿にユーザーIDを関連付ける
        });

        const savedPost = await newPost.save();
        res.json(savedPost);  // 新しい投稿をレスポンスとして返す
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.delete('/api/posts/:id',async (req,res) => {
    const { id } = req.params;
    
    try{
        if(!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({message:'Invalid post ID'});
        }
        const deletePost = await Post.findByIdAndDelete(id);
        if(!deletePost){
            return res.status(404).json({message:'Post not found'});
        }
        res.json({message:'Post deleted successfully'});
    } catch(err) {
        res.status(500).json({message:err.message});
    }
});


app.listen(PORT,() => {
    console.log(`Server is running on http://localhost:${PORT}`)
});