const express = require('express');
const router = express.Router();
const { all, get, run } = require('../database/helpers');
const { authRequired } = require('../middleware/auth');

// GET /api/notifications - 获取通知列表
router.get('/', authRequired, (req, res) => {
  const { type = 'all', read, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let whereClause = 'WHERE user_id = ?';
  const params = [req.user.id];

  if (type !== 'all') {
    whereClause += ' AND type = ?';
    params.push(type);
  }
  if (read !== undefined) {
    whereClause += ' AND is_read = ?';
    params.push(read === 'true' ? 1 : 0);
  }

  const totalResult = get(`SELECT COUNT(*) as count FROM notifications ${whereClause}`, params);
  const total = totalResult ? totalResult.count : 0;

  const unreadResult = get('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0', [req.user.id]);
  const unreadCount = unreadResult ? unreadResult.count : 0;

  const notifications = all(`
    SELECT * FROM notifications ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `, [...params, parseInt(limit), offset]);

  const formatted = notifications.map(n => ({
    id: n.id,
    type: n.type,
    title: n.title,
    content: n.content,
    data: JSON.parse(n.data || '{}'),
    isRead: !!n.is_read,
    createdAt: n.created_at
  }));

  res.json({
    code: 200,
    data: { notifications: formatted, unreadCount, pagination: { page: parseInt(page), limit: parseInt(limit), total } }
  });
});

// PUT /api/notifications/read-all - 标记全部已读（必须在 /:id/read 之前，否则会被参数路由拦截）
router.put('/read-all', authRequired, (req, res) => {
  run('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]);
  res.json({ code: 200, message: '全部已读' });
});

// PUT /api/notifications/:id/read - 标记单条已读
router.put('/:id/read', authRequired, (req, res) => {
  run('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  res.json({ code: 200, message: '标记已读' });
});

// GET /api/notifications/unread-count - 获取未读数量
router.get('/unread-count', authRequired, (req, res) => {
  const result = get('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0', [req.user.id]);
  res.json({ code: 200, data: { count: result ? result.count : 0 } });
});

module.exports = router;
