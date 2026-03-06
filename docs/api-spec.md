# 校园论坛 API 接口规范文档

## 1. 接口概述

### 1.1 基础信息
- 基础URL: `http://localhost:3000/api`
- 数据格式: JSON
- 字符编码: UTF-8
- 认证方式: JWT Token (Bearer Token)

### 1.2 通用响应格式

#### 成功响应
```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

#### 错误响应
```json
{
  "code": 400,
  "message": "错误描述",
  "errors": [
    {
      "field": "username",
      "message": "用户名不能为空"
    }
  ]
}
```

### 1.3 HTTP状态码说明
| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权/Token无效 |
| 403 | 无权限访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 2. 认证接口

### 2.1 用户注册
```
POST /auth/register
```

**请求参数**
```json
{
  "username": "string (必填, 3-20字符)",
  "password": "string (必填, 6-20字符)",
  "email": "string (可选, 邮箱格式)"
}
```

**响应示例**
```json
{
  "code": 201,
  "message": "注册成功",
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "createdAt": "2026-03-05T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2.2 用户登录
```
POST /auth/login
```

**请求参数**
```json
{
  "username": "string (必填)",
  "password": "string (必填)"
}
```

**响应示例**
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "avatar": "https://example.com/avatar.jpg",
      "email": "test@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2.3 获取当前用户信息
```
GET /auth/me
```

**请求头**
```
Authorization: Bearer <token>
```

**响应示例**
```json
{
  "code": 200,
  "data": {
    "id": 1,
    "username": "testuser",
    "avatar": "https://example.com/avatar.jpg",
    "email": "test@example.com",
    "bio": "这是个人简介",
    "postCount": 10,
    "followerCount": 5,
    "followingCount": 3
  }
}
```

### 2.4 退出登录
```
POST /auth/logout
```

**请求头**
```
Authorization: Bearer <token>
```

---

## 3. 用户接口

### 3.1 获取用户信息
```
GET /users/:id
```

**响应示例**
```json
{
  "code": 200,
  "data": {
    "id": 1,
    "username": "testuser",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "个人简介",
    "postCount": 10,
    "followerCount": 5,
    "followingCount": 3,
    "createdAt": "2026-01-01T00:00:00Z"
  }
}
```

### 3.2 更新用户信息
```
PUT /users/:id
```

**请求头**
```
Authorization: Bearer <token>
```

**请求参数**
```json
{
  "avatar": "string (可选, URL)",
  "bio": "string (可选, 最大200字符)",
  "email": "string (可选, 邮箱格式)"
}
```

### 3.3 获取用户发布的帖子
```
GET /users/:id/posts
```

**查询参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页数量，默认10 |

**响应示例**
```json
{
  "code": 200,
  "data": {
    "posts": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

### 3.4 获取用户收藏的帖子
```
GET /users/:id/favorites
```

---

## 4. 帖子接口

### 4.1 获取帖子列表
```
GET /posts
```

**查询参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页数量，默认10 |
| category | number | 否 | 分类ID |
| tag | string | 否 | 标签名称 |
| keyword | string | 否 | 搜索关键词 |
| sort | string | 否 | 排序方式: latest, popular |

**响应示例**
```json
{
  "code": 200,
  "data": {
    "posts": [
      {
        "id": 1,
        "title": "帖子标题",
        "summary": "帖子摘要",
        "author": {
          "id": 1,
          "username": "testuser",
          "avatar": "https://example.com/avatar.jpg"
        },
        "category": {
          "id": 2,
          "name": "学习交流"
        },
        "tags": [
          { "id": 1, "name": "前端开发" }
        ],
        "viewCount": 100,
        "likeCount": 10,
        "commentCount": 5,
        "isLiked": false,
        "isFavorited": false,
        "createdAt": "2026-03-05T10:00:00Z",
        "updatedAt": "2026-03-05T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

### 4.2 获取帖子详情
```
GET /posts/:id
```

**响应示例**
```json
{
  "code": 200,
  "data": {
    "id": 1,
    "title": "帖子标题",
    "content": "帖子正文内容...",
    "summary": "帖子摘要",
    "author": {
      "id": 1,
      "username": "testuser",
      "avatar": "https://example.com/avatar.jpg"
    },
    "category": {
      "id": 2,
      "name": "学习交流"
    },
    "tags": [
      { "id": 1, "name": "前端开发" }
    ],
    "viewCount": 100,
    "likeCount": 10,
    "commentCount": 5,
    "isLiked": false,
    "isFavorited": false,
    "createdAt": "2026-03-05T10:00:00Z",
    "updatedAt": "2026-03-05T10:00:00Z"
  }
}
```

### 4.3 创建帖子
```
POST /posts
```

**请求头**
```
Authorization: Bearer <token>
```

**请求参数**
```json
{
  "title": "string (必填, 最大100字符)",
  "content": "string (必填, 最大10000字符)",
  "summary": "string (可选, 最大200字符)",
  "categoryId": "number (必填)",
  "tags": ["string"] // 标签名称数组
}
```

**响应示例**
```json
{
  "code": 201,
  "message": "发布成功",
  "data": {
    "id": 1,
    "title": "帖子标题",
    "createdAt": "2026-03-05T10:00:00Z"
  }
}
```

### 4.4 更新帖子
```
PUT /posts/:id
```

**请求头**
```
Authorization: Bearer <token>
```

**请求参数**
```json
{
  "title": "string (可选)",
  "content": "string (可选)",
  "summary": "string (可选)",
  "categoryId": "number (可选)",
  "tags": ["string"] // 可选
}
```

### 4.5 删除帖子
```
DELETE /posts/:id
```

**请求头**
```
Authorization: Bearer <token>
```

### 4.6 点赞/取消点赞帖子
```
POST /posts/:id/like
```

**请求头**
```
Authorization: Bearer <token>
```

**响应示例**
```json
{
  "code": 200,
  "data": {
    "isLiked": true,
    "likeCount": 11
  }
}
```

### 4.7 收藏/取消收藏帖子
```
POST /posts/:id/favorite
```

**请求头**
```
Authorization: Bearer <token>
```

---

## 5. 评论接口

### 5.1 获取帖子评论列表
```
GET /posts/:postId/comments
```

**查询参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页数量，默认20 |

**响应示例**
```json
{
  "code": 200,
  "data": {
    "comments": [
      {
        "id": 1,
        "content": "评论内容",
        "author": {
          "id": 2,
          "username": "commenter",
          "avatar": "https://example.com/avatar.jpg"
        },
        "likeCount": 3,
        "isLiked": false,
        "replies": [
          {
            "id": 2,
            "content": "回复内容",
            "author": {...},
            "replyTo": {
              "id": 2,
              "username": "commenter"
            },
            "createdAt": "2026-03-05T11:00:00Z"
          }
        ],
        "createdAt": "2026-03-05T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50
    }
  }
}
```

### 5.2 创建评论
```
POST /posts/:postId/comments
```

**请求头**
```
Authorization: Bearer <token>
```

**请求参数**
```json
{
  "content": "string (必填, 最大500字符)",
  "replyTo": "number (可选, 回复的评论ID)"
}
```

### 5.3 删除评论
```
DELETE /comments/:id
```

**请求头**
```
Authorization: Bearer <token>
```

### 5.4 点赞/取消点赞评论
```
POST /comments/:id/like
```

---

## 6. 分类接口

### 6.1 获取分类列表
```
GET /categories
```

**响应示例**
```json
{
  "code": 200,
  "data": [
    { "id": 1, "name": "全部", "postCount": 100 },
    { "id": 2, "name": "学习交流", "postCount": 30 },
    { "id": 3, "name": "生活分享", "postCount": 25 },
    { "id": 4, "name": "活动通知", "postCount": 15 },
    { "id": 5, "name": "问题求助", "postCount": 20 },
    { "id": 6, "name": "兴趣爱好", "postCount": 10 }
  ]
}
```

---

## 7. 标签接口

### 7.1 获取标签列表
```
GET /tags
```

**查询参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| hot | boolean | 否 | 是否获取热门标签 |
| limit | number | 否 | 返回数量，默认20 |

**响应示例**
```json
{
  "code": 200,
  "data": [
    { "id": 1, "name": "前端开发", "postCount": 15 },
    { "id": 2, "name": "后端开发", "postCount": 12 },
    { "id": 3, "name": "考研", "postCount": 20 }
  ]
}
```

### 7.2 创建标签
```
POST /tags
```

**请求头**
```
Authorization: Bearer <token>
```

**请求参数**
```json
{
  "name": "string (必填, 最大20字符)"
}
```

### 7.3 获取标签下的帖子
```
GET /tags/:name/posts
```

---

## 8. 消息通知接口

### 8.1 获取通知列表
```
GET /notifications
```

**请求头**
```
Authorization: Bearer <token>
```

**查询参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 否 | 类型: comment, like, system, all |
| read | boolean | 否 | 是否已读 |
| page | number | 否 | 页码 |
| limit | number | 否 | 每页数量 |

**响应示例**
```json
{
  "code": 200,
  "data": {
    "notifications": [
      {
        "id": 1,
        "type": "comment",
        "title": "新评论",
        "content": "用户A回复了你的帖子",
        "data": {
          "postId": 1,
          "commentId": 5
        },
        "isRead": false,
        "createdAt": "2026-03-05T10:00:00Z"
      }
    ],
    "unreadCount": 5,
    "pagination": {...}
  }
}
```

### 8.2 标记通知已读
```
PUT /notifications/:id/read
```

### 8.3 标记所有通知已读
```
PUT /notifications/read-all
```

### 8.4 获取未读通知数量
```
GET /notifications/unread-count
```

**响应示例**
```json
{
  "code": 200,
  "data": {
    "count": 5
  }
}
```

---

## 9. 搜索接口

### 9.1 搜索帖子
```
GET /search
```

**查询参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 是 | 搜索关键词 |
| type | string | 否 | 搜索类型: post, user, tag |
| page | number | 否 | 页码 |
| limit | number | 否 | 每页数量 |

---

## 10. 文件上传接口

### 10.1 上传图片
```
POST /upload/image
```

**请求头**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**请求参数**
```
file: File (必填, 支持jpg/png/gif, 最大5MB)
```

**响应示例**
```json
{
  "code": 200,
  "data": {
    "url": "https://example.com/uploads/xxx.jpg"
  }
}
```

---

## 11. 数据库设计参考

### 11.1 用户表 (users)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| username | VARCHAR(50) | 用户名，唯一 |
| password | VARCHAR(255) | 密码（加密存储） |
| email | VARCHAR(100) | 邮箱 |
| avatar | VARCHAR(255) | 头像URL |
| bio | TEXT | 个人简介 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### 11.2 帖子表 (posts)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| title | VARCHAR(100) | 标题 |
| content | TEXT | 内容 |
| summary | VARCHAR(200) | 摘要 |
| author_id | INT | 作者ID，外键 |
| category_id | INT | 分类ID，外键 |
| view_count | INT | 浏览数 |
| like_count | INT | 点赞数 |
| comment_count | INT | 评论数 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### 11.3 评论表 (comments)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| content | VARCHAR(500) | 内容 |
| post_id | INT | 帖子ID，外键 |
| author_id | INT | 作者ID，外键 |
| reply_to | INT | 回复的评论ID |
| like_count | INT | 点赞数 |
| created_at | TIMESTAMP | 创建时间 |

### 11.4 标签表 (tags)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| name | VARCHAR(20) | 标签名，唯一 |
| post_count | INT | 帖子数量 |

### 11.5 帖子标签关联表 (post_tags)
| 字段 | 类型 | 说明 |
|------|------|------|
| post_id | INT | 帖子ID |
| tag_id | INT | 标签ID |

### 11.6 收藏表 (favorites)
| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | INT | 用户ID |
| post_id | INT | 帖子ID |
| created_at | TIMESTAMP | 收藏时间 |

### 11.7 点赞表 (likes)
| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | INT | 用户ID |
| target_type | ENUM | 目标类型: post, comment |
| target_id | INT | 目标ID |
| created_at | TIMESTAMP | 点赞时间 |

### 11.8 通知表 (notifications)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| user_id | INT | 接收用户ID |
| type | VARCHAR(20) | 通知类型 |
| title | VARCHAR(100) | 标题 |
| content | TEXT | 内容 |
| data | JSON | 关联数据 |
| is_read | BOOLEAN | 是否已读 |
| created_at | TIMESTAMP | 创建时间 |

---

## 12. 前后端协作说明

### 12.1 开发流程
1. 前端基于此文档开发Mock数据接口
2. 后端基于此文档实现API
3. 联调时替换Mock为真实接口
4. 测试验证功能完整性

### 12.2 Mock数据开发
前端可使用以下方式模拟接口：
- 使用现有 `api.js` 中的 localStorage 方案
- 使用 Mock.js 生成随机数据
- 使用 JSON Server 快速搭建Mock服务

### 12.3 接口变更流程
1. 变更需双方确认
2. 更新此文档版本号
3. 前后端同步修改代码

---

## 版本记录

| 版本 | 日期 | 修改内容 | 作者 |
|------|------|----------|------|
| 1.0 | 2026-03-05 | 初始版本 | 前端开发组 |
