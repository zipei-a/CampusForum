import { getCurrentUser, getPosts } from './api.js';
import { showLoading, hideLoading, showToast } from './ui.js';
import { checkAuth } from './auth.js';
import { bindMenuToggle, formatTime } from './utils.js';

function getNotifications() {
  const data = JSON.parse(localStorage.getItem('campusForumData') || '{}');
  return data.notifications || [];
}

function saveNotifications(notifications) {
  const data = JSON.parse(localStorage.getItem('campusForumData') || '{}');
  data.notifications = notifications;
  localStorage.setItem('campusForumData', JSON.stringify(data));
}

export function createNotification(userId, type, title, content, data = {}) {
  const notifications = getNotifications();
  const notification = {
    id: Date.now(),
    userId,
    type,
    title,
    content,
    data,
    isRead: false,
    createdAt: new Date().toISOString()
  };
  notifications.unshift(notification);
  saveNotifications(notifications);
  return notification;
}

export function getUnreadCount(userId) {
  const notifications = getNotifications();
  return notifications.filter(n => n.userId === userId && !n.isRead).length;
}

async function loadNotifications() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const notifications = getNotifications().filter(n => n.userId === currentUser.id);
  
  const container = document.getElementById('notifications');
  
  if (notifications.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 40px 20px;">
        <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <p class="empty-state-text">暂无系统通知</p>
      </div>
    `;
    return;
  }

  container.innerHTML = notifications.map(notification => `
    <div class="notification-item ${notification.isRead ? '' : 'unread'}" data-id="${notification.id}">
      <div class="notification-icon ${notification.type}">
        ${getNotificationIcon(notification.type)}
      </div>
      <div class="notification-content">
        <div class="notification-title">${notification.title}</div>
        <div class="notification-text">${notification.content}</div>
        <div class="notification-time">${formatTime(notification.createdAt)}</div>
      </div>
      ${!notification.isRead ? `<button class="btn btn-sm btn-outline mark-read" data-id="${notification.id}">标为已读</button>` : ''}
    </div>
  `).join('');

  document.querySelectorAll('.mark-read').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      markAsRead(parseInt(btn.dataset.id));
    });
  });
}

async function loadCommentReplies() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const posts = await getPosts();
  const userPosts = posts.filter(p => p.author === currentUser.username);
  
  const allComments = [];
  userPosts.forEach(post => {
    if (post.comments && post.comments.length > 0) {
      post.comments.forEach(comment => {
        if (comment.author !== currentUser.username) {
          allComments.push({
            ...comment,
            postId: post.id,
            postTitle: post.title
          });
        }
      });
    }
  });

  allComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  const container = document.getElementById('comment-replies');
  
  if (allComments.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 40px 20px;">
        <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <p class="empty-state-text">暂无评论回复</p>
      </div>
    `;
    return;
  }

  container.innerHTML = allComments.slice(0, 20).map(comment => `
    <div class="notification-item" onclick="location.href='detail.html?id=${comment.postId}'">
      <div class="notification-icon comment">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </div>
      <div class="notification-content">
        <div class="notification-title">
          <strong>${comment.author}</strong> 评论了你的帖子
        </div>
        <div class="notification-text">
          <span style="color: #4CAF50;">《${comment.postTitle}》</span>：${comment.content}
        </div>
        <div class="notification-time">${comment.createdAt}</div>
      </div>
    </div>
  `).join('');
}

function getNotificationIcon(type) {
  switch (type) {
    case 'comment':
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>`;
    case 'like':
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
      </svg>`;
    case 'system':
    default:
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>`;
  }
}

function markAsRead(notificationId) {
  const notifications = getNotifications();
  const notification = notifications.find(n => n.id === notificationId);
  if (notification) {
    notification.isRead = true;
    saveNotifications(notifications);
    loadNotifications();
    updateNotificationBadge();
    showToast('已标记为已读', 'success');
  }
}

function markAllAsRead() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const notifications = getNotifications();
  notifications.forEach(n => {
    if (n.userId === currentUser.id) {
      n.isRead = true;
    }
  });
  saveNotifications(notifications);
  loadNotifications();
  updateNotificationBadge();
  showToast('已全部标记为已读', 'success');
}

function updateNotificationBadge() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const unreadCount = getUnreadCount(currentUser.id);
  const badge = document.getElementById('notification-badge');
  
  if (badge) {
    if (unreadCount > 0) {
      badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
      badge.style.display = 'inline-flex';
    } else {
      badge.style.display = 'none';
    }
  }
}

function init() {
  // 绑定汉堡菜单事件
  bindMenuToggle();
  checkAuth();
  
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToast('请先登录', 'error');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1000);
    return;
  }

  showLoading();
  try {
    loadNotifications();
    loadCommentReplies();
    updateNotificationBadge();
  } catch (e) {
    showToast('加载消息失败', 'error');
  } finally {
    hideLoading();
  }

  const markAllBtn = document.getElementById('mark-all-read');
  if (markAllBtn) {
    markAllBtn.addEventListener('click', markAllAsRead);
  }
}

init();

window.markAsRead = markAsRead;
window.markAllAsRead = markAllAsRead;
