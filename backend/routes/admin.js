const express = require('express');
const router = express.Router();
const { all, get, run } = require('../database/helpers');
const { authRequired, adminRequired } = require('../middleware/auth');

// 所有管理员路由都需要登录 + 管理员权限
router.use(authRequired, adminRequired);

// GET /api/admin/stats - 获取管理后台统计数据
router.get('/stats', (req, res) => {
  const userCount = get('SELECT COUNT(*) as count FROM users');
  const postCount = get('SELECT COUNT(*) as count FROM posts');
  const commentCount = get('SELECT COUNT(*) as count FROM comments');
  const jobCount = get('SELECT COUNT(*) as count FROM jobs');

  res.json({
    code: 200,
    data: {
      userCount: userCount.count,
      postCount: postCount.count,
      commentCount: commentCount.count,
      jobCount: jobCount.count
    }
  });
});

// GET /api/admin/posts - 获取所有帖子（管理用）
router.get('/posts', (req, res) => {
  const { page = 1, limit = 20, keyword } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const params = [];

  let whereClause = '';
  if (keyword) {
    whereClause = 'WHERE p.title LIKE ? OR p.content LIKE ?';
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  const total = get(`SELECT COUNT(*) as count FROM posts p ${whereClause}`, params);
  const posts = all(`
    SELECT p.id, p.title, p.created_at, p.view_count, p.like_count, p.comment_count,
           u.username as author_name, c.name as category_name
    FROM posts p
    JOIN users u ON p.author_id = u.id
    LEFT JOIN categories c ON p.category_id = c.id
    ${whereClause}
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `, [...params, parseInt(limit), offset]);

  res.json({
    code: 200,
    data: {
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total.count,
        totalPages: Math.ceil(total.count / parseInt(limit))
      }
    }
  });
});

// DELETE /api/admin/posts/:id - 管理员删除帖子
router.delete('/posts/:id', (req, res) => {
  const post = get('SELECT * FROM posts WHERE id = ?', [req.params.id]);
  if (!post) return res.status(404).json({ code: 404, message: '帖子不存在' });

  run('DELETE FROM likes WHERE target_type = ? AND target_id = ?', ['post', post.id]);
  run('DELETE FROM notifications WHERE data LIKE ?', [`%"postId":${post.id}%`]);
  run('DELETE FROM posts WHERE id = ?', [req.params.id]);

  res.json({ code: 200, message: '删除成功' });
});

// GET /api/admin/comments - 获取所有评论（管理用）
router.get('/comments', (req, res) => {
  const { page = 1, limit = 20, keyword } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const params = [];

  let whereClause = '';
  if (keyword) {
    whereClause = 'WHERE c.content LIKE ?';
    params.push(`%${keyword}%`);
  }

  const total = get(`SELECT COUNT(*) as count FROM comments c ${whereClause}`, params);
  const comments = all(`
    SELECT c.id, c.content, c.created_at, c.like_count,
           u.username as author_name, p.title as post_title, p.id as post_id
    FROM comments c
    JOIN users u ON c.author_id = u.id
    JOIN posts p ON c.post_id = p.id
    ${whereClause}
    ORDER BY c.created_at DESC
    LIMIT ? OFFSET ?
  `, [...params, parseInt(limit), offset]);

  res.json({
    code: 200,
    data: {
      comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total.count,
        totalPages: Math.ceil(total.count / parseInt(limit))
      }
    }
  });
});

// DELETE /api/admin/comments/:id - 管理员删除评论
router.delete('/comments/:id', (req, res) => {
  const comment = get('SELECT * FROM comments WHERE id = ?', [req.params.id]);
  if (!comment) return res.status(404).json({ code: 404, message: '评论不存在' });

  run('DELETE FROM comments WHERE id = ?', [req.params.id]);
  run('UPDATE posts SET comment_count = MAX(0, comment_count - 1) WHERE id = ?', [comment.post_id]);

  res.json({ code: 200, message: '删除成功' });
});

// GET /api/admin/jobs - 获取所有兼职信息（管理用）
router.get('/jobs', (req, res) => {
  const { page = 1, limit = 20, keyword } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const params = [];

  let whereClause = '';
  if (keyword) {
    whereClause = 'WHERE j.title LIKE ? OR j.description LIKE ?';
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  const total = get(`SELECT COUNT(*) as count FROM jobs j ${whereClause}`, params);
  const jobs = all(`
    SELECT j.id, j.title, j.salary, j.location, j.status, j.created_at,
           u.username as publisher_name,
           (SELECT COUNT(*) FROM job_applications WHERE job_id = j.id) as apply_count
    FROM jobs j
    JOIN users u ON j.publisher_id = u.id
    ${whereClause}
    ORDER BY j.created_at DESC
    LIMIT ? OFFSET ?
  `, [...params, parseInt(limit), offset]);

  res.json({
    code: 200,
    data: {
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total.count,
        totalPages: Math.ceil(total.count / parseInt(limit))
      }
    }
  });
});

// DELETE /api/admin/jobs/:id - 管理员删除兼职
router.delete('/jobs/:id', (req, res) => {
  const jobId = parseInt(req.params.id);
  const job = get('SELECT * FROM jobs WHERE id = ?', [jobId]);
  if (!job) return res.status(404).json({ code: 404, message: '兼职不存在' });

  run('DELETE FROM jobs WHERE id = ?', [jobId]);
  res.json({ code: 200, message: '删除成功' });
});

module.exports = router;
