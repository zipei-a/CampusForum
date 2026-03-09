const express = require('express');
const router = express.Router();
const { all, get, run } = require('../database/helpers');
const { authRequired } = require('../middleware/auth');

// GET /api/jobs - 获取兼职列表
router.get('/', (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const jobs = all(`
    SELECT j.*, u.username as publisher_name, u.avatar as publisher_avatar,
      (SELECT COUNT(*) FROM job_applications WHERE job_id = j.id) as apply_count
    FROM jobs j
    JOIN users u ON j.publisher_id = u.id
    ORDER BY j.created_at DESC
    LIMIT ? OFFSET ?
  `, [parseInt(limit), offset]);

  const total = get('SELECT COUNT(*) as count FROM jobs');

  res.json({
    success: true,
    data: { jobs, total: total.count, page: parseInt(page), limit: parseInt(limit) }
  });
});

// POST /api/jobs - 发布兼职
router.post('/', authRequired, (req, res) => {
  const { title, description, contact, salary, location } = req.body;
  if (!title || !description || !contact) {
    return res.status(400).json({ success: false, message: '标题、描述和联系方式为必填项' });
  }

  const result = run(
    'INSERT INTO jobs (title, description, contact, salary, location, publisher_id) VALUES (?, ?, ?, ?, ?, ?)',
    [title.trim(), description.trim(), contact.trim(), (salary || '').trim(), (location || '').trim(), req.user.id]
  );

  res.json({ success: true, data: { id: result.lastInsertRowid } });
});

// POST /api/jobs/:id/apply - 报名兼职
router.post('/:id/apply', authRequired, (req, res) => {
  const jobId = parseInt(req.params.id);
  const { name, phone, message } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ success: false, message: '姓名和电话为必填项' });
  }

  const job = get('SELECT * FROM jobs WHERE id = ?', [jobId]);
  if (!job) {
    return res.status(404).json({ success: false, message: '兼职不存在' });
  }

  // 检查是否已报名
  const existing = get('SELECT id FROM job_applications WHERE job_id = ? AND user_id = ?', [jobId, req.user.id]);
  if (existing) {
    return res.status(400).json({ success: false, message: '你已经报名过了' });
  }

  run(
    'INSERT INTO job_applications (job_id, user_id, name, phone, message) VALUES (?, ?, ?, ?, ?)',
    [jobId, req.user.id, name.trim(), phone.trim(), (message || '').trim()]
  );

  res.json({ success: true, message: '报名成功' });
});

// DELETE /api/jobs/:id - 删除兼职（仅发布者）
router.delete('/:id', authRequired, (req, res) => {
  const jobId = parseInt(req.params.id);
  const job = get('SELECT * FROM jobs WHERE id = ?', [jobId]);

  if (!job) {
    return res.status(404).json({ success: false, message: '兼职不存在' });
  }
  if (job.publisher_id !== req.user.id) {
    return res.status(403).json({ success: false, message: '只能删除自己发布的兼职' });
  }

  run('DELETE FROM jobs WHERE id = ?', [jobId]);
  res.json({ success: true, message: '删除成功' });
});

module.exports = router;
