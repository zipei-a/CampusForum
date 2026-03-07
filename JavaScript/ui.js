// UI 通用操作：提示、加载、弹窗
export function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.top = "20px";
  toast.style.right = "20px";
  toast.style.padding = "10px 20px";
  toast.style.background = type === "success" ? "#4CAF50" : type === "error" ? "#f56c6c" : "#909399";
  toast.style.color = "#fff";
  toast.style.borderRadius = "4px";
  toast.style.zIndex = "9999";
  toast.style.transition = "opacity 0.3s";
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

export function showLoading() {
  const loading = document.createElement("div");
  loading.id = "loading";
  loading.style.position = "fixed";
  loading.style.top = "0";
  loading.style.left = "0";
  loading.style.width = "100%";
  loading.style.height = "100%";
  loading.style.background = "rgba(255,255,255,0.8)";
  loading.style.display = "flex";
  loading.style.justifyContent = "center";
  loading.style.alignItems = "center";
  loading.style.zIndex = "9998";
  loading.innerHTML = `<div class="spinner" style="width:40px;height:40px;border:4px solid #f3f3f3;border-top:4px solid #4CAF50;border-radius:50%;animation:spin 1s linear infinite;"></div><style>@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}</style>`;
  document.body.appendChild(loading);
}

export function hideLoading() {
  const loading = document.getElementById("loading");
  if (loading) loading.remove();
}