import { getCurrentUser, getPosts, getUserFavorites, logout, getUserProfileByUsername, getUserPosts, updateUserProfile, uploadImage } from './api.js';
import { showLoading, hideLoading, showToast } from './ui.js';
import { checkAuth } from './auth.js';
import { bindMenuToggle } from './utils.js';

let currentUser = null;
let profileUser = null; // 正在查看的用户
let isOwnProfile = true; // 是否是自己的主页
let currentTab = 'posts';

async function loadProfile() {
  currentUser = getCurrentUser();
  const params = new URLSearchParams(window.location.search);
  const viewUsername = params.get('username');

  // 判断是查看他人主页还是自己的
  if (viewUsername && (!currentUser || viewUsername !== currentUser.username)) {
    // 查看他人主页
    isOwnProfile = false;
    showLoading();
    try {
      profileUser = await getUserProfileByUsername(viewUsername);
    } catch (e) {
      showToast('用户不存在', 'error');
      setTimeout(() => window.history.back(), 1000);
      return;
    } finally {
      hideLoading();
    }
  } else {
    // 查看自己的主页
    isOwnProfile = true;
    if (!currentUser) {
      showToast('请先登录', 'error');
      setTimeout(() => { window.location.href = 'login.html'; }, 1000);
      return;
    }
    profileUser = currentUser;
  }

  document.title = `${profileUser.username} 的主页 - 校园论坛`;

  const avatar = document.getElementById('profile-avatar');
  const name = document.getElementById('profile-name');
  const bio = document.getElementById('profile-bio');
  const header = document.getElementById('profile-header');

  // 显示头像（图片或首字母）
  if (profileUser.avatar) {
    avatar.innerHTML = `<img src="${profileUser.avatar}" alt="头像" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
  } else {
    avatar.textContent = profileUser.username.charAt(0).toUpperCase();
  }

  // 显示背景图
  if (profileUser.cover_image) {
    header.style.background = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${profileUser.cover_image}') center/cover no-repeat`;
  }

  name.textContent = profileUser.username;
  bio.textContent = profileUser.bio || '这个人很懒，什么都没写~';

  // 他人主页隐藏收藏和设置 tab
  if (!isOwnProfile) {
    const tabs = document.getElementById('profile-tabs');
    if (tabs) {
      tabs.querySelectorAll('.profile-tab').forEach(tab => {
        if (tab.dataset.tab === 'favorites' || tab.dataset.tab === 'settings') {
          tab.style.display = 'none';
        }
      });
    }
  }

  await loadStats();
  await loadTabContent(currentTab);
}

async function loadStats() {
  showLoading();
  try {
    if (isOwnProfile) {
      const posts = await getPosts();
      const userPosts = posts.filter(p => p.author === profileUser.username);
      const favorites = await getUserFavorites();
      let totalLikes = 0;
      userPosts.forEach(post => { totalLikes += post.likeCount || 0; });

      document.getElementById('post-count').textContent = userPosts.length;
      document.getElementById('favorite-count').textContent = favorites.length;
      document.getElementById('like-count').textContent = totalLikes;
    } else {
      // 他人主页使用后端返回的数据
      document.getElementById('post-count').textContent = profileUser.postCount || 0;
      document.getElementById('favorite-count').textContent = '-';
      document.getElementById('like-count').textContent = profileUser.likeCount || 0;
    }
  } catch (e) {
    console.error('加载统计数据失败:', e);
  } finally {
    hideLoading();
  }
}

async function loadTabContent(tab) {
  const container = document.getElementById('tab-content');
  
  switch (tab) {
    case 'posts':
      await loadMyPosts(container);
      break;
    case 'favorites':
      if (isOwnProfile) await loadMyFavorites(container);
      break;
    case 'settings':
      if (isOwnProfile) loadSettings(container);
      break;
  }
}

async function loadMyPosts(container) {
  showLoading();
  try {
    let userPosts;
    if (isOwnProfile) {
      const posts = await getPosts();
      userPosts = posts.filter(p => p.author === profileUser.username);
    } else {
      userPosts = await getUserPosts(profileUser.id);
    }
    
    if (userPosts.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
          </svg>
          <p class="empty-state-text">还没有发布过帖子</p>
          <a href="create.html" class="btn btn-primary">发布第一篇帖子</a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="post-list">
        ${userPosts.map(post => `
          <article class="post-item" onclick="location.href='detail.html?id=${post.id}'">
            <h3>${post.title}</h3>
            <div class="post-meta">${post.createdAt}</div>
            <div class="post-summary">${post.content.substring(0, 100)}...</div>
            <div class="post-stats">
              <span class="stat-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                </svg>
                ${post.likeCount || 0}
              </span>
              <span class="stat-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                ${post.comments ? post.comments.length : 0}
              </span>
            </div>
          </article>
        `).join('')}
      </div>
    `;
  } catch (e) {
    container.innerHTML = '<p>加载失败</p>';
  } finally {
    hideLoading();
  }
}

async function loadMyFavorites(container) {
  showLoading();
  try {
    const favorites = await getUserFavorites();
    
    if (favorites.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          <p class="empty-state-text">还没有收藏过帖子</p>
          <a href="index.html" class="btn btn-primary">去发现精彩内容</a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="post-list">
        ${favorites.map(post => `
          <article class="post-item" onclick="location.href='detail.html?id=${post.id}'">
            <h3>${post.title}</h3>
            <div class="post-meta">作者: ${post.author} | ${post.createdAt}</div>
            <div class="post-summary">${post.content.substring(0, 100)}...</div>
          </article>
        `).join('')}
      </div>
    `;
  } catch (e) {
    container.innerHTML = '<p>加载失败</p>';
  } finally {
    hideLoading();
  }
}

function loadSettings(container) {
  const avatarPreview = profileUser.avatar
    ? `<img src="${profileUser.avatar}" alt="头像" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`
    : `<span style="font-size:32px;color:#fff;">${currentUser.username.charAt(0).toUpperCase()}</span>`;

  const coverPreview = profileUser.cover_image
    ? `<img src="${profileUser.cover_image}" alt="背景" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`
    : `<span style="color:#999;font-size:14px;">点击上传背景图</span>`;

  container.innerHTML = `
    <form id="settings-form">
      <div class="form-group">
        <label>头像</label>
        <div style="display:flex;align-items:center;gap:16px;">
          <div id="avatar-preview" style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#4CAF50,#66BB6A);display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:hidden;flex-shrink:0;border:3px solid #e0e0e0;" title="点击更换头像">
            ${avatarPreview}
          </div>
          <div>
            <button type="button" class="btn btn-sm btn-outline" id="avatar-upload-btn">更换头像</button>
            <input type="file" id="avatar-input" accept="image/jpeg,image/png,image/gif,image/webp" style="display:none;">
            <p style="color:#999;font-size:12px;margin-top:4px;">支持 jpg/png/gif/webp，最大 5MB</p>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>主页背景</label>
        <div id="cover-preview" style="width:100%;height:150px;border-radius:8px;background:linear-gradient(135deg,#4CAF50,#66BB6A);display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:hidden;border:2px dashed #ddd;" title="点击更换背景图">
          ${coverPreview}
        </div>
        <input type="file" id="cover-input" accept="image/jpeg,image/png,image/gif,image/webp" style="display:none;">
        <p style="color:#999;font-size:12px;margin-top:4px;">推荐尺寸 900×300，最大 5MB</p>
      </div>

      <div class="form-group">
        <label for="username">用户名</label>
        <input type="text" id="username" class="form-control" value="${currentUser.username}" disabled style="background: #f5f5f5;" />
        <small style="color: #999; font-size: 12px; margin-top: 4px; display: block;">用户名不可修改</small>
      </div>
      <div class="form-group">
        <label for="bio">个人简介</label>
        <textarea id="bio" class="form-control" placeholder="介绍一下自己吧..." rows="3">${currentUser.bio || ''}</textarea>
      </div>
      <div class="form-group">
        <label for="email">邮箱</label>
        <input type="email" id="email" class="form-control" value="${currentUser.email || ''}" placeholder="请输入邮箱" />
      </div>
      <div style="display: flex; gap: 12px; margin-top: 24px;">
        <button type="submit" class="btn btn-primary">保存修改</button>
        <button type="button" class="btn btn-outline" id="logout-btn">退出登录</button>
      </div>
    </form>
  `;

  // 头像上传
  const avatarInput = document.getElementById('avatar-input');
  document.getElementById('avatar-upload-btn').addEventListener('click', () => avatarInput.click());
  document.getElementById('avatar-preview').addEventListener('click', () => avatarInput.click());
  avatarInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    showLoading();
    try {
      const url = await uploadImage(file);
      document.getElementById('avatar-preview').innerHTML = `<img src="${url}" alt="头像" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
      profileUser.avatar = url;
      showToast('头像已更新，请点击保存修改', 'success');
    } catch (err) {
      showToast(err.message || '上传失败', 'error');
    } finally {
      hideLoading();
    }
  });

  // 背景上传
  const coverInput = document.getElementById('cover-input');
  document.getElementById('cover-preview').addEventListener('click', () => coverInput.click());
  coverInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    showLoading();
    try {
      const url = await uploadImage(file);
      document.getElementById('cover-preview').innerHTML = `<img src="${url}" alt="背景" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`;
      profileUser.cover_image = url;
      showToast('背景已更新，请点击保存修改', 'success');
    } catch (err) {
      showToast(err.message || '上传失败', 'error');
    } finally {
      hideLoading();
    }
  });

  document.getElementById('settings-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const bio = document.getElementById('bio').value.trim();
    const email = document.getElementById('email').value.trim();

    showLoading();
    try {
      await updateUserProfile(currentUser.id, {
        bio,
        email,
        avatar: profileUser.avatar || null,
        cover_image: profileUser.cover_image || null
      });

      currentUser = { ...currentUser, bio, email, avatar: profileUser.avatar, cover_image: profileUser.cover_image };
      profileUser = currentUser;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));

      // 刷新页面头部
      const avatarEl = document.getElementById('profile-avatar');
      if (profileUser.avatar) {
        avatarEl.innerHTML = `<img src="${profileUser.avatar}" alt="头像" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
      }
      const header = document.getElementById('profile-header');
      if (profileUser.cover_image) {
        header.style.background = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${profileUser.cover_image}') center/cover no-repeat`;
      }
      document.getElementById('profile-bio').textContent = bio || '这个人很懒，什么都没写~';

      showToast('保存成功', 'success');
    } catch (e) {
      showToast(e.message || '保存失败', 'error');
    } finally {
      hideLoading();
    }
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    if (confirm('确定要退出登录吗？')) {
      logout();
      showToast('退出成功', 'info');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    }
  });
}

function bindTabEvents() {
  const tabs = document.querySelectorAll('.profile-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      currentTab = this.dataset.tab;
      loadTabContent(currentTab);
    });
  });
}



document.addEventListener('DOMContentLoaded', async () => {
  // 绑定汉堡菜单事件
  bindMenuToggle();
  checkAuth();
  await loadProfile();
  bindTabEvents();
});
