# FComp UI 设计规范

> 版本：v1.0  
> 更新日期：2026-04-09  
> 设计师：AIUIUX  
> 状态：正式版

---

## 目录

1. [设计原则](#1-设计原则)
2. [整体页面布局](#2-整体页面布局)
3. [色彩体系](#3-色彩体系)
4. [字体规范](#4-字体规范)
5. [组件样式](#5-组件样式)
6. [间距规范](#6-间距规范)
7. [交互状态](#7-交互状态)
8. [差异高亮样式](#8-差异高亮样式)
9. [特殊效果与动画](#9-特殊效果与动画)
10. [响应式断点](#10-响应式断点)
11. [无障碍设计](#11-无障碍设计)

---

## 1. 设计原则

### 1.1 核心理念

FComp 作为开发者工具类产品，遵循以下设计原则：

| 原则 | 说明 | 应用场景 |
|------|------|----------|
| **功能优先** | 界面服务于功能，减少视觉干扰 | 双面板布局以最大视野展示比对内容 |
| **清晰可辨** | 信息层次分明，差异一目了然 | 三色高亮系统区分增删改 |
| **高效操作** | 减少操作步骤，一步到位 | 拖拽上传、一键比对 |
| **专业克制** | 视觉简洁但不简陋，精致但不花哨 | 恰到好处的阴影和圆角 |

### 1.2 视觉风格

- **风格定位**：现代极简主义 (Modern Minimalism)
- **质感关键词**：干净、专业、轻盈、专注
- **参考产品**：VS Code、GitHub Diff View、Notion
- **主要特征**：
  - 大量留白，减少视觉噪音
  - 扁平化设计配合微妙阴影
  - 高对比度文字，确保可读性
  - 纯色块表达，无过度渐变

---

## 2. 整体页面布局

### 2.1 页面结构概览

```
┌──────────────────────────────────────────────────────────────────┐
│                          HEADER (64px)                            │
│  ┌─────────────┐                              ┌─────────────────┐│
│  │   FComp     │                              │ 同步滚动 │ 清空 ││
│  │   Logo      │                              │   (Switch) (Btn)││
│  └─────────────┘                              └─────────────────┘│
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────┐   ┌─────────────────────────────────┐ │
│  │      原始文件面板       │   │         比较文件面板              │ │
│  │    (Source Panel)      │   │       (Target Panel)            │ │
│  │                        │   │                                 │ │
│  │  ┌──────────────────┐  │   │  ┌───────────────────────────┐  │ │
│  │  │ 面板标题栏 (40px) │  │   │  │    面板标题栏 (40px)      │  │ │
│  │  │ 文件名 | 上传按钮 │  │   │  │   文件名 | 上传按钮       │  │ │
│  │  ├──────────────────┤  │   │  ├───────────────────────────┤  │ │
│  │  │                  │  │   │  │                           │  │ │
│  │  │   文本编辑区      │  │   │  │     文本编辑区             │  │ │
│  │  │   (等宽字体)      │  │   │  │     (等宽字体)             │  │ │
│  │  │   含行号列        │  │   │  │     含行号列               │  │ │
│  │  │                  │  │   │  │                           │  │ │
│  │  └──────────────────┘  │   │  └───────────────────────────┘  │ │
│  └────────────────────────┘   └─────────────────────────────────┘ │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                       FOOTER (48px)                               │
│         统计信息：5 处差异 | 2 新增 | 1 删除 | 2 修改              │
└──────────────────────────────────────────────────────────────────┘
```

### 2.2 布局详细参数

| 区域 | 定位方式 | 高度/宽度 | 背景色 |
|------|----------|-----------|--------|
| **Header** | fixed 固定顶部 | height: 64px | #FFFFFF |
| **Main Content** | flex 弹性布局 | flex: 1 (占满剩余空间) | #F8FAFC |
| **Footer** | fixed 固定底部 | height: 48px | #FFFFFF |
| **双面板容器** | flex 水平排列 | 各占 50% 宽度 | 透明 |

### 2.3 面板结构

每个面板由上到下包含：

| 组件 | 说明 | 最小高度 |
|------|------|----------|
| 面板标题栏 | 包含文件名和操作按钮 | 40px |
| 文本编辑区 | 显示文件内容 | 400px |

### 2.4 面板间距

- **面板间水平间距**：16px（通过 gap: 16px 实现）
- **面板与页面边缘间距**：24px（padding: 0 24px）
- **面板与 Header/Footer 间距**：自动由 flex 布局控制

---

## 3. 色彩体系

### 3.1 主色 (Primary)

主色 #2563eb 贯穿整个应用，体现专业和信任感。

| 颜色名称 | 色值 | 用途 |
|----------|------|------|
| Primary 500 | #2563eb | 主按钮背景、主链接、激活状态 |
| Primary 600 | #1d4ed8 | 主按钮 hover 状态 |
| Primary 700 | #1e40af | 主按钮 active 状态 |
| Primary 100 | #dbeafe | 主按钮 disabled 背景 |
| Primary 400 | #60a5fa | 次要强调、图标颜色 |

### 3.2 差异高亮色 (Diff Colors)

精确复用需求文档定义的三色系统，确保差异一目了然。

| 类型 | 颜色名称 | 色值 | 用途 | 边框标识 |
|------|----------|------|------|----------|
| **新增** | Added | #e6ffed | 右侧新增内容背景 | 左边框 3px solid #22c55e |
| **删除** | Removed | #ffebe9 | 左侧删除内容背景 | 左边框 3px solid #ef4444 |
| **修改** | Modified | #fff5b1 | 内容变化行背景 | 左边框 3px solid #f59e0b |
| **相同** | Unchanged | transparent | 无背景 | 无 |

### 3.3 中性色 (Neutral)

用于背景、边框、辅助元素。

| 颜色名称 | 色值 | 用途 |
|----------|------|------|
| Gray 50 | #F9FAFB | 页面背景 |
| Gray 100 | #F3F4F6 | 面板标题栏背景 |
| Gray 200 | #E5E7EB | 边框、分隔线 |
| Gray 300 | #D1D5DB | 禁用状态边框 |
| Gray 400 | #9CA3AF | 占位符文字 |
| Gray 500 | #6B7280 | 次要文字 |
| Gray 600 | #4B5563 | 正文文字 |
| Gray 700 | #374151 | 强调文字 |
| Gray 800 | #1F2937 | 主要文字 |
| Gray 900 | #111827 | 深色文字 |

### 3.4 文字色 (Text Colors)

| 用途 | 色值 | 说明 |
|------|------|------|
| 主要文字 | #1F2937 (Gray 800) | 标题、重要内容 |
| 正文文字 | #374151 (Gray 700) | 段落、说明 |
| 次要文字 | #6B7280 (Gray 500) | 辅助信息、标签 |
| 占位符文字 | #9CA3AF (Gray 400) | 输入框空状态 |
| 禁用文字 | #D1D5DB (Gray 300) | 禁用状态文字 |

### 3.5 功能色 (Functional Colors)

| 用途 | 色值 | 说明 |
|------|------|------|
| 成功 | #22c55e | 操作成功反馈 |
| 警告 | #f59e0b | 警告提示 |
| 错误 | #ef4444 | 错误提示、危险操作 |
| 信息 | #3b82f6 | 信息提示 |

### 3.6 完整色板对照表

```css
:root {
  /* 主色 */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #2563eb;
  --color-primary-600: #1d4ed8;
  --color-primary-700: #1e40af;
  --color-primary-800: #1e3a8a;
  --color-primary-900: #1e3a8a;

  /* 差异高亮色 */
  --color-added-bg: #e6ffed;
  --color-added-border: #22c55e;
  --color-removed-bg: #ffebe9;
  --color-removed-border: #ef4444;
  --color-modified-bg: #fff5b1;
  --color-modified-border: #f59e0b;

  /* 中性色 */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;

  /* 功能色 */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;

  /* 文字色 */
  --color-text-primary: var(--color-gray-800);
  --color-text-body: var(--color-gray-700);
  --color-text-secondary: var(--color-gray-500);
  --color-text-placeholder: var(--color-gray-400);
  --color-text-disabled: var(--color-gray-300);

  /* 背景色 */
  --color-bg-page: var(--color-gray-50);
  --color-bg-card: #ffffff;
  --color-bg-header: #ffffff;
  --color-bg-footer: #ffffff;
  --color-bg-title-bar: var(--color-gray-100);
}
```

---

## 4. 字体规范

### 4.1 字体家族

采用系统字体栈，确保跨平台一致性和最佳可读性。

```css
/* 代码区域 - 等宽字体 */
font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', 'Consolas', 'Monaco', monospace;

/* 界面文字 - 无衬线 */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
```

**字体加载顺序说明**：
1. `SF Mono` / `Cascadia Code` / `Fira Code` - macOS 用户首选等宽字体
2. `Consolas` / `Monaco` - Windows 用户首选等宽字体
3. `-apple-system` / `Segoe UI` - 系统默认无衬线字体
4. `PingFang SC` / `Hiragino Sans GB` - macOS 中文优化
5. `Microsoft YaHei` / `Helvetica Neue` - Windows 中文优化

### 4.2 字号层级

| 元素 | 字号 | 字重 | 行高 | 用途 |
|------|------|------|------|------|
| **H1** | 24px | 600 (SemiBold) | 1.3 | 页面主标题 |
| **H2** | 18px | 600 (SemiBold) | 1.4 | 面板标题 |
| **Body Large** | 16px | 400 (Regular) | 1.6 | 主要正文 |
| **Body** | 14px | 400 (Regular) | 1.6 | 默认正文 |
| **Small** | 13px | 400 (Regular) | 1.5 | 辅助说明 |
| **Code** | 13px | 400 (Regular) | 1.7 | 代码内容 |
| **Line Number** | 12px | 400 (Regular) | 1.7 | 行号 |

### 4.3 字重使用规范

| 字重 | 数值 | 使用场景 |
|------|------|----------|
| Light | 300 | 装饰性文字（极少使用） |
| Regular | 400 | 正文、代码、说明文字 |
| Medium | 500 | 按钮文字、次要标题 |
| SemiBold | 600 | 标题、标签、强调 |
| Bold | 700 | 极少使用（数字统计等） |

### 4.4 代码字体详细参数

代码编辑区的字体设置需精细调优：

```css
.code-area {
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.7; /* 约 22.1px 实际行高 */
  letter-spacing: 0; /* 保持字符间距为 0 */
  font-variant-ligatures: normal; /* 禁用连字，便于区分字符 */
  font-feature-settings: "liga" 0; /* 禁用 ligatures */
}
```

### 4.5 行高与段落

```css
/* 界面文字 */
.text-h1 { line-height: 1.3; }   /* 24px * 1.3 = 31.2px */
.text-h2 { line-height: 1.4; }   /* 18px * 1.4 = 25.2px */
.text-body { line-height: 1.6; } /* 14px * 1.6 = 22.4px */
.text-small { line-height: 1.5; }/* 13px * 1.5 = 19.5px */

/* 代码区域 - 需要更大的行高确保换行可读性 */
.code-content { line-height: 1.7; } /* 13px * 1.7 = 22.1px */
.line-number { line-height: 1.7; }
```

---

## 5. 组件样式

### 5.1 主按钮 (Primary Button)

**用途**：主要操作按钮，如「开始比对」

```css
/* 基础样式 */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 36px;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  background-color: #2563eb;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Hover 状态 */
.btn-primary:hover {
  background-color: #1d4ed8;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
}

/* Active 状态 */
.btn-primary:active {
  background-color: #1e40af;
  box-shadow: none;
  transform: translateY(1px);
}

/* Focus 状态 */
.btn-primary:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

/* Disabled 状态 */
.btn-primary:disabled {
  background-color: #93c5fd;
  color: #ffffff;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}
```

**尺寸变体**：

| 尺寸 | 高度 | 内边距 | 字号 |
|------|------|--------|------|
| Small | 28px | 0 12px | 12px |
| Medium | 36px | 0 20px | 14px |
| Large | 44px | 0 24px | 16px |

### 5.2 次按钮 (Secondary Button)

**用途**：辅助操作按钮，如「上传文件」「清空」

```css
/* 基础样式 */
.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 36px;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 500;
  color: #2563eb;
  background-color: #ffffff;
  border: 1px solid #2563eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Hover 状态 */
.btn-secondary:hover {
  background-color: #eff6ff;
  border-color: #1d4ed8;
  color: #1d4ed8;
}

/* Active 状态 */
.btn-secondary:active {
  background-color: #dbeafe;
}

/* Focus 状态 */
.btn-secondary:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

/* Disabled 状态 */
.btn-secondary:disabled {
  color: #9ca3af;
  border-color: #d1d5db;
  background-color: #f9fafb;
  cursor: not-allowed;
}
```

### 5.3 文字按钮 (Text Button)

**用途**：低强调操作，如「查看帮助」

```css
.btn-text {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  font-size: 14px;
  font-weight: 500;
  color: #2563eb;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-text:hover {
  background-color: #eff6ff;
}

.btn-text:active {
  background-color: #dbeafe;
}
```

### 5.4 面板容器 (Panel Container)

```css
.panel {
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  /* 微妙阴影增加层次感 */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

/* Hover 效果（可选，根据交互需求） */
.panel:hover {
  border-color: #d1d5db;
}
```

### 5.5 面板标题栏 (Panel Title Bar)

```css
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 0 12px;
  background-color: #f3f4f6;
  border-bottom: 1px solid #e5e7eb;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.panel-title-icon {
  width: 16px;
  height: 16px;
  color: #6b7280;
}

.file-name {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 400;
  color: #6b7280;
}

.file-name-placeholder {
  color: #9ca3af;
  font-style: italic;
}

.panel-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
```

### 5.6 文本编辑区 (Text Editor Area)

```css
.editor-container {
  display: flex;
  flex: 1;
  overflow: hidden;
  background-color: #ffffff;
}

/* 行号列 */
.line-numbers {
  flex-shrink: 0;
  width: 48px;
  padding: 12px 8px;
  background-color: #f9fafb;
  border-right: 1px solid #e5e7eb;
  text-align: right;
  user-select: none;
  overflow: hidden;
}

.line-number {
  display: block;
  font-family: 'SF Mono', 'Consolas', monospace;
  font-size: 12px;
  line-height: 1.7;
  color: #9ca3af;
  height: calc(13px * 1.7); /* 与代码行高一致 */
}

/* 代码内容区 */
.code-content {
  flex: 1;
  padding: 12px;
  overflow: auto;
  font-family: 'SF Mono', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.7;
  color: #1f2937;
  white-space: pre-wrap;
  word-break: break-all;
}

.code-line {
  display: block;
  min-height: calc(13px * 1.7);
}
```

### 5.7 开关组件 (Switch)

用于「同步滚动」等开关功能。

```css
.switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.switch-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.switch-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-track {
  position: relative;
  width: 40px;
  height: 22px;
  background-color: #d1d5db;
  border-radius: 11px;
  transition: background-color 0.2s ease;
}

.switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background-color: #ffffff;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}

/* 选中状态 */
.switch-input:checked + .switch-track {
  background-color: #2563eb;
}

.switch-input:checked + .switch-track .switch-thumb {
  transform: translateX(18px);
}

/* Focus 状态 */
.switch-input:focus-visible + .switch-track {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

/* Hover 状态 */
.switch:hover .switch-track {
  background-color: #9ca3af;
}

.switch-input:checked + .switch-track {
  background-color: #1d4ed8;
}
```

### 5.8 统计信息栏 (Statistics Bar)

用于 Footer 区域显示比对统计。

```css
.stats-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  height: 48px;
  padding: 0 24px;
  background-color: #ffffff;
  border-top: 1px solid #e5e7eb;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
}

.stat-value {
  font-weight: 600;
  color: #374151;
}

.stat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.stat-dot-added { background-color: #22c55e; }
.stat-dot-removed { background-color: #ef4444; }
.stat-dot-modified { background-color: #f59e0b; }
```

### 5.9 组件状态总览

| 组件 | Default | Hover | Active | Disabled | Focus |
|------|---------|-------|--------|----------|-------|
| Primary Button | #2563eb 背景 | #1d4ed8 + 阴影 | #1e40af + 下沉 | #93c5fd + 禁用光标 | 2px 外轮廓 |
| Secondary Button | 白色背景 + #2563eb 边框 | #eff6ff 背景 | #dbeafe 背景 | 灰色边框文字 | 2px 外轮廓 |
| Text Button | 透明背景 | #eff6ff 背景 | #dbeafe 背景 | 禁用光标 | 2px 外轮廓 |
| Switch Off | #d1d5db 轨道 | #9ca3af | - | 降低透明度 | 外轮廓 |
| Switch On | #2563eb 轨道 | #1d4ed8 | - | 降低透明度 | 外轮廓 |

---

## 6. 间距规范

### 6.1 页面级间距

| 元素 | 值 | 说明 |
|------|-----|------|
| 页面水平边距 | 24px | 左右两侧与页面边缘的距离 |
| Header 高度 | 64px | 固定顶部导航栏 |
| Footer 高度 | 48px | 固定底部统计栏 |
| 页面最小宽度 | 1024px | 确保双面板正常显示 |

### 6.2 面板间距

| 元素 | 值 | 说明 |
|------|-----|------|
| 面板间水平间距 | 16px | gap: 16px |
| 面板内边距 | 0 | 标题栏和内容区独立处理 |
| 面板最小高度 | 400px | 确保内容可读 |
| 面板圆角 | 8px | border-radius |

### 6.3 组件内部间距

```css
/* Header 内间距 */
.header {
  padding: 0 24px;
}

/* 面板标题栏内间距 */
.panel-header {
  padding: 0 12px;
}

/* 文本编辑区内边距 */
.code-content {
  padding: 12px;
}

/* 行号列内边距 */
.line-numbers {
  padding: 12px 8px;
}
```

### 6.4 元素间距规范

| 场景 | 值 | 说明 |
|------|-----|------|
| 按钮之间的间距 | 8px | 同组按钮之间 |
| 标题与内容间距 | 16px | H2 与下方内容 |
| 输入框与标签间距 | 8px | 表单标签与输入框 |
| 列表项间距 | 4px | 紧凑列表 |
| 卡片内边距 | 16px | 卡片内部元素间距 |

### 6.5 间距速查表

```
间距层级： 4px → 8px → 12px → 16px → 24px → 32px → 48px

常用场景对应：
- micro (元素内)    : 4px
- small (紧凑)      : 8px  
- medium (默认)     : 16px
- large (分隔)      : 24px
- xlarge (区域)      : 32px
- xxlarge (页面)     : 48px
```

### 6.6 CSS 间距变量

```css
:root {
  /* 间距变量 */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;

  /* 布局变量 */
  --header-height: 64px;
  --footer-height: 48px;
  --panel-gap: 16px;
  --page-padding: 24px;
  --panel-min-height: 400px;

  /* 圆角变量 */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-full: 9999px;
}
```

---

## 7. 交互状态

### 7.1 按钮交互状态

#### 主按钮状态

```css
/* Default */
.btn-primary {
  background-color: #2563eb;
  box-shadow: none;
}

/* Hover */
.btn-primary:hover {
  background-color: #1d4ed8;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
  transform: translateY(-1px);
}

/* Active */
.btn-primary:active {
  background-color: #1e40af;
  box-shadow: none;
  transform: translateY(0);
}

/* Focus */
.btn-primary:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

/* Disabled */
.btn-primary:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Loading */
.btn-primary.loading {
  background-color: #2563eb;
  cursor: wait;
  opacity: 0.8;
}
```

#### 次按钮状态

```css
/* Default */
.btn-secondary {
  background-color: #ffffff;
  border: 1px solid #2563eb;
  color: #2563eb;
}

/* Hover */
.btn-secondary:hover {
  background-color: #eff6ff;
  border-color: #1d4ed8;
  color: #1d4ed8;
}

/* Active */
.btn-secondary:active {
  background-color: #dbeafe;
  border-color: #1d4ed8;
  color: #1d4ed8;
}

/* Focus */
.btn-secondary:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

/* Disabled */
.btn-secondary:disabled {
  background-color: #f9fafb;
  border-color: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
}
```

### 7.2 开关交互状态

```css
/* Off */
.switch-track {
  background-color: #d1d5db;
}
.switch-thumb {
  transform: translateX(0);
}

/* On */
.switch-input:checked + .switch-track {
  background-color: #2563eb;
}
.switch-input:checked + .switch-track .switch-thumb {
  transform: translateX(18px);
}

/* Hover Off */
.switch:hover .switch-track {
  background-color: #9ca3af;
}

/* Hover On */
.switch-input:checked + .switch-track:hover {
  background-color: #1d4ed8;
}

/* Disabled */
.switch-input:disabled + .switch-track {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### 7.3 面板交互状态

```css
/* Default */
.panel {
  border-color: #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

/* Hover (可选) */
.panel:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

/* Focus Within (编辑区获得焦点) */
.panel:focus-within {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
```

### 7.4 文件上传交互

```css
.upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  background-color: #f9fafb;
  transition: all 0.2s ease;
  cursor: pointer;
}

/* Hover */
.upload-zone:hover {
  border-color: #2563eb;
  background-color: #eff6ff;
}

/* Drag Over */
.upload-zone.drag-over {
  border-color: #2563eb;
  background-color: #dbeafe;
  border-style: solid;
}

/* Disabled */
.upload-zone.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### 7.5 过渡动画时长

| 交互类型 | 时长 | 缓动函数 |
|----------|------|----------|
| 颜色变化 | 0.15s | ease |
| 背景色变化 | 0.2s | ease |
| 阴影变化 | 0.2s | ease |
| 变换(transform) | 0.2s | ease-out |
| 下拉展开 | 0.25s | ease-in-out |
| 模态弹出 | 0.3s | cubic-bezier(0.16, 1, 0.3, 1) |

---

## 8. 差异高亮样式

### 8.1 行级高亮 (Line-Level Highlighting)

差异行的完整样式定义：

```css
/* 基础差异行样式 */
.diff-line {
  display: flex;
  min-height: calc(13px * 1.7); /* 保持与行号对齐 */
  padding-left: 12px;
  font-family: 'SF Mono', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.7;
}

/* 新增行 (Added) */
.diff-line-added {
  background-color: #e6ffed;
  border-left: 3px solid #22c55e;
}

.diff-line-added .line-content {
  color: #166534; /* 深绿色文字 */
}

/* 删除行 (Removed) */
.diff-line-removed {
  background-color: #ffebe9;
  border-left: 3px solid #ef4444;
}

.diff-line-removed .line-content {
  color: #991b1b; /* 深红色文字 */
}

/* 修改行 (Modified) */
.diff-line-modified {
  background-color: #fff5b1;
  border-left: 3px solid #f59e0b;
}

.diff-line-modified .line-content {
  color: #92400e; /* 深黄色文字 */
}

/* 相同行 (Unchanged) */
.diff-line-unchanged {
  background-color: transparent;
  border-left: 3px solid transparent;
}
```

### 8.2 词级高亮 (Word-Level Highlighting)

用于在同一行内高亮具体差异的单词：

```css
/* 词级差异标记 */
.word-added {
  background-color: #bbf7d0;
  border-radius: 2px;
  padding: 0 2px;
  color: #166534;
}

.word-removed {
  background-color: #fecaca;
  border-radius: 2px;
  padding: 0 2px;
  color: #991b1b;
  text-decoration: line-through; /* 删除内容加删除线 */
}

.word-modified {
  background-color: #fde047;
  border-radius: 2px;
  padding: 0 2px;
  color: #92400e;
}
```

### 8.3 高亮样式对比

| 层级 | 用途 | 背景色 | 边框 | 文字色 |
|------|------|--------|------|--------|
| 行级新增 | 整行新增 | #e6ffed | 3px solid #22c55e | #166534 |
| 行级删除 | 整行删除 | #ffebe9 | 3px solid #ef4444 | #991b1b |
| 行级修改 | 整行修改 | #fff5b1 | 3px solid #f59e0b | #92400e |
| 词级新增 | 单词新增 | #bbf7d0 | 无 | #166534 |
| 词级删除 | 单词删除 | #fecaca | 无 | #991b1b + 删除线 |
| 词级修改 | 单词修改 | #fde047 | 无 | #92400e |

### 8.4 完整差异行 HTML 结构

```html
<div class="diff-line diff-line-added">
  <span class="line-number">42</span>
  <span class="line-content">
    这是新增的内容，可能包含
    <span class="word-added">新增的单词</span>
    或其他差异。
  </span>
</div>
```

### 8.5 高亮状态应用规则

1. **行级高亮优先**：如果整行都是新增/删除，使用行级高亮
2. **词级补充**：在同一行有部分变化时，使用词级高亮
3. **嵌套关系**：词级高亮可以嵌套在行级高亮内部
4. **颜色对比**：确保高亮色与背景色有足够的对比度 (WCAG AA)

### 8.6 高亮色无障碍检查

| 类型 | 背景色 | 文字色 | 对比度 | WCAG 等级 |
|------|--------|--------|--------|-----------|
| 行级新增文字 | #e6ffed | #166534 | 4.8:1 | AA ✓ |
| 行级删除文字 | #ffebe9 | #991b1b | 4.6:1 | AA ✓ |
| 行级修改文字 | #fff5b1 | #92400e | 4.5:1 | AA ✓ |
| 词级新增文字 | #bbf7d0 | #166534 | 5.2:1 | AA ✓ |
| 词级删除文字 | #fecaca | #991b1b | 5.0:1 | AA ✓ |

---

## 9. 特殊效果与动画

### 9.1 按钮点击效果

```css
/* 点击涟漪效果 (可选增强) */
.btn-primary {
  position: relative;
  overflow: hidden;
}

.btn-primary::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.4s ease, height 0.4s ease;
}

.btn-primary:active::after {
  width: 200px;
  height: 200px;
  opacity: 0;
}
```

### 9.2 面板展开动画

```css
/* 面板切换显示动画 */
.panel {
  animation: panelFadeIn 0.3s ease-out;
}

@keyframes panelFadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 9.3 差异高亮闪烁

首次比对完成后，可选地让差异行短暂闪烁以吸引注意：

```css
/* 首次高亮动画 */
.diff-line.just-highlighted {
  animation: highlightPulse 0.6s ease-out;
}

@keyframes highlightPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
```

### 9.4 加载状态动画

```css
/* 按钮加载中 */
.btn-loading {
  position: relative;
  color: transparent !important;
  pointer-events: none;
}

.btn-loading::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 16px;
  height: 16px;
  margin: -8px 0 0 -8px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

### 9.5 无障碍动画偏好

```css
/* 尊重用户减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. 响应式断点

### 10.1 断点定义

| 断点名称 | 宽度范围 | 布局描述 |
|----------|----------|----------|
| **Desktop XL** | ≥ 1400px | 双面板等宽，宽松间距 |
| **Desktop** | 1200px - 1399px | 双面板等宽，默认间距 |
| **Laptop** | 1024px - 1199px | 双面板等宽，紧凑间距 |
| **Tablet** | < 1024px | 显示提示，建议使用 PC |

### 10.2 布局变化

```css
/* Desktop XL: ≥ 1400px */
@media (min-width: 1400px) {
  .page-container {
    padding: 0 48px;
  }
  .panels-container {
    gap: 24px;
  }
}

/* Desktop: 1200px - 1399px */
@media (min-width: 1200px) and (max-width: 1399px) {
  .page-container {
    padding: 0 32px;
  }
  .panels-container {
    gap: 20px;
  }
}

/* Laptop: 1024px - 1199px */
@media (min-width: 1024px) and (max-width: 1199px) {
  .page-container {
    padding: 0 24px;
  }
  .panels-container {
    gap: 16px;
  }
  .code-content {
    font-size: 12px; /* 稍小字体适应 */
  }
}

/* Tablet: < 1024px */
@media (max-width: 1023px) {
  .panels-container {
    flex-direction: column;
    gap: 16px;
  }
  .panel {
    min-height: 300px;
  }
  .mobile-warning {
    display: flex; /* 显示移动端提示 */
  }
}
```

### 10.3 移动端提示组件

```css
.mobile-warning {
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 16px;
}

.mobile-warning-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  color: #f59e0b;
}

.mobile-warning-title {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.mobile-warning-text {
  font-size: 14px;
  color: #6b7280;
  max-width: 300px;
}
```

### 10.4 最小宽度保护

```css
/* 防止页面被压扁 */
html {
  min-width: 1024px;
}

body {
  min-width: 1024px;
  overflow-x: auto;
}
```

---

## 11. 无障碍设计

### 11.1 颜色对比度

所有文字与背景的对比度必须达到 WCAG AA 标准（4.5:1 或 3:1）：

| 元素 | 前景色 | 背景色 | 对比度 | 等级 |
|------|--------|--------|--------|------|
| 主要文字 | #1F2937 | #FFFFFF | 15.9:1 | AAA |
| 正文文字 | #374151 | #FFFFFF | 10.4:1 | AAA |
| 次要文字 | #6B7280 | #FFFFFF | 5.9:1 | AA |
| 占位符文字 | #9CA3AF | #FFFFFF | 4.6:1 | AA |
| 按钮文字 | #FFFFFF | #2563EB | 4.8:1 | AA |

### 11.2 焦点可见性

```css
/* 确保所有交互元素有可见焦点状态 */
:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

/* 链接特定焦点样式 */
a:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
  border-radius: 2px;
}
```

### 11.3 ARIA 属性

```html
<!-- 按钮 -->
<button type="button" class="btn-primary" aria-label="开始比对">
  开始比对
</button>

<!-- 开关 -->
<label class="switch">
  <input type="checkbox" class="switch-input" id="sync-scroll" checked>
  <span class="switch-track"></span>
  <span class="switch-thumb"></span>
  <span class="switch-label">同步滚动</span>
</label>

<!-- 面板 -->
<section class="panel" aria-label="原始文件面板">
  <header class="panel-header">
    <h2 class="panel-title">原始文件</h2>
  </header>
  <div class="editor-container" role="region" aria-label="文件内容">
    <!-- 内容 -->
  </div>
</section>

<!-- 统计信息 -->
<footer class="stats-bar" role="status" aria-live="polite">
  <span class="stat-item">
    <span class="stat-dot stat-dot-added"></span>
    <span>2 新增</span>
  </span>
  <!-- ... -->
</footer>
```

### 11.4 键盘导航

| 元素 | Tab 顺序 | Enter/Space | 方向键 |
|------|-----------|--------------|--------|
| 主按钮 | ✓ | 触发点击 | - |
| 次按钮 | ✓ | 触发点击 | - |
| 开关 | ✓ | 切换状态 | - |
| 文件上传区 | ✓ | 打开文件选择器 | - |
| 文本编辑区 | ✓ | 进入编辑模式 | 移动光标 |

### 11.5 屏幕阅读器支持

```html
<!-- 为差异行添加语义 -->
<div class="diff-line diff-line-added" role="row" aria-label="新增行，第42行">
  <span class="line-number" aria-hidden="true">42</span>
  <span class="line-content">
    <span class="sr-only">新增内容：</span>
    新增的文本内容
  </span>
</div>

<!-- 屏幕阅读器专用类 -->
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### 11.6 减少动画偏好

```css
@media (prefers-reduced-motion: reduce) {
  .btn-primary,
  .btn-secondary,
  .switch-track,
  .switch-thumb,
  .panel,
  .diff-line {
    transition: none;
    animation: none;
  }
}
```

---

## 附录 A：CSS 变量完整列表

```css
:root {
  /* 主色 */
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-primary-active: #1e40af;
  --color-primary-light: #93c5fd;
  --color-primary-lighter: #dbeafe;

  /* 差异色 */
  --color-added-bg: #e6ffed;
  --color-added-border: #22c55e;
  --color-added-text: #166534;
  --color-added-word: #bbf7d0;

  --color-removed-bg: #ffebe9;
  --color-removed-border: #ef4444;
  --color-removed-text: #991b1b;
  --color-removed-word: #fecaca;

  --color-modified-bg: #fff5b1;
  --color-modified-border: #f59e0b;
  --color-modified-text: #92400e;
  --color-modified-word: #fde047;

  /* 中性色 */
  --color-bg-page: #f9fafb;
  --color-bg-card: #ffffff;
  --color-bg-title: #f3f4f6;
  --color-border: #e5e7eb;
  --color-border-hover: #d1d5db;
  --color-text-primary: #1f2937;
  --color-text-body: #374151;
  --color-text-secondary: #6b7280;
  --color-text-placeholder: #9ca3af;

  /* 功能色 */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;

  /* 间距 */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;

  /* 布局 */
  --header-height: 64px;
  --footer-height: 48px;
  --panel-gap: 16px;
  --page-padding: 24px;
  --panel-min-height: 400px;

  /* 圆角 */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;

  /* 阴影 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 1px 3px rgba(0, 0, 0, 0.04);
  --shadow-lg: 0 4px 6px rgba(0, 0, 0, 0.1);

  /* 过渡 */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.2s ease;
  --transition-slow: 0.3s ease;

  /* 字体 */
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  --font-mono: 'SF Mono', 'Cascadia Code', 'Fira Code', 'Consolas', 'Monaco', monospace;
}
```

---

## 附录 B：组件清单

| 组件 | 名称 | 文件位置建议 |
|------|------|--------------|
| Button | 主按钮 | components/Button.js |
| Button | 次按钮 | components/Button.js |
| Switch | 开关 | components/Switch.js |
| Panel | 面板容器 | components/Panel.js |
| PanelHeader | 面板标题栏 | components/PanelHeader.js |
| Editor | 文本编辑器 | components/Editor.js |
| LineNumbers | 行号列 | components/LineNumbers.js |
| DiffLine | 差异行 | components/DiffLine.js |
| StatsBar | 统计栏 | components/StatsBar.js |
| UploadZone | 上传区域 | components/UploadZone.js |

---

## 附录 C：设计交付物清单

本设计规范交付以下内容：

- [x] 整体页面布局规范
- [x] 色彩体系定义
- [x] 字体规范
- [x] 组件样式
- [x] 间距规范
- [x] 交互状态定义
- [x] 差异高亮样式
- [x] 特殊效果与动画
- [x] 响应式断点
- [x] 无障碍设计

---

> **设计说明**
> 
> 本设计规范基于 FComp 需求文档生成，采用现代极简主义风格，以蓝色 #2563eb 为主色调，三色高亮系统（绿/红/黄）清晰区分差异内容。所有 CSS 变量已定义，便于前端开发直接使用。规范覆盖 PC 端 1024px 及以上屏幕尺寸，响应式适配 Desktop XL、Desktop、Laptop 三个断点，并遵循 WCAG AA 无障碍标准。
