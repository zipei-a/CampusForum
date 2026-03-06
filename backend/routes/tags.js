const express = require('express');
const router = express.Router();
const { all, get, run } = require('../database/helpers');
const { authRequired } = require('../middleware/auth');

// GET /api/tags - 获取标签列表
router.get('/', (req, res) => {
  const { hot, limit = 20 } = req.query;

  let sql = 'SELECT * FROM tags';
  sql += hot === 'true' ? ' ORDER BY post_count DESC' : ' ORDER BY id ASC';
  sql += ' LIMIT ?';

  const tags = all(sql, [parseInt(limit)]);
  res.json({ code: 200, data: tags });
});

// POST /api/tags - 创建标签
router.post('/', authRequired, (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ code: 400, message: '标签名不能为空' });
  }

  const trimmed = name.trim();
  const existing = get('SELECT * FROM tags WHERE name = ?', [trimmed]);

  if (existing) {
    return res.json({ code: 200, data: existing });
  }

  const result = run('INSERT INTO tags (name, post_count) VALUES (?, 0)', [trimmed]);
  res.status(201).json({
    code: 201,
    data: { id: result.lastInsertRowid, name: trimmed, post_count: 0 }
  });
});

// GET /api/tags/:name/posts - 获取标签下的帖子
router.get('/:name/posts', (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const posts = all(`
    SELECT p.*, u.username as author_name, c.name as category_name
    FROM posts p
    JOIN users u ON p.author_id = u.id
    LEFT JOIN categories c ON p.category_id = c.id
    JOIN post_tags pt ON p.id = pt.post_id
    JOIN tags t ON pt.tag_id = t.id
    WHERE t.name = ?
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `, [req.params.name, parseInt(limit), offset]);

  const formattedPosts = posts.map(p => ({
    id: p.id,
    title: p.title,
    summary: p.summary || p.content.substring(0, 100),
    author: { id: p.author_id, username: p.author_name },
    category: { id: p.category_id, name: p.category_name },
    viewCount: p.view_count,
    likeCount: p.like_count,
    commentCount: p.comment_count,
    createdAt: p.created_at
  }));

  res.json({ code: 200, data: { posts: formattedPosts } });
});

module.exports = router;
