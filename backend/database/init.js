const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'campus_forum.db');

let db;

async function initDatabase() {
  if (db) return db;

  const SQL = await initSqlJs();

  // 如果数据库文件已存在，读取它
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON');

  initTables();
  migrateDatabase();
  seedData();
  saveDatabase(); // 保存初始数据

  return db;
}

function getDb() {
  if (!db) {
    throw new Error('数据库未初始化，请先调用 initDatabase()');
  }
  return db;
}

function saveDatabase() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

// 定期自动保存（每30秒）
setInterval(() => {
  if (db) saveDatabase();
}, 30000);

function migrateDatabase() {
  // 为已有数据库添加 cover_image 列
  try {
    const columns = db.exec("PRAGMA table_info(users)");
    if (columns.length > 0) {
      const colNames = columns[0].values.map(row => row[1]);
      if (!colNames.includes('cover_image')) {
        db.run("ALTER TABLE users ADD COLUMN cover_image VARCHAR(255) DEFAULT ''");
      }
      if (!colNames.includes('role')) {
        db.run("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user'");
        // 将 admin 用户设为管理员
        db.run("UPDATE users SET role = 'admin' WHERE username = 'admin'");
      }
    }
  } catch (e) {
    console.log('数据库迁移跳过:', e.message);
  }
}

function initTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      email VARCHAR(100) DEFAULT '',
      avatar VARCHAR(255) DEFAULT '',
      cover_image VARCHAR(255) DEFAULT '',
      bio TEXT DEFAULT '',
      role VARCHAR(20) DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(50) UNIQUE NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title VARCHAR(100) NOT NULL,
      content TEXT NOT NULL,
      summary VARCHAR(200) DEFAULT '',
      author_id INTEGER NOT NULL,
      category_id INTEGER DEFAULT 1,
      view_count INTEGER DEFAULT 0,
      like_count INTEGER DEFAULT 0,
      comment_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content VARCHAR(500) NOT NULL,
      post_id INTEGER NOT NULL,
      author_id INTEGER NOT NULL,
      reply_to INTEGER DEFAULT NULL,
      like_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (author_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(20) UNIQUE NOT NULL,
      post_count INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS post_tags (
      post_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (post_id, tag_id),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS favorites (
      user_id INTEGER NOT NULL,
      post_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, post_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS likes (
      user_id INTEGER NOT NULL,
      target_type VARCHAR(10) NOT NULL,
      target_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, target_type, target_id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type VARCHAR(20) NOT NULL,
      title VARCHAR(100) NOT NULL,
      content TEXT DEFAULT '',
      data TEXT DEFAULT '{}',
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      contact VARCHAR(100) NOT NULL,
      salary VARCHAR(50) DEFAULT '',
      location VARCHAR(100) DEFAULT '',
      publisher_id INTEGER NOT NULL,
      status VARCHAR(10) DEFAULT 'open',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (publisher_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS job_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      name VARCHAR(50) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      message TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
}

function seedData() {
  // 检查是否已有数据
  const result = db.exec('SELECT COUNT(*) as count FROM users');
  const userCount = result.length > 0 ? result[0].values[0][0] : 0;
  if (userCount > 0) return;

  // 插入默认分类
  const defaultCategories = ['全部', '学习交流', '生活分享', '活动通知', '问题求助', '兴趣爱好'];
  for (const name of defaultCategories) {
    db.run('INSERT INTO categories (name) VALUES (?)', [name]);
  }

  // 插入默认标签
  const defaultTags = [
    ['前端开发', 15], ['后端开发', 12], ['考研', 20],
    ['就业', 18], ['社团', 8], ['比赛', 10]
  ];
  for (const [name, count] of defaultTags) {
    db.run('INSERT INTO tags (name, post_count) VALUES (?, ?)', [name, count]);
  }

  // 插入测试用户（密码加密）
  const adminHash = bcrypt.hashSync('123456', 10);
  const testHash = bcrypt.hashSync('test123', 10);
  db.run('INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)', ['admin', adminHash, 'admin@campus.com', 'admin']);
  db.run('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', ['test', testHash, 'test@campus.com']);

  // 插入示例帖子
  db.run(
    'INSERT INTO posts (title, content, author_id, category_id, created_at) VALUES (?, ?, ?, ?, ?)',
    ['欢迎加入校园论坛', '这里是同学们交流的平台，希望大家遵守规则，文明发言~', 1, 4, '2024-06-01']
  );
  db.run(
    'INSERT INTO posts (title, content, author_id, category_id, created_at) VALUES (?, ?, ?, ?, ?)',
    ['期末复习资料分享', '高数、英语、专业课的复习重点和习题已上传，需要的同学自取~', 2, 2, '2024-06-02']
  );

  // 插入示例评论
  db.run(
    'INSERT INTO comments (content, post_id, author_id, created_at) VALUES (?, ?, ?, ?)',
    ['期待和大家交流！', 1, 2, '2024-06-01']
  );

  // 更新帖子评论数
  db.run('UPDATE posts SET comment_count = 1 WHERE id = 1');

  // 插入示例兼职信息
  const sampleJobs = [
    ['校园快递代取', '帮忙从菜鸟驿站取快递送到宿舍楼下，每单5元，多劳多得。工作时间灵活，适合课余时间做。', '微信: campus_express', '5元/单', '菜鸟驿站'],
    ['周末传单派发', '协助学校周边商家发放宣传传单，工作轻松，日结工资。需要性格开朗、有责任心的同学。', '13800138000', '120元/天', '学校南门'],
    ['食堂兼职服务员', '中午11:00-13:00在二食堂帮忙打饭、收餐盘，包午餐，适合中午没课的同学。', 'QQ: 123456789', '30元/次 + 包餐', '二食堂']
  ];
  for (const [title, description, contact, salary, location] of sampleJobs) {
    db.run(
      'INSERT INTO jobs (title, description, contact, salary, location, publisher_id) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, contact, salary, location, 1]
    );
  }

  console.log('数据库初始化完成：已插入默认数据');
}

module.exports = { initDatabase, getDb, saveDatabase };
