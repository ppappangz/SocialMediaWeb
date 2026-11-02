const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');
const { sequelize, Post, Comment, initDB } = require('./database');

const app = express();
const port = 3000;
const SALT_ROUNDS = 10;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

const { DataTypes } = require('sequelize');
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
});
//การสมัครลงทะเบียน
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password || password.length < 6) {
        return res.status(400).json({ error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน (ขั้นต่ำ 6 ตัวอักษร)' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const newUser = await User.create({
            username: username,
            password: hashedPassword
        });

        res.status(201).json({ 
            success: true, 
            message: 'ลงทะเบียนสำเร็จ', 
            user: { username: newUser.username } 
        });

    } catch (error) {
        console.error('Registration error:', error);
        
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: 'ชื่อผู้ใช้นี้ถูกใช้แล้ว' });
        }
        
        res.status(500).json({ error: 'ไม่สามารถลงทะเบียนผู้ใช้ได้' });
    }
});
//การล็อกอิน
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            res.status(200).json({ success: true, message: 'ล็อกอินสำเร็จ', username: user.username });
        } else {
            res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์ขณะล็อกอิน' });
    }
});
//สร้างโพสต์ใหม่ 
app.post('/api/posts', async (req, res) => {
    const { username, content } = req.body; 
    try {
        // กำหนด retweetCount เป็น 0 ด้วย
        const newPost = await Post.create({ username, content, likes: 0, retweetCount: 0 }); 
        res.status(201).json(newPost);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'ไม่สามารถสร้างโพสต์ได้' });
    }
});
//ดึงโพสต์ทั้งหมด(รวม Comment ด้วย) 
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await Post.findAll({
            order: [['createdAt', 'DESC']], 
            include: [{ model: Comment, attributes: ['commenter', 'commentText', 'createdAt'] }]
        });
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'ไม่สามารถโหลดฟีดได้' });
    }
});

// Comment 
app.post('/api/posts/:postId/comments', async (req, res) => {
    const { postId } = req.params;
    const { commenter, commentText } = req.body;
    try {
        const newComment = await Comment.create({ 
            PostId: postId, 
            commenter, 
            commentText 
        });
        res.status(201).json(newComment);
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: 'ไม่สามารถส่งความคิดเห็นได้' });
    }
});

// **API สำหรับ Like/Unlike Post (Real-time Update)**
app.post('/api/posts/:postId/like', async (req, res) => {
    const { postId } = req.params;
    const { action } = req.body; // 'like' หรือ 'unlike'
    
    try {
        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        let newLikes = post.likes;
        
        // Mocking Like Logic: 
        if (action === 'like') {
            newLikes += 1;
        } else if (action === 'unlike' && newLikes > 0) {
            newLikes -= 1;
        }
        
        await post.update({ likes: newLikes });

        // ส่งจำนวนไลค์ใหม่กลับไป
        res.status(200).json({ success: true, newLikes }); 
        
    } catch (error) {
        console.error('Like error:', error);
        res.status(500).json({ error: 'ไม่สามารถดำเนินการกดไลค์ได้' });
    }
});

// **API สำหรับ Retweet/Unretweet Post (Real-time Update)**
app.post('/api/posts/:postId/retweet', async (req, res) => {
    const { postId } = req.params;
    const { action } = req.body; // 'retweet' หรือ 'unretweet'
    
    try {
        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        let newRetweets = post.retweetCount;
        
        // Mocking Retweet Logic:
        if (action === 'retweet') {
            newRetweets += 1;
        } else if (action === 'unretweet' && newRetweets > 0) {
            newRetweets -= 1;
        }
        
        await post.update({ retweetCount: newRetweets });

        // ส่งจำนวนรีโพสต์ใหม่กลับไป
        res.status(200).json({ success: true, newRetweets }); 
        
    } catch (error) {
        console.error('Retweet error:', error);
        res.status(500).json({ error: 'ไม่สามารถดำเนินการรีโพสต์ได้' });
    }
});

async function startServer() {
    await initDB(); 
    await User.sync({ alter: true }); 
    
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}

startServer();