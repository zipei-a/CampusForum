const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initDatabase } = require('./database/init');
const { errorHandler } = require('./middleware/errorHandler');

// 引入路由模块
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const categoryRoutes = require('./routes/categories');
const tagRoutes = require('./routes/tags');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');
const searchRoutes = require('./routes/search');
const uploadRoutes = require('./routes/upload');
const jobRoutes = require('./routes/jobs');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// ============ 中间件配置 ============

// CORS 跨域配置 - 收紧配置，只允许已知来源
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.ALLOWED_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // 允许无 origin 的请求（如直接浏览器访问、curl）
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // 生产环境严格模式：拒绝未知来源
    if (process.env.NODE_ENV === 'production') {
      return callback(new Error('CORS policy violation'), false);
    }
    // 开发环境宽松
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 解析 JSON 请求体
app.use(express.json());

// 解析 URL 编码的请求体
app.use(express.urlencoded({ extended: true }));

// ============ 静态文件服务 ============

// 提供前端静态文件（HTML、CSS、JS、图片等）
const frontendPath = path.join(__dirname, '..');
app.use('/Html', express.static(path.join(frontendPath, 'Html')));
app.use('/css', express.static(path.join(frontendPath, 'css')));
app.use('/JavaScript', express.static(path.join(frontendPath, 'JavaScript')));
app.use('/assets', express.static(path.join(frontendPath, 'assets')));

// 提供上传的图片文件
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// ============ API 路由 ============

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin', adminRoutes);

// ============ 根路由重定向 ============

app.get('/', (req, res) => {
  res.redirect('/Html/index.html');
});

// ============ 错误处理 ============

app.use(errorHandler);

// ============ 启动服务（异步初始化数据库后启动） ============

async function start() {
  try {
    await initDatabase();
    console.log('数据库初始化成功');

    app.listen(PORT, () => {
      console.log(`====================================`);
      console.log(`  校园论坛后端服务已启动`);
      console.log(`  本地访问: http://localhost:${PORT}`);
      console.log(`  API 地址: http://localhost:${PORT}/api`);
      console.log(`====================================`);
    });
  } catch (err) {
    console.error('启动失败:', err);
    process.exit(1);
  }
}

start();

module.exports = app;
