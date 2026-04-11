# FComp 项目记忆

## 项目概述

FComp 是一个文件比对工具，用于比较两个文件的差异并高亮显示。

## 技术栈

- 纯前端项目（HTML + CSS + JavaScript）
- Diff 算法：jsdiff CDN
- 部署：Vercel

## 今日进度总结 (2026-04-11)

### ✅ 已完成事项

#### 1. 拖放上传功能重构
- **移除输入区**：将两侧区域改为纯拖放上传，移除 contenteditable 输入区
- **解决双重触发**：修复点击上传按钮弹出两次文件选择器的问题
- **修复预览显示**：解决 `style="display:none"` 内联样式优先级高于 CSS 类选择器的问题

#### 2. 上传状态控制
- **禁止重复上传**：有文件后禁止点击触发上传，必须先清空才能再次上传
- **通过 CSS 控制**：`.drop-zone.has-file .file-input-hidden { pointer-events: none }`

#### 3. 内容区交互优化
- **可滚动**：上传文件后内容区可以正常滚动、点击文本
- **pointer-events 控制**：有文件时隐藏的上传层设置 `pointer-events: none`

#### 4. 差异面板功能
- **固定底部**：差异面板 `diff-results-panel` 设置 `position: sticky; bottom: 0`
- **可调整高度**：通过拖动顶部标题栏调整高度，最小 80px，最大 60vh
- **布局优化**：`main-content` 的 `padding-bottom` 改为 40px

#### 5. 跳转与高亮
- **点击跳转**：点击差异详情中的项目，内容区滚动到对应行
- **高亮效果**：滚动到的行显示黄色高亮，持续 1.5 秒
- **行号标记**：每行内容渲染为带 `data-line` 属性的 span

### ⏳ 待完成事项

- [ ] 差异面板高度调整后应记住用户偏好（localStorage）
- [ ] 支持拖拽文件到已上传区域替换文件（当前只能清空后重新上传）
- [ ] 移动端适配优化

---

## 问题与解决方案经验总结

### 1. CSS 优先级问题

**问题**：`style="display:none"` 内联样式优先级高于 CSS 类选择器

**现象**：添加 `.has-file` 类后，`.file-preview` 没有显示

**解决**：
```css
/* 错误：内联样式优先级更高 */
<div class="file-preview" style="display:none;">

/* 正确：移除内联样式，用 CSS 控制 */
.file-preview { display: none; }
.drop-zone.has-file .file-preview { display: block; }
```

### 2. 事件冒泡与阻止

**问题**：点击拖放区域触发文件上传的双重调用

**解决**：使用 `e.stopPropagation()` 阻止事件冒泡，但要注意：
- 隐藏的 `<input type="file">` 仍然会响应点击
- 需要在父元素 `dropZone` 上阻止点击事件

```javascript
dropZone.addEventListener('click', function(e) {
  if (dropZone.classList.contains('has-file')) {
    e.preventDefault();
    e.stopPropagation();
  }
});
```

### 3. pointer-events 控制交互

**问题**：隐藏的上传层遮挡了内容区的滚动和点击

**解决**：有文件时设置上传层为 `pointer-events: none`

```css
.drop-zone.has-file .file-input-hidden {
  pointer-events: none;
  z-index: 1;
}
```

### 4. 文件内容渲染与行号定位

**问题**：需要精确跳转到差异行的具体位置

**解决**：将内容按行渲染为独立的 DOM 元素，带行号属性

```javascript
function renderFileContent(container, content) {
  var lines = content.split('\n');
  container.innerHTML = '';
  lines.forEach(function(line, index) {
    var span = document.createElement('span');
    span.className = 'code-line';
    span.dataset.line = index + 1;
    span.textContent = line;
    container.appendChild(span);
  });
}

function scrollToLine(side, lineNum) {
  var lineEl = contentEl.querySelector('[data-line="' + lineNum + '"]');
  if (lineEl) {
    lineEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    lineEl.classList.add('line-highlight');
  }
}
```

### 5. 可拖拽调整高度的组件

**问题**：用户需要自定义差异面板的显示高度

**解决**：使用 mousedown/mousemove/mouseup 事件监听拖拽

```javascript
function setupDiffPanelResize() {
  var header = diffPanel.querySelector('.diff-results-header');
  header.style.cursor = 'ns-resize';
  
  header.addEventListener('mousedown', function(e) {
    isResizing = true;
    startY = e.clientY;
    startHeight = diffPanel.offsetHeight;
  });
  
  document.addEventListener('mousemove', function(e) {
    if (!isResizing) return;
    var delta = startY - e.clientY;
    var newHeight = Math.min(maxHeight, Math.max(minHeight, startHeight + delta));
    diffPanel.style.height = newHeight + 'px';
  });
}
```

### 6. Playwright 测试中的文件上传处理

**问题**：Playwright 中使用 `fileChooser.setFiles()` 后文件选择器仍保持打开状态

**解决**：需要显式取消或设置空文件来关闭

```javascript
// 取消文件选择器
await fileChooser.setFiles(undefined);
```

### 7. Vercel 部署验证

**问题**：本地构建成功但部署可能失败，导致测试旧版本

**解决**：推送后必须轮询检查 Vercel 部署状态，只在 Ready 时执行测试

```bash
vercel ls  # 查看部署状态
```

---

## 项目约定

### Git 提交规范
- `fix:` - 问题修复
- `feat:` - 新功能
- `refactor:` - 重构
- `style:` - 样式调整

### 部署地址
- 主项目：https://vercel.com/memeflyflys-projects/fcomp
- 自定义域名：https://fcomp.vercel.app

### 文件结构
```
FComp/
├── index.html          # 主页面
├── css/
│   └── styles.css      # 样式文件
├── js/
│   └── main.js         # 主逻辑
├── memory.md            # 项目记忆
└── docs/               # 文档（可选）
```

---

## 常用命令

```bash
# 本地开发
# 无需构建，直接打开 index.html

# Git 提交
git add -A && git commit -m "message" && git push

# 等待 Vercel 部署
sleep 20 && vercel ls

# 浏览器测试
# 使用 Playwright MCP 工具
```

---

*最后更新：2026-04-11*
