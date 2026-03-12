const jwt = require('jsonwebtoken');
const { get } = require('../database/helpers');

const JWT_SECRET = process.env.JWT_SECRET || 'campus_forum_secret_key_2026';

// JWT 认证中间件（必须登录）
function authRequired(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '请先登录' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // 验证用户在数据库中确实存在，防止数据库重置后旧token仍能使用
    const dbUser = get('SELECT id, username, role FROM users WHERE id = ?', [decoded.id]);
    if (!dbUser || dbUser.username !== decoded.username) {
      return res.status(401).json({ code: 401, message: '用户信息已失效，请重新登录' });
    }
    req.user = { id: dbUser.id, username: dbUser.username, role: dbUser.role || 'user' };
    next();
  } catch (err) {
    return res.status(401).json({ code: 401, message: 'Token无效或已过期' });
  }
}

// 可选认证中间件（未登录也可访问，但会附加用户信息）
function authOptional(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const dbUser = get('SELECT id, username, role FROM users WHERE id = ?', [decoded.id]);
      if (dbUser && dbUser.username === decoded.username) {
        req.user = { id: dbUser.id, username: dbUser.username, role: dbUser.role || 'user' };
      }
    } catch (err) {
      // Token 无效，不阻止请求
    }
  }
  next();
}

// 管理员权限中间件（必须先经过 authRequired）
function adminRequired(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ code: 403, message: '需要管理员权限' });
  }
  next();
}

module.exports = { authRequired, authOptional, adminRequired, JWT_SECRET };
