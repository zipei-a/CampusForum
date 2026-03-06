const express = require('express');
const router = express.Router();
const { all, get } = require('../database/helpers');

// GET /api/search - 搜索帖子
router.get('/', (req, res) => {
  const { keyword, type = 'post', page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  if (!keyword) {
    return res.status(400).json({ code: 400, message: '请输入搜索关键词' });
  }

  const likeKeyword = `%${keyword}%`;

  if (type === 'user') {
    const users = all('SELECT id, username, avatar, bio FROM users WHERE username LIKE ? LIMIT ? OFFSET ?', [likeKeyword, parseInt(limit), offset]);
    return res.json({ code: 200, data: { users } });
  }

  const totalResult = get('SELECT COUNT(*) as count FROM posts WHERE title LIKE ? OR content LIKE ?', [likeKeyword, likeKeyword]);
  const total = totalResult ? totalResult.count : 0;

  const posts = all(`
    SELECT p.*, u.username as author_name, u.avatar as author_avatar, c.name as category_name
    FROM posts p
    JOIN users u ON p.author_id = u.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.title LIKE ? OR p.content LIKE ?
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `, [likeKeyword, likeKeyword, parseInt(limit), offset]);

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
