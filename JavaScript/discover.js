import { getPosts, getCurrentUser, searchPosts } from './api.js';
import { showLoading, hideLoading, showToast } from './ui.js';
import { checkAuth } from './auth.js';
import { bindMenuToggle } from './utils.js';

// 加载热门帖子
async function loadHotPosts() {
  showLoading();
  try {
    const posts = await getPosts();
    // 按浏览量+点赞排序
    const hotPosts = [...posts].sort((a, b) => {
      const scoreA = (a.viewCount || 0) + (a.likeCount || 0) * 3 + (a.commentCount || 0) * 2;
      const scoreB = (b.viewCount || 0) + (b.likeCount || 0) * 3 + (b.commentCount || 0) * 2;
      return scoreB - scoreA;
    }).slice(0, 5);
    
    const container = document.getElementById('hot-posts');
    if (hotPosts.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding: 30px;">
          <p class="empty-state-text">暂无热门帖子</p>
        </div>
      `;
      return;
    }
    container.innerHTML = hotPosts.map((post, index) => `
      <article class="post-item" onclick="location.href='detail.html?id=${post.id}'" style="cursor:pointer;">
        <div style="display: flex; align-items: flex-start; gap: 12px;">
          <span style="display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; background: ${index < 3 ? 'linear-gradient(135deg, #ff6b6b, #f56c6c)' : '#eee'}; color: ${index < 3 ? '#fff' : '#999'}; font-size: 13px; font-weight: 600; flex-shrink: 0;">${index + 1}</span>
          <div style="flex: 1;">
            <h3>${post.title}</h3>
            <div class="post-meta">作者: <a href="profile.html?username=${encodeURIComponent(post.author)}" onclick="event.stopPropagation()" style="color: #4CAF50; text-decoration: none;">${post.author}</a> | ${post.createdAt}</div>
            <div class="post-summary">${(post.content || '').substring(0, 100)}...</div>
            <div class="post-stats" style="margin-top: 8px;">
              <span class="stat-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                ${post.viewCount || 0}
              </span>
              <span class="stat-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                ${post.likeCount || 0}
              </span>
              <span class="stat-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                ${post.commentCount || 0}
              </span>
            </div>
          </div>
        </div>
      </article>
    `).join('');
  } catch (e) {
    showToast('加载热门帖子失败', 'error');
  } finally {
    hideLoading();
  }
}

// 加载活跃用户（从帖子数据提取真实用户）
async function loadRecommendedUsers() {
  try {
    const posts = await getPosts();
    // 统计每个用户的发帖数
    const userMap = {};
    posts.forEach(post => {
      if (!userMap[post.author]) {
        userMap[post.author] = { username: post.author, postCount: 0 };
      }
      userMap[post.author].postCount++;
    });
    
    // 按发帖量排序取前6
    const activeUsers = Object.values(userMap)
      .sort((a, b) => b.postCount - a.postCount)
      .slice(0, 6);
    
    const container = document.getElementById('recommended-users');
    if (activeUsers.length === 0) {
      container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">暂无推荐用户</p>';
      return;
    }
    
    const colors = ['#4CAF50', '#66BB6A', '#e6a23c', '#f56c6c', '#909399', '#b37feb'];
    container.innerHTML = activeUsers.map((user, i) => `
      <div class="user-card" style="width: calc(33.333% - 12px); min-width: 180px; cursor: pointer;" onclick="location.href='profile.html?username=${encodeURIComponent(user.username)}'">
        <div class="user-avatar" style="background: ${colors[i % colors.length]}; width: 48px; height: 48px; font-size: 20px; flex-shrink: 0;">
          ${user.username.charAt(0).toUpperCase()}
        </div>
        <div class="user-card-info">
          <div class="user-card-name">${user.username}</div>
          <div class="user-card-bio">发帖 ${user.postCount} 篇</div>
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error('加载推荐用户失败:', e);
  }
}



// 初始化
function init() {
  // 绑定汉堡菜单事件
  bindMenuToggle();
  checkAuth();
  loadHotPosts();
  loadRecommendedUsers();
}

init();