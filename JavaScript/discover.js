import { showToast } from './ui.js';
import { checkAuth } from './auth.js';
import { getCurrentUser, getUnreadNotificationCount } from './api.js';
import { bindMenuToggle, escapeHtml } from './utils.js';

const JW_HOME = 'https://jw.cqupt.edu.cn';
const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('authToken');
}

// ========== 教务在线 ==========
function initAcademic() {
  const homeLink = document.getElementById('jw-home-link');
  if (homeLink) homeLink.href = JW_HOME;
}

// ========== 兼职模块 ==========
async function loadJobs() {
  const list = document.getElementById('job-list');
  if (!list) return;

  try {
    const res = await fetch(`${API_BASE}/jobs`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    console.log('Jobs API response:', data);
    if (data.code !== 200) {
      throw new Error(data.message || '获取兼职列表失败');
    }
    const jobs = data.data?.jobs || [];
    const currentUser = getCurrentUser();

    if (jobs.length === 0) {
      list.innerHTML = '<div class="empty-hint">暂无兼职信息，快来发布第一条吧！</div>';
      return;
    }

    list.innerHTML = jobs.map(job => `
      <div class="job-item">
        <div class="job-item-top">
          <h3 class="job-title">${escapeHtml(job.title)}</h3>
          ${job.salary ? `<span class="job-salary">${escapeHtml(job.salary)}</span>` : ''}
        </div>
        <p class="job-desc">${escapeHtml(job.description)}</p>
        <div class="job-meta">
          ${job.location ? `<span>📍 ${escapeHtml(job.location)}</span>` : ''}
          <span>👤 ${escapeHtml(job.publisher_name)}</span>
          <span>📞 ${escapeHtml(job.contact)}</span>
          <span>📅 ${new Date(job.created_at).toLocaleDateString()}</span>
          <span>已报名 ${job.apply_count || 0} 人</span>
        </div>
        <div class="job-actions">
          <button class="btn btn-sm btn-primary" onclick="openApplyModal(${job.id})">我要报名</button>
          ${currentUser && currentUser.id === job.publisher_id ? `<button class="btn btn-sm btn-danger" onclick="deleteJob(${job.id})">删除</button>` : ''}
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error('loadJobs error:', e);
    list.innerHTML = '<div class="empty-hint">加载失败，请稍后刷新</div>';
  }
}

// 打开报名弹窗
window.openApplyModal = function(jobId) {
  const user = getCurrentUser();
  if (!user) {
    showToast('请先登录', 'warning');
    return;
  }
  const modal = document.getElementById('job-apply-modal');
  modal.querySelector('input[name="jobId"]').value = jobId;
  modal.style.display = 'flex';
};

// 删除兼职
window.deleteJob = async function(jobId) {
  if (!confirm('确定要删除这条兼职信息吗？')) return;
  try {
    const res = await fetch(`${API_BASE}/jobs/${jobId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await res.json();
    if (data.code === 200) {
      showToast('删除成功', 'success');
      loadJobs();
    } else {
      showToast(data.message || '删除失败', 'error');
    }
  } catch {
    showToast('网络错误', 'error');
  }
};

// 发布兼职表单
function bindPublishForm() {
  const form = document.getElementById('job-publish-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) {
      showToast('请先登录', 'warning');
      return;
    }

    const fd = new FormData(form);
    const body = {
      title: fd.get('title'),
      description: fd.get('description'),
      contact: fd.get('contact'),
      salary: fd.get('salary'),
      location: fd.get('location')
    };

    try {
      const res = await fetch(`${API_BASE}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.code === 200) {
        showToast('发布成功！', 'success');
        form.reset();
        document.getElementById('job-publish-modal').style.display = 'none';
        loadJobs();
      } else {
        showToast(data.message || '发布失败', 'error');
      }
    } catch {
      showToast('网络错误', 'error');
    }
  });
}

// 报名表单
function bindApplyForm() {
  const form = document.getElementById('job-apply-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const jobId = fd.get('jobId');
    const body = {
      name: fd.get('name'),
      phone: fd.get('phone'),
      message: fd.get('message')
    };

    try {
      const res = await fetch(`${API_BASE}/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.code === 200) {
        showToast('报名成功！', 'success');
        form.reset();
        document.getElementById('job-apply-modal').style.display = 'none';
        loadJobs();
      } else {
        showToast(data.message || '报名失败', 'error');
      }
    } catch {
      showToast('网络错误', 'error');
    }
  });
}

// 点击弹窗外部关闭并重置表单
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.style.display = 'none';
      const form = overlay.querySelector('form');
      if (form) form.reset();
    }
  });
});

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

function init() {
  bindMenuToggle();
  checkAuth();
  initAcademic();
  loadJobs();
  bindPublishForm();
  bindApplyForm();
  updateNotificationBadge();
}

init();