// 统一错误处理中间件
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    code: statusCode,
    message: err.message || '服务器内部错误',
    success: false,
    ...(isProduction ? {} : { stack: err.stack })
  });
}

module.exports = { errorHandler };
