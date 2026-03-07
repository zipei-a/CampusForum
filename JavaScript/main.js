import { getPosts, deletePost, getCurrentUser, getCategories, getCategoryName, getHotTags, getPostsByTag, searchPosts, toggleLike, isPostLiked, toggleFavorite, isPostFavorited } from './api.js';
import { showLoading, hideLoading, showToast } from './ui.js';
import { checkAuth } from './auth.js';
import { getUnreadCount } from './messages.js';
import { cache } from './cache.js';
import { Pagination } from './pagination.js';
import { bindMenuToggle } from './utils.js';

let pagination = null;
const PAGE_SIZE = 10;

// 渲染帖子列表（支持分类过滤和标签过滤）
async function renderPosts(categoryId = 1, tagName = null, page = 1) {
  console.log('开始渲染帖子列表:', { categoryId, tagName, page });
  showLoading();
  try {
    const cacheKey = `posts_${categoryId}_${tagName || 'all'}`;
    console.log('缓存键:', cacheKey);
    let posts = cache.get(cacheKey);
    console.log('从缓存获取帖子:', posts ? `找到 ${posts.length} 个帖子` : '缓存未命中');
    
    if (!posts) {
      console.log('从API获取帖子...');
      if (tagName) {
        console.log('按标签获取:', tagName);
        posts = await getPostsByTag(tagName);
      } else {
        console.log('获取所有帖子');
        posts = await getPosts();
      }
      console.log('API返回帖子数量:', posts ? posts.length : 0);
      if (posts) {
        cache.set(cacheKey, posts, 30000);
        console.log('帖子已缓存');
      }
    }
    
    if (!posts) {
      console.error('帖子数据为空');
      const container = document.getElementById('post-list');
      container.innerHTML = `
        <div class="empty-state">
          <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:64px;height:64px;margin:0 auto 12px;display:block;opacity:0.4;">
            <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
          </svg>
          <p class="empty-state-text">暂无帖子</p>
        </div>
      `;
      return;
    }
    
    const container = document.getElementById('post-list');
    const paginationContainer = document.getElementById('pagination-container');
    const currentUser = getCurrentUser();
    console.log('当前用户:', currentUser ? currentUser.username : '未登录');
    
    // 过滤帖子
    let filteredPosts = posts;
    if (categoryId !== 1 && !tagName) {
      console.log('按分类过滤:', categoryId);
      filteredPosts = posts.filter(post => post.categoryId == categoryId);
      console.log('过滤后帖子数量:', filteredPosts.length);
    }
    
    // 分页处理
    const total = filteredPosts.length;
    const totalPages = Math.ceil(total / PAGE_SIZE);
    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
    console.log('分页处理:', { total, totalPages, startIndex, endIndex, paginatedCount: paginatedPosts.length });
    
    container.innerHTML = paginatedPosts.length > 0 ? paginatedPosts.map(post => {
      const isAuthor = currentUser && post.author === currentUser.username;
      const categoryName = getCategoryName(post.categoryId);
      const likeCount = post.likeCount || 0;
      const liked = isPostLiked(post.id);
      const favorited = isPostFavorited(post.id);
      const tagsHtml = post.tags && post.tags.length > 0 
        ? post.tags.map(t => `<span class="tag" onclick="filterByTag('${t.name || t}')">${t.name || t}</span>`).join(' ')
        : '';
      
      return `
        <article class="post-item">
          <div style="cursor: pointer;" onclick="location.href='detail.html?id=${post.id}'">
            <h3>${post.title}</h3>
            <div class="post-meta">作者: ${post.author} | 分类: ${categoryName} | ${post.createdAt}</div>
            <div class="post-summary">${post.content.substring(0, 100)}...</div>
            ${tagsHtml ? `<div class="post-tags">${tagsHtml}</div>` : ''}
          </div>
          <div class="post-stats" style="margin-top: 12px; display: flex; gap: 16px; align-items: center;">
            <span class="stat-item ${liked ? 'liked' : ''}" onclick="handleLike(event, ${post.id})" style="cursor: pointer;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="${liked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
              </svg>
              ${likeCount}
            </span>
            <span class="stat-item ${favorited ? 'favorited' : ''}" onclick="handleFavorite(event, ${post.id})" style="cursor: pointer;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="${favorited ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </span>
            <span class="stat-item" onclick="location.href='detail.html?id=${post.id}#comments-section'" style="cursor: pointer;" title="查看评论">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              ${post.comments ? post.comments.length : 0}
            </span>
          </div>
          ${isAuthor ? `
            <div class="post-actions" style="margin-top: 12px;">
              <button class="btn btn-sm btn-outline" style="margin-right: 8px;" onclick="confirmDelete(${post.id})">删除</button>
            </div>
          ` : ''}
        </article>
      `;
    }).join('') : `
        <div class="empty-state">
          <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:64px;height:64px;margin:0 auto 12px;display:block;opacity:0.4;">
            <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
          </svg>
          <p class="empty-state-text">暂无帖子，来发布第一篇吧！</p>
          <a href="create.html" class="btn btn-primary">发布帖子</a>
        </div>
      `;
    
    // 渲染分页
    if (paginationContainer && totalPages > 1) {
      console.log('渲染分页:', { totalPages, currentPage: page });
      pagination = new Pagination({
        container: paginationContainer,
        total: total,
        pageSize: PAGE_SIZE,
        currentPage: page,
        onChange: (newPage) => {
          renderPosts(categoryId, tagName, newPage);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
      pagination.render();
    } else if (paginationContainer) {
      console.log('清除分页');
      paginationContainer.innerHTML = '';
    }
  } catch (e) {
    console.error('渲染帖子失败:', e);
    const container = document.getElementById('post-list');
    container.innerHTML = `<p>加载失败: ${e.message || '请检查网络或后端服务。'}</p>`;
  } finally {
    console.log('渲染完成');
    hideLoading();
  }
}

// 处理点赞
async function handleLike(event, postId) {
  event.stopPropagation();
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToast('请先登录', 'error');
    return;
  }
  
  try {
    const result = await toggleLike(postId);
    showToast(result.isLiked ? '点赞成功' : '取消点赞', 'success');
    cache.delete(`posts_${getCurrentCategoryId()}_${getCurrentTagName() || 'all'}`);
    const currentPage = pagination ? pagination.currentPage : 1;
    renderPosts(getCurrentCategoryId(), getCurrentTagName(), currentPage);
  } catch (e) {
    showToast(e.message, 'error');
  }
}

// 处理收藏
async function handleFavorite(event, postId) {
  event.stopPropagation();
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToast('请先登录', 'error');
    return;
  }
  
  try {
    const result = await toggleFavorite(postId);
    showToast(result.isFavorited ? '收藏成功' : '取消收藏', 'success');
    cache.delete(`posts_${getCurrentCategoryId()}_${getCurrentTagName() || 'all'}`);
    const currentPage = pagination ? pagination.currentPage : 1;
    renderPosts(getCurrentCategoryId(), getCurrentTagName(), currentPage);
  } catch (e) {
    showToast(e.message, 'error');
  }
}

// 获取当前选中的分类ID
function getCurrentCategoryId() {
  const activeCategory = document.querySelector('.sidebar ul:first-child li.active');
  if (!activeCategory) return 1;
  const categoryName = activeCategory.textContent.trim();
  if (categoryName.includes('全部')) return 1;
  else if (categoryName.includes('学习交流')) return 2;
  else if (categoryName.includes('生活分享')) return 3;
  else if (categoryName.includes('活动通知')) return 4;
  else if (categoryName.includes('问题求助')) return 5;
  else if (categoryName.includes('兴趣爱好')) return 6;
  return 1;
}

// 获取当前选中的标签名
function getCurrentTagName() {
  const activeTag = document.querySelector('.sidebar > ul:nth-child(4) li.active');
  return activeTag ? activeTag.textContent.trim() : null;
}

// 通过标签筛选帖子
function filterByTag(tagName) {
  // 清除分类选中状态
  document.querySelectorAll('.sidebar ul:first-child li').forEach(c => c.classList.remove('active'));
  document.querySelector('.sidebar ul:first-child li:first-child').classList.add('active');
  
  // 设置标签选中状态
  document.querySelectorAll('.sidebar > ul:nth-child(4) li').forEach(t => {
    if (t.textContent.trim() === tagName) {
      t.classList.add('active');
    } else {
      t.classList.remove('active');
    }
  });
  
  renderPosts(1, tagName);
  showToast(`正在查看标签"${tagName}"下的帖子`, 'info');
}

// 绑定分类点击事件
function bindCategoryEvents() {
  console.log('Binding category events...');
  const categories = document.querySelectorAll('.sidebar > ul:nth-child(2) li');
  console.log('Found categories:', categories.length);
  categories.forEach((category, index) => {
    console.log('Category', index, ':', category.textContent.trim());
    category.addEventListener('click', function() {
      console.log('Category clicked:', this.textContent.trim());
      // 移除所有分类的active类
      categories.forEach(c => c.classList.remove('active'));
      // 添加当前分类的active类
      this.classList.add('active');
      
      // 清除标签选中状态
      document.querySelectorAll('.sidebar > ul:nth-child(4) li').forEach(t => t.classList.remove('active'));
      
      // 获取分类ID
      const categoryName = this.textContent.trim();
      console.log('Category name:', categoryName);
      // 根据分类名称获取分类ID
      let categoryId = 1; // 默认全部
      if (categoryName.includes('学习交流')) categoryId = 2;
      else if (categoryName.includes('生活分享')) categoryId = 3;
      else if (categoryName.includes('活动通知')) categoryId = 4;
      else if (categoryName.includes('问题求助')) categoryId = 5;
      else if (categoryName.includes('兴趣爱好')) categoryId = 6;
      console.log('Category ID:', categoryId);
      
      // 更新URL
      const url = new URL(window.location.href);
      url.searchParams.set('category', categoryId);
      url.searchParams.delete('tag'); // 清除标签参数
      history.pushState({ categoryId, tagName: null }, '', url.toString());
      console.log('URL updated:', url.toString());
      
      // 添加入场动画
      const postList = document.getElementById('post-list');
      if (postList) {
        postList.style.opacity = '0';
        postList.style.transform = 'translateY(20px)';
        postList.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      }
      
      // 渲染对应分类的帖子
      console.log('Rendering posts for category:', categoryId);
      renderPosts(categoryId, null, 1).then(() => {
        console.log('Posts rendered successfully');
        // 动画效果
        setTimeout(() => {
          if (postList) {
            postList.style.opacity = '1';
            postList.style.transform = 'translateY(0)';
          }
        }, 50);
      }).catch(error => {
        console.error('Error rendering posts:', error);
      });
    });
  });
}

// 加载热门标签
async function loadHotTags() {
  console.log('开始加载热门标签...');
  try {
    const hotTags = await getHotTags();
    console.log('获取热门标签:', hotTags);
    const tagsContainer = document.querySelector('.sidebar > ul:nth-child(4)');
    
    if (!tagsContainer) {
      console.error('标签容器未找到');
      return;
    }
    
    // 清空现有标签
    tagsContainer.innerHTML = '';
    
    // 添加热门标签
    hotTags.forEach(tag => {
      const li = document.createElement('li');
      li.textContent = tag.name;
      tagsContainer.appendChild(li);
    });
    
    console.log('热门标签加载完成');
    // 重新绑定标签点击事件
    bindTagEvents();
  } catch (e) {
    console.error('加载热门标签失败:', e);
  }
}

// 绑定标签点击事件
function bindTagEvents() {
  const tags = document.querySelectorAll('.sidebar > ul:nth-child(4) li');
  tags.forEach(tag => {
    tag.addEventListener('click', function() {
      // 清除分类选中状态
      document.querySelectorAll('.sidebar > ul:nth-child(2) li').forEach(c => c.classList.remove('active'));
      document.querySelector('.sidebar > ul:nth-child(2) li:first-child').classList.add('active');
      
      // 设置标签选中状态
      tags.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      const tagName = this.textContent.trim();
      console.log('Tag clicked:', tagName);
      
      // 更新URL
      const url = new URL(window.location.href);
      url.searchParams.set('tag', tagName);
      url.searchParams.set('category', 1); // 标签筛选时分类设为全部
      history.pushState({ categoryId: 1, tagName }, '', url.toString());
      console.log('URL updated:', url.toString());
      
      // 添加入场动画
      const postList = document.getElementById('post-list');
      if (postList) {
        postList.style.opacity = '0';
        postList.style.transform = 'translateY(20px)';
        postList.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      }
      
      // 渲染对应标签的帖子
      console.log('Rendering posts for tag:', tagName);
      renderPosts(1, tagName, 1).then(() => {
        console.log('Posts rendered successfully');
        // 动画效果
        setTimeout(() => {
          if (postList) {
            postList.style.opacity = '1';
            postList.style.transform = 'translateY(0)';
          }
        }, 50);
      }).catch(error => {
        console.error('Error rendering posts:', error);
      });
      
      showToast(`正在查看标签"${tagName}"下的帖子`, 'info');
    });
  });
}

// 确认删除
function confirmDelete(postId) {
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
    // 重新渲染帖子列表
    renderPosts(getCurrentCategoryId(), getCurrentTagName(), 1);
  } catch (e) {
    showToast(e.message, 'error');
  } finally {
    hideLoading();
  }
}

// 暴露全局函数
window.confirmDelete = confirmDelete;
window.deletePostById = deletePostById;
window.filterByTag = filterByTag;
window.handleLike = handleLike;
window.handleFavorite = handleFavorite;

// ============ 搜索功能 ============
let currentSearchKeyword = null;

async function handleSearch(keyword) {
  keyword = keyword.trim();
  const titleEl = document.getElementById('post-list-title');
  
  if (!keyword) {
    currentSearchKeyword = null;
    if (titleEl) titleEl.textContent = '最新帖子';
    renderPosts(getCurrentCategoryId(), getCurrentTagName(), 1);
    return;
  }
  
  currentSearchKeyword = keyword;
  if (titleEl) titleEl.textContent = `搜索"${keyword}"的结果`;
  
  showLoading();
  try {
    const results = await searchPosts(keyword);
    const container = document.getElementById('post-list');
    const paginationContainer = document.getElementById('pagination-container');
    const currentUser = getCurrentUser();
    
    if (results.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:64px;height:64px;margin:0 auto 12px;display:block;opacity:0.4;">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="M21 21l-4.35-4.35"></path>
          </svg>
          <p class="empty-state-text">没有找到与"${keyword}"相关的帖子</p>
          <button class="btn btn-outline" onclick="clearSearch()">返回全部帖子</button>
        </div>
      `;
      if (paginationContainer) paginationContainer.innerHTML = '';
      return;
    }
    
    container.innerHTML = results.map(post => `
      <article class="post-item" onclick="location.href='detail.html?id=${post.id}'" style="cursor:pointer;">
        <h3>${post.title}</h3>
        <div class="post-meta">作者: ${post.author} | ${post.createdAt}</div>
        <div class="post-summary">${(post.content || '').substring(0, 100)}...</div>
      </article>
    `).join('');
    if (paginationContainer) paginationContainer.innerHTML = '';
  } catch (e) {
    showToast('搜索失败: ' + e.message, 'error');
  } finally {
    hideLoading();
  }
}

function clearSearch() {
  currentSearchKeyword = null;
  const searchInput = document.getElementById('search-input');
  const titleEl = document.getElementById('post-list-title');
  if (searchInput) searchInput.value = '';
  if (titleEl) titleEl.textContent = '最新帖子';
  renderPosts(getCurrentCategoryId(), getCurrentTagName(), 1);
}
window.clearSearch = clearSearch;

function bindSearchEvents() {
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handleSearch(searchInput.value);
      }
    });
  }
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      handleSearch(searchInput.value);
    });
  }
}



document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOMContentLoaded事件触发');
  try {
    // 绑定汉堡菜单事件
    console.log('绑定汉堡菜单事件');
    bindMenuToggle();
    
    // 检查登录状态
    console.log('检查登录状态');
    checkAuth();
    
    // 加载热门标签
    console.log('加载热门标签');
    await loadHotTags();
    
    // 绑定分类和标签点击事件
    console.log('绑定分类点击事件');
    bindCategoryEvents();
    console.log('绑定标签点击事件');
    bindTagEvents();
    
    // 绑定搜索事件
    console.log('绑定搜索事件');
    bindSearchEvents();
    
    // 绑定popstate事件
    console.log('绑定popstate事件');
    bindPopstateEvent();
    
    // 处理URL参数
    console.log('处理URL参数');
    handleUrlParams();
    
    // 更新通知徽章
    console.log('更新通知徽章');
    updateNotificationBadge();
    
    console.log('DOMContentLoaded事件处理完成');
  } catch (e) {
    console.error('DOMContentLoaded事件处理失败:', e);
  }
});

// 绑定popstate事件
function bindPopstateEvent() {
  window.addEventListener('popstate', function(e) {
    if (e.state && e.state.categoryId) {
      const categoryId = e.state.categoryId;
      
      // 更新侧边栏分类选中状态
      const sidebarCategories = document.querySelectorAll('.sidebar ul:first-child li');
      sidebarCategories.forEach((li, index) => {
        if (index === categoryId - 1) {
          li.classList.add('active');
        } else {
          li.classList.remove('active');
        }
      });
      
      // 清除标签选中状态
      document.querySelectorAll('.sidebar > ul:nth-child(4) li').forEach(t => t.classList.remove('active'));
      
      // 添加入场动画
      const postList = document.getElementById('post-list');
      postList.style.opacity = '0';
      postList.style.transform = 'translateY(20px)';
      postList.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      
      // 渲染对应分类的帖子
      renderPosts(categoryId, null, 1).then(() => {
        // 动画效果
        setTimeout(() => {
          postList.style.opacity = '1';
          postList.style.transform = 'translateY(0)';
        }, 50);
      });
    }
  });
}

// 处理URL参数
function handleUrlParams() {
  console.log('开始处理URL参数...');
  const url = new URL(window.location.href);
  const categoryId = parseInt(url.searchParams.get('category')) || 1;
  const tagName = url.searchParams.get('tag') || null;
  
  console.log('URL参数:', { categoryId, tagName });
  
  if (tagName) {
    console.log('按标签渲染:', tagName);
    // 清除分类选中状态
    const categories = document.querySelectorAll('.sidebar > ul:nth-child(2) li');
    if (categories.length > 0) {
      categories.forEach(c => c.classList.remove('active'));
      categories[0].classList.add('active');
    } else {
      console.error('分类列表未找到');
    }
    
    // 设置标签选中状态
    const tags = document.querySelectorAll('.sidebar > ul:nth-child(4) li');
    tags.forEach(t => {
      if (t.textContent.trim() === tagName) {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    });
    
    // 渲染对应标签的帖子
    renderPosts(1, tagName, 1);
  } else {
    console.log('按分类渲染:', categoryId);
    // 更新侧边栏分类选中状态
    const sidebarCategories = document.querySelectorAll('.sidebar > ul:nth-child(2) li');
    if (sidebarCategories.length > 0) {
      sidebarCategories.forEach((li, index) => {
        if (index === categoryId - 1) {
          li.classList.add('active');
        } else {
          li.classList.remove('active');
        }
      });
    } else {
      console.error('分类列表未找到');
    }
    
    // 清除标签选中状态
    const tags = document.querySelectorAll('.sidebar > ul:nth-child(4) li');
    tags.forEach(t => t.classList.remove('active'));
    
    // 渲染对应分类的帖子
    renderPosts(categoryId, null, 1);
  }
  console.log('URL参数处理完成');
}

// 绑定导航栏分类点击事件
function bindNavbarCategoryEvents() {
  const navbarCategories = document.querySelectorAll('.navbar .menu a[data-category]');
  navbarCategories.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const categoryId = parseInt(this.getAttribute('data-category'));
      
      // 更新导航栏选中状态
      navbarCategories.forEach(a => a.classList.remove('active'));
      this.classList.add('active');
      
      // 更新侧边栏分类选中状态
      const sidebarCategories = document.querySelectorAll('.sidebar ul:first-child li');
      sidebarCategories.forEach((li, index) => {
        if (index === categoryId - 1) {
          li.classList.add('active');
        } else {
          li.classList.remove('active');
        }
      });
      
      // 清除标签选中状态
      document.querySelectorAll('.sidebar > ul:nth-child(4) li').forEach(t => t.classList.remove('active'));
      
      // 更新URL
      const url = new URL(window.location.href);
      url.searchParams.set('category', categoryId);
      history.pushState({ categoryId }, '', url.toString());
      
      // 添加入场动画
      const postList = document.getElementById('post-list');
      postList.style.opacity = '0';
      postList.style.transform = 'translateY(20px)';
      postList.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      
      // 渲染对应分类的帖子
      renderPosts(categoryId, null, 1).then(() => {
        // 动画效果
        setTimeout(() => {
          postList.style.opacity = '1';
          postList.style.transform = 'translateY(0)';
        }, 50);
      });
    });
  });
}

// 更新通知徽章
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