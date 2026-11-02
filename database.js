const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('social_hub', 'root', '', {
    host: 'localhost', 
    dialect: 'mysql', 
    logging: false, 
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

const Post = sequelize.define('Post', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
 
    likes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    // **เพิ่มฟิลด์ Retweet Count**
    retweetCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
});

const Comment = sequelize.define('Comment', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    commenter: { 
        type: DataTypes.STRING,
        allowNull: false
    },
    commentText: { 
        type: DataTypes.TEXT,
        allowNull: false
    }
});

Post.hasMany(Comment, { onDelete: 'CASCADE' }); 
Comment.belongsTo(Post);

async function initDB() {
    try {
        await sequelize.authenticate();
        console.log('✅ MySQL connection established successfully.');
        
        await sequelize.sync({ force: true }); 
        console.log('✅ Database models synchronized.');

        const count = await Post.count();
        if (count === 0) {
            await Post.bulkCreate([
                // เพิ่ม retweetCount: 0 ในข้อมูลเริ่มต้น
                { username: "JettKorat", content: "แพลต-ได ขาด 2 เล่นชิลๆ VRK3JK #valorant #หาเพื่อนเล่นเกม", likes: 5, retweetCount: 2},
                { username: "travel_guru", content: "หน้าหนาวมา ทริปญปก็ต้องมา !! ใครมีแพลนไปเที่ยวญปบ้างคะ หาเพื่อนออกทริป มาจอยกันน้าาา #travel", likes: 10, retweetCount: 1},
                { username: "dev_life", content: "ใครทำโค้ด html เป็นบ้างครับบ คอมเม้นท์ที TwT #coder #developers", likes: 0, retweetCount: 0}
            ]);
            console.log('posts created.');
        }

    } catch (error) {
        console.error('Unable to connect to the MySQL database', error);
    }
}

module.exports = {
    sequelize,
    Post,
    Comment,
    initDB
};