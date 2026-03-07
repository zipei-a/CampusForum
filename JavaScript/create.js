import { createPost, getCategories, getCurrentUser, createOrGetTags } from './api.js';
import { showLoading, hideLoading, showToast } from './ui.js';
import { checkAuth } from './auth.js';
import { bindMenuToggle } from './utils.js';

// 加载分类列表
async function loadCategories() {
  showLoading();
  try {
    const categories = await getCategories();
    const categorySelect = document.getElementById('category');
    
    // 清空现有选项
    categorySelect.innerHTML = '';
    
    // 添加默认选项
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '请选择分类';
    categorySelect.appendChild(defaultOption);
    
    // 添加分类选项
    categories.forEach(category => {
      if (category.name !== '全部') { // 排除"全部"分类
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      }
    });
  } catch (e) {
    showToast('加载分类失败', 'error');
  } finally {
    hideLoading();
  }
}



document.addEventListener('DOMContentLoaded', async () => {
  // 绑定汉堡菜单事件
  bindMenuToggle();
  // 检查登录态
  checkAuth();
  // 加载分类列表
  await loadCategories();

  // ============ 图片上传 ============
  let uploadedImageUrl = null;
  const uploadArea = document.getElementById('image-upload-area');
  const imageInput = document.getElementById('image-input');
  const imagePreview = document.getElementById('image-preview');
  const previewImg = document.getElementById('preview-img');
  const removeImageBtn = document.getElementById('remove-image');

  if (uploadArea && imageInput) {
    uploadArea.addEventListener('click', () => imageInput.click());
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.style.borderColor = '#4CAF50'; uploadArea.style.background = '#E8F5E9'; });
    uploadArea.addEventListener('dragleave', () => { uploadArea.style.borderColor = '#d9d9d9'; uploadArea.style.background = '#fafafa'; });
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = '#d9d9d9';
      uploadArea.style.background = '#fafafa';
      if (e.dataTransfer.files.length > 0) handleImageUpload(e.dataTransfer.files[0]);
    });
    imageInput.addEventListener('change', () => { if (imageInput.files.length > 0) handleImageUpload(imageInput.files[0]); });
    if (removeImageBtn) {
      removeImageBtn.addEventListener('click', () => {
        uploadedImageUrl = null;
        imagePreview.style.display = 'none';
        uploadArea.style.display = 'block';
        imageInput.value = '';
      });
    }
  }

  async function handleImageUpload(file) {
    if (file.size > 5 * 1024 * 1024) { showToast('图片大小不能超过 5MB', 'error'); return; }
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) { showToast('仅支持 jpg/png/gif/webp 格式', 'error'); return; }

    const formData = new FormData();
    formData.append('image', file);

    showLoading();
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || '上传失败');

      uploadedImageUrl = result.data.url;
      previewImg.src = uploadedImageUrl;
      imagePreview.style.display = 'block';
      uploadArea.style.display = 'none';
      showToast('图片上传成功', 'success');
    } catch (e) {
      showToast('图片上传失败: ' + e.message, 'error');
    } finally {
      hideLoading();
    }
  }

  document.getElementById('create-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // 获取当前登录用户
    const currentUser = getCurrentUser();
    if (!currentUser) {
      showToast('请先登录', 'error');
      setTimeout(() => location.href = 'login.html', 1000);
      return;
    }

    // 验证分类选择
    if (!data.category) {
      showToast('请选择分类', 'error');
      return;
    }

    // 处理标签
    let tags = [];
    if (data.tags && data.tags.trim()) {
      const tagNames = data.tags.split(/[,，]/).map(t => t.trim()).filter(t => t);
      tags = await createOrGetTags(tagNames);
    }

    // 自动添加作者信息
    data.author = currentUser.username;
    data.categoryId = parseInt(data.category);
    data.tags = tags;

    // 如果上传了图片，将图片链接附加到正文
    if (uploadedImageUrl) {
      data.content = data.content + '\n\n[图片](' + uploadedImageUrl + ')';
    }

    showLoading();
    try {
      const res = await createPost(data);
      showToast('发帖成功', 'success');
      setTimeout(() => location.href = `detail.html?id=${res.id}`, 1000);
    } catch (e) {
      showToast('发帖失败', 'error');
    } finally {
      hideLoading();
    }
  });
});