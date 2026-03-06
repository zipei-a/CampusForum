# 校园论坛部署说明文档

## 1. 系统要求

### 1.1 硬件要求

- **CPU**：至少1核
- **内存**：至少512MB
- **存储空间**：至少100MB

### 1.2 软件要求

- **浏览器**：支持现代浏览器，如Chrome、Firefox、Safari、Edge等
- **网络**：需要网络连接
- **Web服务器**：可选，用于部署静态文件

## 2. 部署方式

校园论坛是一个纯前端项目，使用LocalStorage存储数据，因此可以通过多种方式部署。

### 2.1 本地部署

#### 2.1.1 直接打开

1. 下载项目代码到本地
2. 解压到任意目录
3. 直接双击 `Html/index.html` 文件打开
4. 系统会在浏览器中运行

#### 2.1.2 使用本地服务器

如果直接打开HTML文件遇到跨域问题，可以使用本地服务器：

**方法一：使用Python内置服务器**

1. 打开命令行工具
2. 进入项目根目录
3. 运行命令：
   - Python 3: `python -m http.server 8000`
   - Python 2: `python -m SimpleHTTPServer 8000`
4. 在浏览器中访问 `http://localhost:8000/Html/index.html`

**方法二：使用Node.js的http-server**

1. 安装Node.js
2. 全局安装http-server：`npm install -g http-server`
3. 进入项目根目录
4. 运行命令：`http-server -p 8000`
5. 在浏览器中访问 `http://localhost:8000/Html/index.html`

### 2.2 在线部署

#### 2.2.1 GitHub Pages

1. 在GitHub上创建一个仓库
2. 将项目代码推送到仓库
3. 在仓库设置中启用GitHub Pages
4. 选择分支和目录（通常选择 `main` 分支和 `/` 目录）
5. 保存设置后，GitHub会生成一个URL
6. 通过该URL访问部署的论坛

#### 2.2.2 静态网站托管服务

可以使用以下静态网站托管服务：

- **Vercel**：https://vercel.com/
- **Netlify**：https://www.netlify.com/
- **Cloudflare Pages**：https://pages.cloudflare.com/
- **AWS S3 + CloudFront**：https://aws.amazon.com/s3/

部署步骤：
1. 注册并登录托管服务
2. 连接GitHub仓库或上传项目文件
3. 配置部署设置（如构建命令、发布目录等）
4. 部署项目
5. 获取部署URL并访问

#### 2.2.3 传统Web服务器

可以部署到Apache、Nginx等传统Web服务器：

**Apache部署**：
1. 安装Apache服务器
2. 将项目文件复制到Apache的网站根目录（通常是 `/var/www/html`）
3. 启动Apache服务
4. 在浏览器中访问服务器IP或域名

**Nginx部署**：
1. 安装Nginx服务器
2. 配置Nginx虚拟主机：
   ```nginx
   server {
       listen 80;
       server_name example.com;
       root /path/to/campusforum;
       index Html/index.html;
       
       location / {
           try_files $uri $uri/ /Html/index.html;
       }
   }
   ```
3. 重启Nginx服务
4. 在浏览器中访问服务器IP或域名

## 3. 配置说明

### 3.1 基本配置

校园论坛是一个纯前端项目，不需要复杂的配置。主要配置包括：

- **网站标题**：修改HTML文件中的 `<title>` 标签
- **网站Logo**：修改HTML文件中的 `.logo` 元素
- **分类配置**：修改 `api.js` 文件中的 `categories` 数组
- **默认数据**：修改 `api.js` 文件中的 `BASE_MOCK` 对象

### 3.2 高级配置

如果需要添加新功能或修改现有功能，可以修改相应的JavaScript文件：

- **API配置**：修改 `api.js` 文件
- **UI配置**：修改 `ui.js` 文件
- **样式配置**：修改 `css/style.css` 文件
- **工具函数**：修改 `utils.js` 文件

## 4. 数据管理

### 4.1 数据存储

校园论坛使用LocalStorage存储数据，数据存储在用户浏览器中。主要存储以下数据：

- `campusForumData`：包含所有论坛数据（用户、帖子、评论、通知等）
- `currentUser`：当前登录用户信息

### 4.2 数据备份

由于数据存储在浏览器的LocalStorage中，建议定期备份数据：

1. 在浏览器中打开开发者工具（F12）
2. 切换到Application（或Storage）选项卡
3. 选择LocalStorage
4. 找到并复制 `campusForumData` 的值
5. 将值保存到本地文件

### 4.3 数据恢复

如果需要恢复数据：

1. 在浏览器中打开开发者工具（F12）
2. 切换到Application（或Storage）选项卡
3. 选择LocalStorage
4. 编辑 `campusForumData` 的值，粘贴备份的数据
5. 刷新页面

### 4.4 数据清理

如果需要清理所有数据：

1. 在浏览器中打开开发者工具（F12）
2. 切换到Application（或Storage）选项卡
3. 选择LocalStorage
4. 删除 `campusForumData` 和 `currentUser` 条目
5. 刷新页面

## 5. 维护与更新

### 5.1 代码更新

1. 修改相应的文件
2. 重新部署项目
3. 清除浏览器缓存（如果需要）

### 5.2 功能扩展

1. 参考技术实现文档中的未来扩展部分
2. 按照开发规范添加新功能
3. 测试新功能
4. 部署更新

### 5.3 问题排查

如果遇到问题，可以通过以下方式排查：

1. 检查浏览器控制台是否有错误信息
2. 检查LocalStorage中的数据是否正确
3. 检查网络请求是否正常（如果有后端API）
4. 检查代码逻辑是否正确

## 6. 常见问题

### 6.1 跨域问题

**问题**：直接打开HTML文件时，可能会遇到跨域问题。

**解决方案**：使用本地服务器或在线部署方式。

### 6.2 数据丢失

**问题**：清除浏览器缓存或使用隐私模式时，数据可能会丢失。

**解决方案**：定期备份数据，或考虑使用后端数据库存储。

### 6.3 浏览器兼容性

**问题**：在某些旧浏览器中可能无法正常运行。

**解决方案**：使用现代浏览器，如Chrome、Firefox、Safari、Edge等。

### 6.4 性能问题

**问题**：当数据量较大时，可能会出现性能问题。

**解决方案**：
- 优化代码逻辑
- 实现分页加载
- 考虑使用后端API和数据库

## 7. 监控与日志

### 7.1 前端监控

可以使用以下工具监控前端性能和错误：

- **Google Analytics**：监控用户行为和流量
- **Sentry**：监控前端错误
- **Lighthouse**：分析前端性能

### 7.2 日志记录

前端可以使用控制台日志记录关键操作：

```javascript
console.log('用户登录:', username);
console.error('登录失败:', error);
```

## 8. 安全注意事项

### 8.1 数据安全

- 不要在LocalStorage中存储敏感信息
- 对用户输入进行验证，防止XSS攻击
- 定期备份数据

### 8.2 访问控制

- 确保用户只能操作自己的数据
- 实现适当的权限检查

### 8.3 部署安全

- 使用HTTPS协议
- 定期更新依赖（如果有）
- 配置适当的CSP（内容安全策略）

## 9. 技术支持

### 9.1 联系信息

- **开发者**：前端开发组
- **邮箱**：admin@campusforum.com
- **文档**：项目根目录下的docs文件夹

### 9.2 常见问题解答

参考用户操作手册中的常见问题解答部分。

## 10. 版本历史

| 版本 | 日期 | 修改内容 | 作者 |
|------|------|----------|------|
| 1.0 | 2026-03-05 | 初始版本 | 前端开发组 |
