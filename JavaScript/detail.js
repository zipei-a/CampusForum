import { getPostDetail, getComments, createComment, getCurrentUser, deletePost, deleteComment, getCategoryName, getUnreadNotificationCount } from './api.js';
import { showLoading, hideLoading, showToast } from './ui.js';
import { checkAuth } from './auth.js';
import { escapeHtml } from './utils.js';

// 加载评论列表
async function loadComments(postId) {
  const listEl = document.getElementById('comments-list');
  if (!listEl) return;

  try {
    const data = await getComments(postId);
    console.log('Comments API response:', data);
    const comments = (data && data.comments) || [];
    if (comments.length === 0) {
      listEl.innerHTML = '<div class="empty-hint" style="color:#999;text-align:center;padding:16px 0;">暂无评论，快来抢沙发吧~</div>';
      return;
    }
    const currentUser = getCurrentUser();
    listEl.innerHTML = comments.map(c => {
      const isCommentAuthor = currentUser && c.author?.id === currentUser.id;
      return `
      <div class="comment-item" style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
        <div class="comment-meta" style="display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #888;">
          <div>
            <a href="profile.html?username=${encodeURIComponent(c.author?.username || '匿名')}" style="color: #4CAF50; text-decoration: none; font-weight: 500;">${escapeHtml(c.author?.username || '匿名')}</a>
            <span style="margin-left: 8px;">${c.createdAt || ''}</span>
          </div>
          ${isCommentAuthor ? `<a href="javascript:void(0)" onclick="confirmDeleteComment(${c.id}, ${postId})" style="color: #f44336; font-size: 12px; text-decoration: none; cursor: pointer;">删除</a>` : ''}
        </div>
        <div style="margin-top: 8px; line-height: 1.6;">${escapeHtml(c.content || '')}</div>
        ${c.replies && c.replies.length > 0 ? `
          <div style="margin-top: 8px; padding-left: 16px; border-left: 2px solid #e8e8e8;">
            ${c.replies.map(r => {
              const isReplyAuthor = currentUser && r.author?.id === currentUser.id;
              return `
              <div style="padding: 8px 0; font-size: 13px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <a href="profile.html?username=${encodeURIComponent(r.author?.username || '匿名')}" style="color: #4CAF50; text-decoration: none;">${escapeHtml(r.author?.username || '匿名')}</a>
                    <span style="color: #999;"> 回复 </span>
                    <a href="profile.html?username=${encodeURIComponent(r.replyTo?.username || '匿名')}" style="color: #4CAF50; text-decoration: none;">${escapeHtml(r.replyTo?.username || '匿名')}</a>
                    <span style="color: #999; margin-left: 8px;">${r.createdAt || ''}</span>
                  </div>
                  ${isReplyAuthor ? `<a href="javascript:void(0)" onclick="confirmDeleteComment(${r.id}, ${postId})" style="color: #f44336; font-size: 12px; text-decoration: none; cursor: pointer;">删除</a>` : ''}
                </div>
                <div style="margin-top: 4px;">${escapeHtml(r.content || '')}</div>
              </div>
            `}).join('')}
          </div>
        ` : ''}
      </div>
    `}).join('');
  } catch (e) {
    console.error('loadComments error:', e);
    listEl.innerHTML = '<div class="empty-hint" style="color:#999;text-align:center;padding:16px 0;">评论加载失败，请刷新重试</div>';
  }
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
        <a href="javascript:void(0)" onclick="window.history.length > 1 ? window.history.back() : location.href='index.html'" style="display: inline-flex; align-items: center; gap: 4px; color: #4CAF50; font-size: 14px; cursor: pointer;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          返回
        </a>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
        <h2>${escapeHtml(post.title)}</h2>
        ${isAuthor ? `
          <button class="btn btn-sm btn-danger" onclick="confirmDeletePost(${id})" style="white-space: nowrap;">删除帖子</button>
        ` : ''}
      </div>
      <div class="post-meta">作者: <a href="profile.html?username=${encodeURIComponent(post.author)}" style="color: #4CAF50; text-decoration: none;">${escapeHtml(post.author)}</a> | 分类: ${escapeHtml(getCategoryName(post.categoryId))} | ${post.createdAt}</div>
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
        <span id="comment-count-stat" class="stat-item" onclick="document.getElementById('comments-section').scrollIntoView({behavior:'smooth'})" style="cursor: pointer;" title="查看评论">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span id="comment-count-number">${post.commentCount || 0}</span> 评论
        </span>
      </div>
    `;

    // 从独立接口加载评论
    await loadComments(id);

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
      document.getElementById('comment-input').value = '';
      // 更新评论计数显示
      const commentCountNum = document.getElementById('comment-count-number');
      if (commentCountNum) {
        commentCountNum.textContent = parseInt(commentCountNum.textContent || '0') + 1;
      }
      await loadComments(id);
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

// 确认删除评论
function confirmDeleteComment(commentId, postId) {
  if (confirm('确定要删除这条评论吗？')) {
    deleteCommentById(commentId, postId);
  }
}

// 删除评论
async function deleteCommentById(commentId, postId) {
  try {
    await deleteComment(commentId);
    showToast('评论已删除', 'success');
    const commentCountNum = document.getElementById('comment-count-number');
    if (commentCountNum) {
      commentCountNum.textContent = Math.max(0, parseInt(commentCountNum.textContent || '0') - 1);
    }
    await loadComments(postId);
  } catch (e) {
    showToast(e.message, 'error');
  }
}

// 暴露全局函数
window.confirmDeletePost = confirmDeletePost;
window.deletePostById = deletePostById;
window.confirmDeleteComment = confirmDeleteComment;

// 初始化
async function init() {
  checkAuth();
  await loadPost();
  updateNotificationBadge();
  // 支持 #comments-section 锚点自动滚动到评论区
  if (window.location.hash === '#comments-section') {
    const el = document.getElementById('comments-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
}

async function updateNotificationBadge() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  try {
    const count = await getUnreadNotificationCount();
    const badge = document.getElementById('notification-badge');
    if (badge) {
      if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.display = 'inline-flex';
      } else {
        badge.style.display = 'none';
      }
    }
  } catch (e) { /* ignore */ }
}

init();