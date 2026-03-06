const express = require('express');
const router = express.Router();
const { get, run } = require('../database/helpers');
const { authRequired } = require('../middleware/auth');

// DELETE /api/comments/:id - 删除评论
router.delete('/:id', authRequired, (req, res) => {
  const comment = get('SELECT * FROM comments WHERE id = ?', [req.params.id]);

  if (!comment) return res.status(404).json({ code: 404, message: '评论不存在' });
  if (comment.author_id !== req.user.id) return res.status(403).json({ code: 403, message: '无权限删除此评论' });

  run('DELETE FROM comments WHERE id = ?', [req.params.id]);
  run('UPDATE posts SET comment_count = MAX(0, comment_count - 1) WHERE id = ?', [comment.post_id]);

  res.json({ code: 200, message: '删除成功' });
});

// POST /api/comments/:id/like - 点赞/取消点赞评论
router.post('/:id/like', authRequired, (req, res) => {
  const comment = get('SELECT id, like_count FROM comments WHERE id = ?', [req.params.id]);
  if (!comment) return res.status(404).json({ code: 404, message: '评论不存在' });

  const existing = get('SELECT 1 as v FROM likes WHERE user_id = ? AND target_type = ? AND target_id = ?', [req.user.id, 'comment', comment.id]);

  if (existing) {
    run('DELETE FROM likes WHERE user_id = ? AND target_type = ? AND target_id = ?', [req.user.id, 'comment', comment.id]);
    run('UPDATE comments SET like_count = MAX(0, like_count - 1) WHERE id = ?', [comment.id]);
  } else {
    run('INSERT INTO likes (user_id, target_type, target_id) VALUES (?, ?, ?)', [req.user.id, 'comment', comment.id]);
    run('UPDATE comments SET like_count = like_count + 1 WHERE id = ?', [comment.id]);
  }

  res.json({ code: 200, data: { isLiked: !existing } });
});

module.exports = router;
