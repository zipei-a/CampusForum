const express = require('express');
const router = express.Router();
const { all, get, run } = require('../database/helpers');
const { authRequired, authOptional } = require('../middleware/auth');

// GET /api/posts - 获取帖子列表
router.get('/', authOptional, (req, res) => {
  const { page = 1, limit = 10, category, tag, keyword, sort = 'latest' } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let whereClause = 'WHERE 1=1';
  const params = [];

  if (category && category != '1') {
    whereClause += ' AND p.category_id = ?';
    params.push(parseInt(category));
  }

  if (keyword) {
    whereClause += ' AND (p.title LIKE ? OR p.content LIKE ?)';
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  let joinClause = '';
  if (tag) {
    joinClause = ' JOIN post_tags pt ON p.id = pt.post_id JOIN tags t ON pt.tag_id = t.id';
    whereClause += ' AND t.name = ?';
    params.push(tag);
  }

  const orderClause = sort === 'popular' ? 'ORDER BY p.view_count DESC' : 'ORDER BY p.created_at DESC';

  // 查询总数
  const countResult = get(`SELECT COUNT(DISTINCT p.id) as total FROM posts p ${joinClause} ${whereClause}`, params);
  const total = countResult ? countResult.total : 0;

  // 查询帖子列表
  const posts = all(`
    SELECT DISTINCT p.*, u.username as author_name, u.avatar as author_avatar, c.name as category_name
    FROM posts p
    JOIN users u ON p.author_id = u.id
    LEFT JOIN categories c ON p.category_id = c.id
    ${joinClause}
    ${whereClause}
    ${orderClause}
    LIMIT ? OFFSET ?
  `, [...params, parseInt(limit), offset]);

  const formattedPosts = posts.map(post => {
    const tags = all('SELECT t.id, t.name FROM tags t JOIN post_tags pt ON t.id = pt.tag_id WHERE pt.post_id = ?', [post.id]);

    let isLiked = false, isFavorited = false;
    if (req.user) {
      isLiked = !!get('SELECT 1 as v FROM likes WHERE user_id = ? AND target_type = ? AND target_id = ?', [req.user.id, 'post', post.id]);
      isFavorited = !!get('SELECT 1 as v FROM favorites WHERE user_id = ? AND post_id = ?', [req.user.id, post.id]);
    }

    return {
      id: post.id,
      title: post.title,
      summary: post.summary || post.content.substring(0, 100),
      content: post.content,
      author: { id: post.author_id, username: post.author_name, avatar: post.author_avatar },
      category: { id: post.category_id, name: post.category_name },
      tags,
      viewCount: post.view_count,
      likeCount: post.like_count,
      commentCount: post.comment_count,
      isLiked,
      isFavorited,
      createdAt: post.created_at,
      updatedAt: post.updated_at
    };
  });

  res.json({
    code: 200,
    data: {
      posts: formattedPosts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

// GET /api/posts/:id - 获取帖子详情
router.get('/:id', authOptional, (req, res) => {
  const post = get(`
    SELECT p.*, u.username as author_name, u.avatar as author_avatar, c.name as category_name
    FROM posts p
    JOIN users u ON p.author_id = u.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `, [req.params.id]);

  if (!post) {
    return res.status(404).json({ code: 404, message: '帖子不存在' });
  }

  // 增加浏览量
  run('UPDATE posts SET view_count = view_count + 1 WHERE id = ?', [post.id]);

  const tags = all('SELECT t.id, t.name FROM tags t JOIN post_tags pt ON t.id = pt.tag_id WHERE pt.post_id = ?', [post.id]);

  let isLiked = false, isFavorited = false;
  if (req.user) {
    isLiked = !!get('SELECT 1 as v FROM likes WHERE user_id = ? AND target_type = ? AND target_id = ?', [req.user.id, 'post', post.id]);
    isFavorited = !!get('SELECT 1 as v FROM favorites WHERE user_id = ? AND post_id = ?', [req.user.id, post.id]);
  }

  res.json({
    code: 200,
    data: {
      id: post.id,
      title: post.title,
      content: post.content,
      summary: post.summary,
      author: { id: post.author_id, username: post.author_name, avatar: post.author_avatar },
      category: { id: post.category_id, name: post.category_name },
      tags,
      viewCount: post.view_count + 1,
      likeCount: post.like_count,
      commentCount: post.comment_count,
      isLiked,
      isFavorited,
      createdAt: post.created_at,
      updatedAt: post.updated_at
    }
  });
});

// POST /api/posts - 创建帖子
router.post('/', authRequired, (req, res) => {
  const { title, content, summary, categoryId, tags } = req.body;

  if (!title || !content) {
    return res.status(400).json({ code: 400, message: '标题和内容不能为空' });
  }

  const result = run(
    'INSERT INTO posts (title, content, summary, author_id, category_id) VALUES (?, ?, ?, ?, ?)',
    [title, content, summary || content.substring(0, 100), req.user.id, categoryId || 1]
  );

  const postId = result.lastInsertRowid;

  // 处理标签
  if (tags && Array.isArray(tags)) {
    for (const tagName of tags) {
      if (!tagName || !tagName.trim()) continue;
      const trimmed = tagName.trim();

      let tag = get('SELECT id FROM tags WHERE name = ?', [trimmed]);
      if (!tag) {
        const r = run('INSERT INTO tags (name, post_count) VALUES (?, 1)', [trimmed]);
        tag = { id: r.lastInsertRowid };
      } else {
        run('UPDATE tags SET post_count = post_count + 1 WHERE id = ?', [tag.id]);
      }

      run('INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)', [postId, tag.id]);
    }
  }

  res.status(201).json({
    code: 201,
    message: '发布成功',
    data: { id: postId, title, createdAt: new Date().toISOString() }
  });
});

// PUT /api/posts/:id - 更新帖子
router.put('/:id', authRequired, (req, res) => {
  const post = get('SELECT * FROM posts WHERE id = ?', [req.params.id]);

  if (!post) return res.status(404).json({ code: 404, message: '帖子不存在' });
  if (post.author_id !== req.user.id) return res.status(403).json({ code: 403, message: '无权限修改此帖子' });

  const { title, content, summary, categoryId } = req.body;
  run(
    'UPDATE posts SET title = COALESCE(?, title), content = COALESCE(?, content), summary = COALESCE(?, summary), category_id = COALESCE(?, category_id), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [title, content, summary, categoryId, req.params.id]
  );

  res.json({ code: 200, message: '更新成功' });
});

// DELETE /api/posts/:id - 删除帖子
router.delete('/:id', authRequired, (req, res) => {
  const post = get('SELECT * FROM posts WHERE id = ?', [req.params.id]);

  if (!post) return res.status(404).json({ code: 404, message: '帖子不存在' });
  if (post.author_id !== req.user.id) return res.status(403).json({ code: 403, message: '无权限删除此帖子' });

  run('DELETE FROM posts WHERE id = ?', [req.params.id]);
  res.json({ code: 200, message: '删除成功' });
});

// POST /api/posts/:id/like - 点赞/取消点赞帖子
router.post('/:id/like', authRequired, (req, res) => {
  const post = get('SELECT id, like_count FROM posts WHERE id = ?', [req.params.id]);
  if (!post) return res.status(404).json({ code: 404, message: '帖子不存在' });

  const existing = get('SELECT 1 as v FROM likes WHERE user_id = ? AND target_type = ? AND target_id = ?', [req.user.id, 'post', post.id]);

  let isLiked, likeCount;
  if (existing) {
    run('DELETE FROM likes WHERE user_id = ? AND target_type = ? AND target_id = ?', [req.user.id, 'post', post.id]);
    run('UPDATE posts SET like_count = MAX(0, like_count - 1) WHERE id = ?', [post.id]);
    isLiked = false;
    likeCount = Math.max(0, post.like_count - 1);
  } else {
    run('INSERT INTO likes (user_id, target_type, target_id) VALUES (?, ?, ?)', [req.user.id, 'post', post.id]);
    run('UPDATE posts SET like_count = like_count + 1 WHERE id = ?', [post.id]);
    isLiked = true;
    likeCount = post.like_count + 1;
  }

  res.json({ code: 200, data: { isLiked, likeCount } });
});

// POST /api/posts/:id/favorite - 收藏/取消收藏帖子
router.post('/:id/favorite', authRequired, (req, res) => {
  const post = get('SELECT id FROM posts WHERE id = ?', [req.params.id]);
  if (!post) return res.status(404).json({ code: 404, message: '帖子不存在' });

  const existing = get('SELECT 1 as v FROM favorites WHERE user_id = ? AND post_id = ?', [req.user.id, post.id]);
  let isFavorited;

  if (existing) {
    run('DELETE FROM favorites WHERE user_id = ? AND post_id = ?', [req.user.id, post.id]);
    isFavorited = false;
  } else {
    run('INSERT INTO favorites (user_id, post_id) VALUES (?, ?)', [req.user.id, post.id]);
    isFavorited = true;
  }

  res.json({ code: 200, data: { isFavorited } });
});

// GET /api/posts/:postId/comments - 获取帖子评论
router.get('/:postId/comments', authOptional, (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offset = (pageNum - 1) * limitNum;
    const postId = parseInt(req.params.postId);

    if (!postId || isNaN(postId)) {
      return res.status(400).json({ code: 400, message: '无效的帖子ID' });
    }

    const countResult = get('SELECT COUNT(*) as count FROM comments WHERE post_id = ?', [postId]);
    const total = countResult ? countResult.count : 0;

    // 查询顶层评论（reply_to 为 NULL 或 0 的都算顶层评论）
    const comments = all(`
      SELECT c.*, u.username as author_name, u.avatar as author_avatar
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.post_id = ? AND (c.reply_to IS NULL OR c.reply_to = 0)
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `, [postId, limitNum, offset]);

    const formattedComments = comments.map(c => {
      const replies = all(`
        SELECT c2.*, u.username as author_name, u.avatar as author_avatar
        FROM comments c2
        LEFT JOIN users u ON c2.author_id = u.id
        WHERE c2.reply_to = ?
        ORDER BY c2.created_at ASC
      `, [c.id]);

      return {
        id: c.id,
        content: c.content,
        author: { id: c.author_id, username: c.author_name || '未知用户', avatar: c.author_avatar || '' },
        likeCount: c.like_count || 0,
        isLiked: req.user ? !!get('SELECT 1 as v FROM likes WHERE user_id = ? AND target_type = ? AND target_id = ?', [req.user.id, 'comment', c.id]) : false,
        replies: replies.map(r => ({
          id: r.id,
          content: r.content,
          author: { id: r.author_id, username: r.author_name || '未知用户', avatar: r.author_avatar || '' },
          replyTo: { id: c.author_id, username: c.author_name || '未知用户' },
          createdAt: r.created_at
        })),
        createdAt: c.created_at
      };
    });

    res.json({
      code: 200,
      data: { comments: formattedComments, pagination: { page: pageNum, limit: limitNum, total } }
    });
  } catch (err) {
    console.error('获取评论失败:', err);
    res.status(500).json({ code: 500, message: '获取评论失败' });
  }
});

// POST /api/posts/:postId/comments - 创建评论
router.post('/:postId/comments', authRequired, (req, res) => {
  try {
    const { content, replyTo } = req.body;
    const postId = parseInt(req.params.postId);

    if (!postId || isNaN(postId)) {
      return res.status(400).json({ code: 400, message: '无效的帖子ID' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ code: 400, message: '评论内容不能为空' });
    }

    const post = get('SELECT id, author_id FROM posts WHERE id = ?', [postId]);
    if (!post) return res.status(404).json({ code: 404, message: '帖子不存在' });

    const result = run(
      'INSERT INTO comments (content, post_id, author_id, reply_to) VALUES (?, ?, ?, ?)',
      [content.trim(), postId, req.user.id, replyTo ? parseInt(replyTo) : null]
    );

    run('UPDATE posts SET comment_count = comment_count + 1 WHERE id = ?', [postId]);

  // 创建通知：包含帖子标题和评论内容
  if (post.author_id !== req.user.id) {
    const postInfo = get('SELECT title FROM posts WHERE id = ?', [postId]);
    const postTitle = postInfo ? postInfo.title : '未知帖子';
    const notifTitle = `${req.user.username} 评论了你的帖子`;
    const notifContent = `在《${postTitle}》中评论：${content.trim().substring(0, 100)}`;
    run(
      "INSERT INTO notifications (user_id, type, title, content, data) VALUES (?, 'comment', ?, ?, ?)",
      [post.author_id, notifTitle, notifContent, JSON.stringify({ postId: parseInt(postId), commentId: result.lastInsertRowid, postTitle })]
    );
  }

    const authorUser = get('SELECT id, username, avatar FROM users WHERE id = ?', [req.user.id]);
    res.status(201).json({
      code: 201,
      message: '评论成功',
      data: { id: result.lastInsertRowid, content: content.trim(), author: { id: req.user.id, username: authorUser ? authorUser.username : req.user.username, avatar: authorUser ? authorUser.avatar : '' }, createdAt: new Date().toISOString() }
    });
  } catch (err) {
    console.error('创建评论失败:', err);
    res.status(500).json({ code: 500, message: '创建评论失败' });
  }
});

module.exports = router;
