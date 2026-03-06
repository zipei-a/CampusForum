// ============ 校园论坛 API 接口层 ============
// 所有前端数据操作通过此文件与后端 API 通信
// 使用相对路径 /api/...，本地开发和 Render 部署均可正常工作

const API_BASE = '/api';

// ============ 通用请求工具 ============

function getToken() {
  return localStorage.getItem('authToken');
}

function setToken(token) {
  localStorage.setItem('authToken', token);
}

function removeToken() {
  localStorage.removeItem('authToken');
}

async function request(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, { ...options, headers });
  
  let data;
  const text = await response.text();
  try {
    data = JSON.parse(text);
  } catch (error) {
    console.error("响应解析失败。状态码:", response.status, "响应内容:", text);
    throw new Error(`系统错误: 期待 JSON 却收到了其他内容 (状态码 ${response.status})`);
  }

  if (!response.ok) {
    throw new Error(data.message || '请求失败');
  }
  return data;
}

// ============ 认证接口 ============

// 模拟登录 → 真实 API 登录
export async function login(username, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  // 存储 token 和用户信息
  setToken(data.data.token);
  localStorage.setItem('currentUser', JSON.stringify(data.data.user));
  return { success: true, user: data.data.user };
}

// 模拟注册 → 真实 API 注册
export async function register(username, password, email) {
  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password, email })
  });
  setToken(data.data.token);
  localStorage.setItem('currentUser', JSON.stringify(data.data.user));
  return { success: true, user: data.data.user };
}

// 登录态管理
export function getCurrentUser() {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
}

export function logout() {
  removeToken();
  localStorage.removeItem('currentUser');
}

// ============ 帖子接口 ============

// 获取帖子列表
export async function getPosts(options = {}) {
  const params = new URLSearchParams();
  if (options.page) params.set('page', options.page);
  if (options.limit) params.set('limit', options.limit);
  if (options.category) params.set('category', options.category);
  if (options.tag) params.set('tag', options.tag);
  if (options.keyword) params.set('keyword', options.keyword);
  if (options.sort) params.set('sort', options.sort);

  const query = params.toString();
  const data = await request(`/posts${query ? '?' + query : ''}`);

  // 兼容旧前端：返回帖子数组（旧前端直接 getPosts().then(posts => ...)）
  // 如果传入了 options，返回包含 pagination 的完整数据
  if (Object.keys(options).length > 0) {
    return data.data;
  }

  // 向后兼容：将后端格式转换为旧前端期望的格式
  return data.data.posts.map(p => ({
    id: p.id,
    title: p.title,
    content: p.content,
    author: p.author.username,
    categoryId: p.category?.id,
    createdAt: p.createdAt,
    comments: [],
    viewCount: p.viewCount,
    likeCount: p.likeCount,
    commentCount: p.commentCount
  }));
}

// 发布新帖
export async function createPost(post) {
  const data = await request('/posts', {
    method: 'POST',
    body: JSON.stringify({
      title: post.title,
      content: post.content,
      summary: post.summary,
      categoryId: post.categoryId,
      tags: post.tags
    })
  });
  return data.data;
}

// 获取帖子详情
export async function getPostDetail(id) {
  const data = await request(`/posts/${id}`);
  const p = data.data;
  // 向后兼容旧格式
  return {
    id: p.id,
    title: p.title,
    content: p.content,
    author: p.author.username,
    authorId: p.author.id,
    categoryId: p.category?.id,
    categoryName: p.category?.name,
    createdAt: p.createdAt,
    comments: [],
    viewCount: p.viewCount,
    likeCount: p.likeCount,
    commentCount: p.commentCount,
    isLiked: p.isLiked,
    isFavorited: p.isFavorited,
    tags: p.tags
  };
}

// 发布评论
export async function createComment(postId, content) {
  const data = await request(`/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content })
  });
  return data.data;
}

// 删除帖子
export async function deletePost(postId) {
  const data = await request(`/posts/${postId}`, { method: 'DELETE' });
  return { success: true, message: data.message };
}

// ============ 分类接口 ============

export async function getCategories() {
  const data = await request('/categories');
  return data.data;
}

// 根据分类ID获取分类名称
export function getCategoryName(categoryId) {
  const categories = [
    { id: 1, name: '全部' }, { id: 2, name: '学习交流' },
    { id: 3, name: '生活分享' }, { id: 4, name: '活动通知' },
    { id: 5, name: '问题求助' }, { id: 6, name: '兴趣爱好' }
  ];
  const cat = categories.find(c => c.id == categoryId);
  return cat ? cat.name : '未分类';
}

// ============ 标签接口 ============

export async function getTags() {
  const data = await request('/tags');
  return data.data.map(t => ({ id: t.id, name: t.name, count: t.post_count }));
}

export async function getHotTags(limit = 10) {
  const data = await request(`/tags?hot=true&limit=${limit}`);
  return data.data.map(t => ({ id: t.id, name: t.name, count: t.post_count }));
}

export async function createTag(name) {
  const data = await request('/tags', {
    method: 'POST',
    body: JSON.stringify({ name })
  });
  return data.data;
}

export async function createOrGetTags(tagNames) {
  const tags = [];
  for (const name of tagNames) {
    if (name && name.trim()) {
      const tag = await createTag(name.trim());
      tags.push(tag);
    }
  }
  return tags;
}

export async function getPostsByTag(tagName) {
  const data = await request(`/tags/${encodeURIComponent(tagName)}/posts`);
  return data.data.posts.map(p => ({
    id: p.id,
    title: p.title,
    content: p.summary,
    author: p.author.username,
    createdAt: p.createdAt,
    comments: []
  }));
}

export function updateTagCount(tagId, increment = 1) {
  // 标签计数由后端自动管理，此函数保留兼容
}

export async function deleteTag(tagId) {
  // 后端暂不实现删除标签，保留接口兼容
  return { success: true };
}

// ============ 搜索接口 ============

export async function searchPosts(keyword) {
  const data = await request(`/search?keyword=${encodeURIComponent(keyword)}`);
  return data.data.posts.map(p => ({
    id: p.id,
    title: p.title,
    content: p.summary,
    author: p.author.username,
    createdAt: p.createdAt,
    comments: []
  }));
}

// ============ 收藏接口 ============

export async function toggleFavorite(postId) {
  const data = await request(`/posts/${postId}/favorite`, { method: 'POST' });
  return { success: true, isFavorited: data.data.isFavorited };
}

export async function getUserFavorites() {
  const user = getCurrentUser();
  if (!user) return [];

  try {
    const data = await request(`/users/${user.id}/favorites`);
    return data.data.posts.map(p => ({
      id: p.id,
      title: p.title,
      content: p.summary,
      author: p.author.username,
      createdAt: p.createdAt,
      comments: []
    }));
  } catch {
    return [];
  }
}

export function isPostFavorited(postId) {
  // 收藏状态改由后端管理，详情页请求时会返回 isFavorited
  // 此同步方法保留兼容，默认返回 false
  return false;
}

// ============ 点赞接口 ============

export async function toggleLike(postId) {
  const data = await request(`/posts/${postId}/like`, { method: 'POST' });
  return { success: true, isLiked: data.data.isLiked, likeCount: data.data.likeCount };
}

export function getPostLikeCount(postId) {
  // 点赞数改由后端管理，帖子数据中已包含 likeCount
  return 0;
}

export function isPostLiked(postId) {
  // 点赞状态改由后端管理，默认返回 false
  return false;
}