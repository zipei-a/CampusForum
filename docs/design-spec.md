# 校园论坛设计规范文档

## 1. 设计系统概述

### 1.1 设计原则
- **一致性**：统一的视觉语言和交互模式
- **可访问性**：符合WCAG 2.1 AA级标准
- **响应式**：适配多种设备和屏幕尺寸
- **性能优先**：优化加载速度和交互响应

### 1.2 技术栈
- HTML5 + CSS3 + JavaScript (ES6+)
- 模块化架构设计
- CSS变量实现主题定制
- Fetch API进行数据交互

---

## 2. 色彩系统

### 2.1 主色调
| 名称 | 变量名 | 色值 | 用途 |
|------|--------|------|------|
| 品牌主色 | --tpmd-brand-color-500 | #6229ff | 主要按钮、链接、强调元素 |
| 品牌深色 | --tpmd-brand-color-600 | #5400e5 | 悬停状态 |
| 品牌浅色 | --tpmd-brand-color-100 | #dedbff | 背景色、选中状态 |

### 2.2 功能色
| 名称 | 变量名 | 色值 | 用途 |
|------|--------|------|------|
| 成功 | --tpmd-color-green-base | #01fe73 | 成功提示、完成状态 |
| 警告 | --tpmd-color-yellow-base | #fd0 | 警告提示、待处理状态 |
| 错误 | --tpmd-color-red-base | #ff3014 | 错误提示、删除操作 |
| 信息 | --tpmd-gray-light-500 | #7d7f82 | 一般信息、次要文本 |

### 2.3 中性色
| 名称 | 变量名 | 色值 | 用途 |
|------|--------|------|------|
| 主文本 | --tpmd-gray-light-900 | #222325 | 标题、正文 |
| 次要文本 | --tpmd-gray-light-600 | #53565a | 描述、辅助信息 |
| 禁用文本 | --tpmd-gray-light-400 | #a6a7ab | 禁用状态文本 |
| 边框 | --tpmd-gray-light-a-200 | #25272d1a | 分割线、边框 |
| 背景色 | --tpmd-gray-light-50 | #fafafa | 页面背景 |

---

## 3. 字体规范

### 3.1 字体家族
```css
font-family: 'PingFangSC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### 3.2 字号层级
| 名称 | 字号 | 行高 | 字重 | 用途 |
|------|------|------|------|------|
| H1 | 28px | 1.4 | 600 | 页面标题 |
| H2 | 24px | 1.4 | 600 | 模块标题 |
| H3 | 18px | 1.5 | 600 | 小节标题 |
| 正文 | 14px | 1.6 | 400 | 正文内容 |
| 辅助 | 12px | 1.5 | 400 | 辅助信息、时间戳 |

---

## 4. 间距系统

### 4.1 基础间距
使用4px为基础单位，常用间距值：
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- xxl: 48px

### 4.2 组件内间距
```css
.card { padding: 24px; }
.form-group { margin-bottom: 16px; }
.btn { padding: 8px 16px; }
```

---

## 5. 圆角规范

| 名称 | 值 | 用途 |
|------|-----|------|
| xs | 4px | 小型元素、标签 |
| sm | 6px | 按钮、输入框 |
| md | 8px | 卡片 |
| lg | 12px | 弹窗、大卡片 |
| full | 9999px | 圆形头像、徽章 |

---

## 6. 阴影系统

### 6.1 阴影层级
```css
--tpmd-shadow-elevated-sm: 0 2px 4px rgba(0, 18, 38, 0.1);
--tpmd-shadow-elevated-md: 0 4px 10px rgba(0, 18, 38, 0.1);
--tpmd-shadow-elevated-lg: 0 8px 24px rgba(0, 18, 38, 0.12);
```

---

## 7. 组件规范

### 7.1 按钮组件

#### 主要按钮
```css
.btn-primary {
  background: var(--tpmd-brand-color-500);
  color: #fff;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}
.btn-primary:hover {
  background: var(--tpmd-brand-color-600);
}
```

#### 次要按钮
```css
.btn-outline {
  background: transparent;
  color: var(--tpmd-gray-light-900);
  border: 1px solid var(--tpmd-gray-light-a-200);
  padding: 8px 16px;
  border-radius: 6px;
}
.btn-outline:hover {
  background: var(--tpmd-gray-light-100);
}
```

#### 按钮尺寸
| 尺寸 | padding | font-size |
|------|---------|-----------|
| small | 4px 12px | 12px |
| medium | 8px 16px | 14px |
| large | 12px 24px | 16px |

### 7.2 表单组件

#### 输入框
```css
.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--tpmd-gray-light-a-200);
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}
.form-control:focus {
  outline: none;
  border-color: var(--tpmd-brand-color-500);
  box-shadow: 0 0 0 3px rgba(98, 41, 255, 0.1);
}
```

#### 文本域
```css
textarea.form-control {
  min-height: 100px;
  resize: vertical;
}
```

### 7.3 卡片组件
```css
.card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: var(--tpmd-shadow-elevated-sm);
  border: 1px solid var(--tpmd-gray-light-a-200);
}
```

### 7.4 标签组件
```css
.tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: var(--tpmd-brand-color-100);
  color: var(--tpmd-brand-color-600);
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.tag:hover {
  background: var(--tpmd-brand-color-200);
}
.tag.active {
  background: var(--tpmd-brand-color-500);
  color: #fff;
}
```

### 7.5 导航栏组件
```css
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid var(--tpmd-gray-light-a-200);
  position: sticky;
  top: 0;
  z-index: 100;
}
```

---

## 8. 响应式设计标准

### 8.1 断点定义
| 名称 | 断点 | 用途 |
|------|------|------|
| xs | < 576px | 手机竖屏 |
| sm | ≥ 576px | 手机横屏/小平板 |
| md | ≥ 768px | 平板竖屏 |
| lg | ≥ 992px | 平板横屏/小桌面 |
| xl | ≥ 1200px | 大桌面 |

### 8.2 响应式布局规则

#### 移动端 (xs-sm)
- 单列布局
- 侧边栏隐藏或折叠
- 导航栏收缩为汉堡菜单
- 字号适当缩小

#### 平板端 (md-lg)
- 双列布局
- 侧边栏可展开/收起
- 导航栏完整显示

#### 桌面端 (xl+)
- 多列布局
- 完整侧边栏
- 宽度最大限制 (max-width: 1200px)

### 8.3 响应式CSS示例
```css
.container {
  width: 100%;
  padding: 0 16px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .container {
    padding: 0 24px;
  }
}

@media (min-width: 1200px) {
  .container {
    max-width: 1200px;
  }
}
```

---

## 9. 交互规范

### 9.1 过渡动画
```css
--tpmd-transition-duration-default: 0.2s;
--tpmd-transition-easing-default: cubic-bezier(0.46, 0.03, 0.52, 0.96);
```

### 9.2 悬停状态
- 按钮：背景色加深10%
- 链接：添加下划线
- 卡片：轻微上移 + 阴影增强

### 9.3 加载状态
- 使用旋转动画指示加载中
- 禁用交互元素防止重复提交

### 9.4 Toast提示
```javascript
showToast(message, type)
// type: 'success' | 'error' | 'info' | 'warning'
```

---

## 10. 图标规范

### 10.1 图标尺寸
| 名称 | 尺寸 | 用途 |
|------|------|------|
| xs | 12px | 内联图标 |
| sm | 16px | 按钮图标 |
| md | 20px | 导航图标 |
| lg | 24px | 功能图标 |

### 10.2 图标来源
推荐使用：
- Heroicons (https://heroicons.com/)
- Lucide Icons (https://lucide.dev/)

---

## 11. 无障碍规范

### 11.1 对比度
- 正文文本对比度 ≥ 4.5:1
- 大标题对比度 ≥ 3:1

### 11.2 焦点状态
```css
:focus-visible {
  outline: 2px solid var(--tpmd-brand-color-500);
  outline-offset: 2px;
}
```

### 11.3 ARIA属性
- 按钮添加 `role="button"`
- 导航添加 `role="navigation"`
- 表单添加 `aria-label`

---

## 12. 代码规范

### 12.1 命名约定
- CSS类名：小写 + 连字符 (kebab-case)
- JavaScript变量：驼峰命名 (camelCase)
- 常量：大写 + 下划线 (UPPER_SNAKE_CASE)

### 12.2 文件组织
```
CampusForum/
├── Html/           # HTML页面
├── JavaScript/     # JS模块
│   ├── api.js      # API接口
│   ├── auth.js     # 认证模块
│   ├── ui.js       # UI组件
│   └── ...
├── css/            # 样式文件
│   └── style.css   # 主样式
└── docs/           # 文档
```

### 12.3 注释规范
```javascript
/**
 * 函数说明
 * @param {string} param1 - 参数说明
 * @returns {Promise<Object>} 返回值说明
 */
function functionName(param1) {
  // 实现
}
```

---

## 版本记录

| 版本 | 日期 | 修改内容 | 作者 |
|------|------|----------|------|
| 1.0 | 2026-03-05 | 初始版本 | 前端开发组 |
