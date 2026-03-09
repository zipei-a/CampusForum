import { showToast } from './ui.js';
import { checkAuth } from './auth.js';
import { bindMenuToggle } from './utils.js';

// 教务在线入口地址（登录页）。所有功能均需登录后才能使用，
// 因此卡片统一跳转到教务首页，由学生登录后自行导航。
const JW_HOME = 'https://jw.cqupt.edu.cn';

// 功能模块列表：仅作展示 & 导航提示，点击后统一跳转教务首页。
const JW_MODULES = [
  { title: '课表查询', icon: '📅', desc: '查看个人课表' },
  { title: '考试安排', icon: '📝', desc: '查看考试时间地点' },
  { title: '成绩查询', icon: '📊', desc: '查询历年成绩' },
  { title: '电子证明', icon: '📄', desc: '开具在读证明等' },
  { title: '教室申请', icon: '🏫', desc: '申请空教室使用' },
  { title: '劳动教育选岗', icon: '📚', desc: '选择劳动教育岗位' },
  { title: '竞赛报名', icon: '🏃', desc: '报名学科竞赛' },
  { title: '学业预警', icon: '📋', desc: '查看学业预警信息' },
  { title: '转专业报名', icon: '📷', desc: '提交转专业申请' },
  { title: '专业分流', icon: '📑', desc: '查看分流方案' }
];

function renderAcademicModules() {
  const grid = document.getElementById('jw-grid');
  const homeLink = document.getElementById('jw-home-link');
  if (!grid || !homeLink) return;

  homeLink.href = JW_HOME;

  grid.innerHTML = JW_MODULES.map(module => `
    <a class="jw-card" href="${JW_HOME}" target="_blank" rel="noopener noreferrer" title="${module.desc}">
      <span class="jw-card-icon">${module.icon}</span>
      <span class="jw-card-title">${module.title}</span>
      <span class="jw-card-desc">${module.desc}</span>
    </a>
  `).join('');

  grid.querySelectorAll('.jw-card').forEach(card => {
    card.addEventListener('click', () => {
      showToast('正在跳转教务系统，请登录后导航到对应功能', 'info');
    });
  });
}

function init() {
  bindMenuToggle();
  checkAuth();
  renderAcademicModules();
}

init();