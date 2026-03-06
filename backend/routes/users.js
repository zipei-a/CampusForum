const express = require('express');
const router = express.Router();
const { all, get, run } = require('../database/helpers');
const { authRequired } = require('../middleware/auth');

// GET /api/users/:id - 获取用户信息
router.get('/:id', (req, res) => {
  const user = get('SELECT id, username, avatar, email, bio, created_at FROM users WHERE id = ?', [req.params.id]);

  if (!user) return res.status(404).json({ code: 404, message: '用户不存在' });

  const postCount = get('SELECT COUNT(*) as count FROM posts WHERE author_id = ?', [user.id]);
  res.json({ code: 200, data: { ...user, postCount: postCount ? postCount.count : 0 } });
});

// PUT /api/users/:id - 更新用户信息
router.put('/:id', authRequired, (req, res) => {
  if (req.user.id !== parseInt(req.params.id)) {
    return res.status(403).json({ code: 403, message: '无权限修改' });
  }

  const { avatar, bio, email } = req.body;
  run(
    'UPDATE users SET avatar = COALESCE(?, avatar), bio = COALESCE(?, bio), email = COALESCE(?, email), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [avatar, bio, email, req.params.id]
  );

  res.json({ code: 200, message: '更新成功' });
});

// GET /api/users/:id/posts - 获取用户发布的帖子
router.get('/:id/posts', (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const totalResult = get('SELECT COUNT(*) as count FROM posts WHERE author_id = ?', [req.params.id]);
  const total = totalResult ? totalResult.count : 0;

  const posts = all(`
    SELECT p.*, c.name as category_name
    FROM posts p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.author_id = ?
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `, [req.params.id, parseInt(limit), offset]);

  const user = get('SELECT username, avatar FROM users WHERE id = ?', [req.params.id]);

  const formattedPosts = posts.map(p => ({
    id: p.id,
    title: p.title,
    summary: p.summary || p.content.substring(0, 100),
    content: p.content,
    author: { id: parseInt(req.params.id), username: user?.username, avatar: user?.avatar },
    category: { id: p.category_id, name: p.category_name },
    viewCount: p.view_count,
    likeCount: p.like_count,
    commentCount: p.comment_count,
    createdAt: p.created_at
  }));

  res.json({
    code: 200,
    data: {
      posts: formattedPosts,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) }
    }
  });
});

// GET /api/users/:id/favorites - 获取用户收藏的帖子
router.get('/:id/favorites', authRequired, (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const totalResult = get('SELECT COUNT(*) as count FROM favorites WHERE user_id = ?', [req.params.id]);
  const total = totalResult ? totalResult.count : 0;

  const posts = all(`
    SELECT p.*, u.username as author_name, u.avatar as author_avatar, c.name as category_name
    FROM posts p
    JOIN favorites f ON p.id = f.post_id
    JOIN users u ON p.author_id = u.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE f.user_id = ?
    ORDER BY f.created_at DESC
    LIMIT ? OFFSET ?
  `, [req.params.id, parseInt(limit), offset]);

  const formattedPosts = posts.map(p => ({
    id: p.id,
    title: p.title,
    summary: p.summary || p.content.substring(0, 100),
    author: { id: p.author_id, username: p.author_name, avatar: p.author_avatar },
    category: { id: p.category_id, name: p.category_name },
    viewCount: p.view_count,
    likeCount: p.like_count,
    commentCount: p.comment_count,
    createdAt: p.created_at
  }));

  res.json({
    code: 200,
    data: {
      posts: formattedPosts,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) }
    }
  });
});

module.exports = router;
