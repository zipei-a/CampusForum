const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { all, get, run } = require('../database/helpers');
const { authRequired, JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/register - 用户注册
router.post('/register', (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password) {
    return res.status(400).json({ code: 400, message: '用户名和密码不能为空' });
  }
  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ code: 400, message: '用户名长度需在3-20字符之间' });
  }
  if (password.length < 6 || password.length > 20) {
    return res.status(400).json({ code: 400, message: '密码长度需在6-20字符之间' });
  }

  // 检查用户名是否已存在
  const existing = get('SELECT id FROM users WHERE username = ?', [username]);
  if (existing) {
    return res.status(400).json({ code: 400, message: '用户名已存在' });
  }

  // 加密密码并创建用户
  const hashedPassword = bcrypt.hashSync(password, 10);
  const result = run(
    'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
    [username, hashedPassword, email || '']
  );

  const user = { id: result.lastInsertRowid, username, email: email || '' };
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

  res.status(201).json({
    code: 201,
    message: '注册成功',
    data: {
      user: { id: user.id, username: user.username, email: user.email, createdAt: new Date().toISOString() },
      token
    }
  });
});

// POST /api/auth/login - 用户登录
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ code: 400, message: '用户名和密码不能为空' });
  }

  const user = get('SELECT * FROM users WHERE username = ?', [username]);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ code: 400, message: '用户名或密码错误' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    code: 200,
    message: '登录成功',
    data: {
      user: {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        email: user.email
      },
      token
    }
  });
});

// GET /api/auth/me - 获取当前用户信息
router.get('/me', authRequired, (req, res) => {
  const user = get('SELECT id, username, avatar, email, bio, created_at FROM users WHERE id = ?', [req.user.id]);

  if (!user) {
    return res.status(404).json({ code: 404, message: '用户不存在' });
  }

  const postCount = get('SELECT COUNT(*) as count FROM posts WHERE author_id = ?', [user.id]);

  res.json({
    code: 200,
    data: { ...user, postCount: postCount.count }
  });
});

// POST /api/auth/logout - 退出登录
router.post('/logout', authRequired, (req, res) => {
  res.json({ code: 200, message: '退出成功' });
});

module.exports = router;
