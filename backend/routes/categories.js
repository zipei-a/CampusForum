const express = require('express');
const router = express.Router();
const { all } = require('../database/helpers');

// GET /api/categories - 获取分类列表
router.get('/', (req, res) => {
  const categories = all(`
    SELECT c.id, c.name, 
      (SELECT COUNT(*) FROM posts WHERE category_id = c.id) as postCount
    FROM categories c
    ORDER BY c.id ASC
  `);

  res.json({ code: 200, data: categories });
});

module.exports = router;
