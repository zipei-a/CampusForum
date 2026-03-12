import { getCurrentUser, logout } from './api.js';
import { showToast } from './ui.js';

// ============ 权限检查 ============

const currentUser = getCurrentUser();
if (!currentUser || currentUser.role !== 'admin') {
  window.location.href = 'index.html';
}

// ============ 请求工具 ============

const API_BASE = '/api';

async function adminRequest(url, options = {}) {
  const token = localStorage.getItem('authToken');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${url}`, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      window.location.href = 'login.html';
      return;
    }
    if (response.status === 403) {
      showToast('无管理员权限', 'error');
      window.location.href = 'index.html';
      return;
    }
    throw new Error(data.message || '请求失败');
  }
  return data;
}

// ============ 初始化导航 ============

function initNav() {
  const userInfo = document.getElementById('user-info');
  const userAvatar = document.getElementById('user-avatar');

  if (userInfo && currentUser) {
    userInfo.innerHTML = `
      <span>管理员：${currentUser.username}</span>
      <button class="btn btn-outline" id="logout-btn">退出</button>
    `;
    if (userAvatar) {
      userAvatar.style.display = 'flex';
      userAvatar.textContent = currentUser.username.charAt(0).toUpperCase();
      userAvatar.addEventListener('click', () => {
        window.location.href = 'profile.html';
      });
    }
    document.getElementById('logout-btn').addEventListener('click', () => {
      logout();
      showToast('退出成功', 'info');
      setTimeout(() => { window.location.href = 'login.html'; }, 1000);
    });
  }
}

// ============ 统计数据 ============

async function loadStats() {
  try {
    const data = await adminRequest('/admin/stats');
    document.getElementById('stat-users').textContent = data.data.userCount;
    document.getElementById('stat-posts').textContent = data.data.postCount;
    document.getElementById('stat-comments').textContent = data.data.commentCount;
    document.getElementById('stat-jobs').textContent = data.data.jobCount;
  } catch (err) {
    console.error('加载统计失败:', err);
  }
}

// ============ Tab 切换 ============

const tabs = document.querySelectorAll('.admin-tab');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`panel-${tab.dataset.tab}`).classList.add('active');
  });
});

// ============ 帖子管理 ============

let postsPage = 1;
let postsKeyword = '';

async function loadPosts() {
  try {
    const params = new URLSearchParams({ page: postsPage, limit: 15 });
    if (postsKeyword) params.set('keyword', postsKeyword);
    const data = await adminRequest(`/admin/posts?${params}`);
    renderPosts(data.data.posts, data.data.pagination);
  } catch (err) {
    console.error('加载帖子失败:', err);
  }
}

function renderPosts(posts, pagination) {
  const tbody = document.getElementById('posts-tbody');
  if (!posts.length) {
    tbody.innerHTML = '<tr><td colspan="9" class="empty-tip">暂无帖子</td></tr>';
    document.getElementById('posts-pagination').innerHTML = '';
    return;
  }
  tbody.innerHTML = posts.map(p => `
    <tr>
      <td>${p.id}</td>
      <td class="title-cell" title="${escapeHtml(p.title)}">${escapeHtml(p.title)}</td>
      <td>${escapeHtml(p.author_name)}</td>
      <td>${escapeHtml(p.category_name || '-')}</td>
      <td>${p.view_count}</td>
      <td>${p.like_count}</td>
      <td>${p.comment_count}</td>
      <td>${formatDate(p.created_at)}</td>
      <td><button class="btn-delete" onclick="deletePost(${p.id})">删除</button></td>
    </tr>
  `).join('');
  renderPagination('posts', pagination);
}

window.searchPosts = function() {
  postsKeyword = document.getElementById('search-posts').value.trim();
  postsPage = 1;
  loadPosts();
};

window.deletePost = async function(id) {
  if (!confirm('确定要删除这篇帖子吗？此操作不可撤销。')) return;
  try {
    await adminRequest(`/admin/posts/${id}`, { method: 'DELETE' });
    showToast('帖子已删除', 'success');
    loadPosts();
    loadStats();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

// ============ 评论管理 ============

let commentsPage = 1;
let commentsKeyword = '';

async function loadComments() {
  try {
    const params = new URLSearchParams({ page: commentsPage, limit: 15 });
    if (commentsKeyword) params.set('keyword', commentsKeyword);
    const data = await adminRequest(`/admin/comments?${params}`);
    renderComments(data.data.comments, data.data.pagination);
  } catch (err) {
    console.error('加载评论失败:', err);
  }
}

function renderComments(comments, pagination) {
  const tbody = document.getElementById('comments-tbody');
  if (!comments.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-tip">暂无评论</td></tr>';
    document.getElementById('comments-pagination').innerHTML = '';
    return;
  }
  tbody.innerHTML = comments.map(c => `
    <tr>
      <td>${c.id}</td>
      <td class="content-cell" title="${escapeHtml(c.content)}">${escapeHtml(c.content)}</td>
      <td>${escapeHtml(c.author_name)}</td>
      <td class="title-cell"><a href="detail.html?id=${c.post_id}" target="_blank">${escapeHtml(c.post_title)}</a></td>
      <td>${c.like_count}</td>
      <td>${formatDate(c.created_at)}</td>
      <td><button class="btn-delete" onclick="deleteComment(${c.id})">删除</button></td>
    </tr>
  `).join('');
  renderPagination('comments', pagination);
}

window.searchComments = function() {
  commentsKeyword = document.getElementById('search-comments').value.trim();
  commentsPage = 1;
  loadComments();
};

window.deleteComment = async function(id) {
  if (!confirm('确定要删除这条评论吗？')) return;
  try {
    await adminRequest(`/admin/comments/${id}`, { method: 'DELETE' });
    showToast('评论已删除', 'success');
    loadComments();
    loadStats();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

// ============ 兼职管理 ============

let jobsPage = 1;
let jobsKeyword = '';

async function loadJobs() {
  try {
    const params = new URLSearchParams({ page: jobsPage, limit: 15 });
    if (jobsKeyword) params.set('keyword', jobsKeyword);
    const data = await adminRequest(`/admin/jobs?${params}`);
    renderJobs(data.data.jobs, data.data.pagination);
  } catch (err) {
    console.error('加载兼职失败:', err);
  }
}

function renderJobs(jobs, pagination) {
  const tbody = document.getElementById('jobs-tbody');
  if (!jobs.length) {
    tbody.innerHTML = '<tr><td colspan="9" class="empty-tip">暂无兼职信息</td></tr>';
    document.getElementById('jobs-pagination').innerHTML = '';
    return;
  }
  tbody.innerHTML = jobs.map(j => `
    <tr>
      <td>${j.id}</td>
      <td class="title-cell" title="${escapeHtml(j.title)}">${escapeHtml(j.title)}</td>
      <td>${escapeHtml(j.publisher_name)}</td>
      <td>${escapeHtml(j.salary || '-')}</td>
      <td>${escapeHtml(j.location || '-')}</td>
      <td>${j.apply_count}</td>
      <td>${j.status === 'open' ? '开放' : '关闭'}</td>
      <td>${formatDate(j.created_at)}</td>
      <td><button class="btn-delete" onclick="deleteJob(${j.id})">删除</button></td>
    </tr>
  `).join('');
  renderPagination('jobs', pagination);
}

window.searchJobs = function() {
  jobsKeyword = document.getElementById('search-jobs').value.trim();
  jobsPage = 1;
  loadJobs();
};

window.deleteJob = async function(id) {
  if (!confirm('确定要删除这条兼职信息吗？')) return;
  try {
    await adminRequest(`/admin/jobs/${id}`, { method: 'DELETE' });
    showToast('兼职信息已删除', 'success');
    loadJobs();
    loadStats();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

// ============ 分页渲染 ============

function renderPagination(type, pagination) {
  const container = document.getElementById(`${type}-pagination`);
  const { page, totalPages } = pagination;

  container.innerHTML = `
    <button ${page <= 1 ? 'disabled' : ''} onclick="goPage('${type}', ${page - 1})">上一页</button>
    <span class="page-info">第 ${page} / ${totalPages} 页</span>
    <button ${page >= totalPages ? 'disabled' : ''} onclick="goPage('${type}', ${page + 1})">下一页</button>
  `;
}

window.goPage = function(type, page) {
  if (type === 'posts') { postsPage = page; loadPosts(); }
  else if (type === 'comments') { commentsPage = page; loadComments(); }
  else if (type === 'jobs') { jobsPage = page; loadJobs(); }
};

// ============ 工具函数 ============

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ============ 搜索框回车事件 ============

document.getElementById('search-posts').addEventListener('keydown', e => { if (e.key === 'Enter') window.searchPosts(); });
document.getElementById('search-comments').addEventListener('keydown', e => { if (e.key === 'Enter') window.searchComments(); });
document.getElementById('search-jobs').addEventListener('keydown', e => { if (e.key === 'Enter') window.searchJobs(); });

// ============ 启动 ============

initNav();
loadStats();
loadPosts();
loadComments();
loadJobs();
