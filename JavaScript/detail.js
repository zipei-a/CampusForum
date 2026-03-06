import { getPostDetail, createComment, getCurrentUser, deletePost, getCategoryName } from './api.js';
import { showLoading, hideLoading, showToast } from './ui.js';
import { checkAuth } from './auth.js';

// HTML转义，防止XSS攻击
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function loadPost() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) return showToast('缺少帖子ID', 'error');

  showLoading();
  try {
    const post = await getPostDetail(id);
    const currentUser = getCurrentUser();
    const isAuthor = currentUser && post.author === currentUser.username;
    
    document.getElementById('post-detail').innerHTML = `
      <div style="margin-bottom: 16px;">
        <a href="javascript:void(0)" onclick="window.history.length > 1 ? window.history.back() : location.href='index.html'" style="display: inline-flex; align-items: center; gap: 4px; color: #409eff; font-size: 14px; cursor: pointer;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          返回
        </a>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
        <h2>${escapeHtml(post.title)}</h2>
        ${isAuthor ? `
          <button class="btn btn-sm btn-outline" onclick="confirmDeletePost(${id})">删除帖子</button>
        ` : ''}
      </div>
      <div class="post-meta">作者: ${escapeHtml(post.author)} | 分类: ${escapeHtml(getCategoryName(post.categoryId))} | ${post.createdAt}</div>
      <div style="margin-top: 16px; line-height: 1.8; white-space: pre-wrap;">${escapeHtml(post.content)}</div>
      ${post.tags && post.tags.length > 0 ? `
        <div class="post-tags" style="margin-top: 16px;">
          ${post.tags.map(t => `<span class="tag">${escapeHtml(t.name || t)}</span>`).join('')}
        </div>
      ` : ''}
      <div class="post-stats" style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #f0f0f0;">
        <span class="stat-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          ${post.viewCount || 0} 浏览
        </span>
        <span class="stat-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
          ${post.likeCount || 0} 点赞
        </span>
        <span class="stat-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          ${post.commentCount || 0} 评论
        </span>
      </div>
    `;

    const comments = post.comments || [];
    const listEl = document.getElementById('comments-list');
    listEl.innerHTML = comments.map(c => `
      <div class="comment-item">
        <div class="comment-meta">${escapeHtml(c.author)} | ${c.createdAt}</div>
        <div style="margin-top: 8px;">${escapeHtml(c.content)}</div>
      </div>
    `).join('');

    document.getElementById('submit-comment').onclick = async () => {
      const content = document.getElementById('comment-input').value.trim();
      if (!content) return showToast('评论不能为空', 'error');
      
      // 检查登录态
      const currentUser = getCurrentUser();
      if (!currentUser) {
        showToast('请先登录', 'error');
        setTimeout(() => location.href = 'login.html', 1000);
        return;
      }
      
      await createComment(id, content);
      showToast('评论成功', 'success');
      location.reload();
    };
  } catch (e) {
    showToast('加载失败', 'error');
  } finally {
    hideLoading();
  }
}

// 确认删除帖子
function confirmDeletePost(postId) {
  if (confirm('确定要删除这篇帖子吗？此操作不可撤销。')) {
    deletePostById(postId);
  }
}

// 删除帖子
async function deletePostById(postId) {
  showLoading();
  try {
    await deletePost(postId);
    showToast('删除成功！', 'success');
    setTimeout(() => {
      location.href = 'index.html';
    }, 1500);
  } catch (e) {
    showToast(e.message, 'error');
  } finally {
    hideLoading();
  }
}

// 暴露全局函数
window.confirmDeletePost = confirmDeletePost;
window.deletePostById = deletePostById;

// 初始化
function init() {
  checkAuth();
  loadPost();
}

init();