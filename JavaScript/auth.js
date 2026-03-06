import { login, register, getCurrentUser, logout } from "./api.js";
import { showToast, showLoading, hideLoading } from "./ui.js";
import { bindMenuToggle } from "./utils.js";

// 登录页面逻辑
export function initLogin() {
  const form = document.getElementById("login-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();

      if (!username || !password) {
        showToast("用户名和密码不能为空", "error");
        return;
      }

      showLoading();
      try {
        await login(username, password);
        showToast("登录成功！", "success");
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1500);
      } catch (err) {
        showToast(err.message, "error");
      } finally {
        hideLoading();
      }
    });
  }
}

// 注册页面逻辑
export function initRegister() {
  const form = document.getElementById("register-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const confirmPassword = document.getElementById("confirm-password").value.trim();
      const agree = document.getElementById("agree").checked;

      if (!username || !email || !password || !confirmPassword) {
        showToast("请填写所有字段", "error");
        return;
      }

      if (password !== confirmPassword) {
        showToast("两次输入的密码不一致", "error");
        return;
      }

      if (!agree) {
        showToast("请阅读并同意服务条款和隐私政策", "error");
        return;
      }

      showLoading();
      try {
        await register(username, password, email);
        showToast("注册成功！即将跳转首页", "success");
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1500);
      } catch (err) {
        showToast(err.message, "error");
      } finally {
        hideLoading();
      }
    });
  }
}

// 检查登录态（在首页/详情页等需要登录的页面调用）
export function checkAuth() {
  const currentUser = getCurrentUser();
  const userInfo = document.getElementById("user-info");
  const userAvatar = document.getElementById("user-avatar");

  if (userInfo) {
    if (currentUser) {
      userInfo.innerHTML = `
        <span>欢迎，${currentUser.username}</span>
        <button class="btn btn-outline" id="logout-btn">退出</button>
      `;

      if (userAvatar) {
        userAvatar.style.display = "flex";
        userAvatar.textContent = currentUser.username.charAt(0).toUpperCase();
        userAvatar.addEventListener("click", () => {
          window.location.href = "profile.html";
        });
      }

      // 绑定退出事件
      document.getElementById("logout-btn").addEventListener("click", () => {
        logout();
        showToast("退出成功", "info");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      });
    } else {
      userInfo.innerHTML = `
        <a href="login.html" class="btn btn-outline">登录</a>
        <a href="register.html" class="btn btn-primary">注册</a>
      `;
      if (userAvatar) {
        userAvatar.style.display = "none";
      }
    }
  }
}



// 初始化认证功能
document.addEventListener('DOMContentLoaded', () => {
  // 绑定汉堡菜单事件
  bindMenuToggle();
  
  // 检查当前页面并初始化相应功能
  if (window.location.pathname.includes('login.html')) {
    initLogin();
  } else if (window.location.pathname.includes('register.html')) {
    initRegister();
  } else {
    // 其他页面检查登录态
    checkAuth();
  }
});