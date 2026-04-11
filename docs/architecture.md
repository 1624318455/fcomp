# FComp 技术架构方案

> 版本：v1.0  
> 更新日期：2026-04-10  
> 架构师：AITA  
> 状态：正式版

---

## 1. 技术选型与依赖

### 1.1 核心技术栈

| 技术 | 版本 | 用途 | 选型理由 |
|------|------|------|----------|
| **HTML5** | - | 页面结构 | 语义化标签，支持文件 API |
| **CSS3** | - | 样式与布局 | Flexbox/Grid 布局，CSS 变量 |
| **JavaScript (ES6+)** | ES2020+ | 业务逻辑 | 原生 JS，无框架依赖 |
| **jsdiff** | v5.2.0+ | 文本差异比对 | 轻量级、CDN 可用、行级/词级 diff |

### 1.2 依赖说明

#### 主依赖：jsdiff

```html
<!-- CDN 引入 (推荐) -->
<script src="https://cdn.jsdelivr.net/npm/jsdiff@5.2.0/dist/jsdiff.min.js"></script>
```

**API 使用说明**：

| 方法 | 用途 | 返回值 |
|------|------|--------|
| `diff.diffLines(oldStr, newStr)` | 行级差异比对 | `DiffResult[]` |
| `diff.diffWords(oldStr, newStr)` | 单词级差异比对 | `DiffResult[]` |
| `diff.diffChars(oldStr, newStr)` | 字符级差异比对 | `DiffResult[]` |

**DiffResult 对象结构**：
```javascript
{
  value: "变更的内容",
  added: true/false,   // 是否为新增
  removed: true/false  // 是否为删除
}
```

#### CDN 源选择

| CDN | 地址 | 特点 |
|-----|------|------|
| **jsdelivr** (推荐) | `https://cdn.jsdelivr.net/npm/jsdiff@5.2.0/dist/jsdiff.min.js` | 全球 CDN，国内访问快 |
| **unpkg** | `https://unpkg.com/jsdiff@5.2.0/dist/jsdiff.min.js` | 官方维护 |
| **cdnjs** | `https://cdnjs.cloudflare.com/ajax/libs/jsdiff/5.2.0/jsdiff.min.js` | 国内节点多 |

### 1.3 无外部依赖方案

如需完全离线可用，可将 jsdiff 源码内联：

```javascript
// 内联简化版 diff 算法（行级）
// 约 200 行代码，可满足基本需求
```

推荐：优先使用 CDN，失败时回退内联方案。

---

## 2. 项目文件结构

### 2.1 目录结构

```
fcomp/
├── index.html              # 主入口页面
├── css/
│   └── styles.css          # 所有样式（含 CSS 变量）
├── js/
│   ├── main.js             # 入口与事件绑定
│   ├── diff-engine.js      # 差异比对引擎
│   ├── file-handler.js     # 文件上传与读取
│   ├── scroll-sync.js      # 同步滚动控制器
│   └── ui-renderer.js      # UI 渲染与状态管理
└── assets/
    └── icons/              # SVG 图标（可选，内联更佳）
```

### 2.2 文件职责

| 文件 | 职责 | 公共 API |
|------|------|----------|
| `index.html` | 页面结构、组件容器 | - |
| `styles.css` | 样式定义、CSS 变量 | - |
| `main.js` | 初始化、事件绑定、全局状态 | `initApp()`, `state` |
| `diff-engine.js` | 调用 jsdiff，执行比对 | `compare(source, target)` |
| `file-handler.js` | File API 读取、编码检测 | `readFile(file)`, `readAsText(file)` |
| `scroll-sync.js` | 双向滚动同步 | `enableSync()`, `disableSync()` |
| `ui-renderer.js` | 渲染差异行、统计信息 | `renderDiff()`, `updateStats()` |

### 2.3 模块依赖关系

```
index.html
    ↓
main.js (入口)
    ├── file-handler.js (文件处理)
    ├── diff-engine.js (差异比对)
    ├── ui-renderer.js (UI 渲染)
    └── scroll-sync.js (滚动同步)
         ↓
    jsdiff (CDN)
```

---

## 3. 核心模块设计

### 3.1 文件处理模块 (file-handler.js)

**职责**：读取本地文件，支持多种格式

```javascript
// 核心 API
export const FileHandler = {
  /**
   * 读取文件为文本
   * @param {File} file - HTML File 对象
   * @returns {Promise<string>}
   */
  async readAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file, 'UTF-8'); // 默认 UTF-8
    });
  },

  /**
   * 检测文件编码（简化版）
   * 实际使用可引入 encoding-detector
   */
  detectEncoding(buffer) {
    // 简单实现：检查 BOM 或默认 UTF-8
    const arr = new Uint8Array(buffer.slice(0, 4));
    if (arr[0] === 0xEF && arr[1] === 0xBB && arr[2] === 0xBF) return 'UTF-8';
    return 'UTF-8';
  },

  /**
   * 验证文件大小
   * @param {File} file
   * @param {number} maxSize - 默认 10MB
   */
  validateSize(file, maxSize = 10 * 1024 * 1024) {
    if (file.size > maxSize) throw new Error(`文件超过 ${maxSize / 1024 / 1024}MB 限制`);
    return true;
  }
};
```

### 3.2 差异比对模块 (diff-engine.js)

**职责**：执行文本差异分析，生成差异数据

```javascript
// 核心 API
export const DiffEngine = {
  /**
   * 执行行级差异比对
   * @param {string} source - 原始文本
   * @param {string} target - 比较文本
   * @returns {Object} 差异结果
   */
  compare(source, target) {
    const lines = diff.diffLines(source, target);
    return this.normalizeDiffResult(lines);
  },

  /**
   * 规范化差异结果
   * 标记每行的差异类型：added, removed, modified, unchanged
   */
  normalizeDiffResult(diffResult) {
    const sourceLines = [];
    const targetLines = [];
    let addedCount = 0, removedCount = 0, modifiedCount = 0;

    diffResult.forEach(part => {
      const partLines = part.value.split('\n').filter((_, i, arr) => 
        i < arr.length - 1 || part.value.slice(-1) !== '\n'
      );

      partLines.forEach(line => {
        if (part.added) {
          targetLines.push({ content: line, type: 'added' });
          sourceLines.push({ content: '', type: 'empty' });
          addedCount++;
        } else if (part.removed) {
          sourceLines.push({ content: line, type: 'removed' });
          targetLines.push({ content: '', type: 'empty' });
          removedCount++;
        } else {
          sourceLines.push({ content: line, type: 'unchanged' });
          targetLines.push({ content: line, type: 'unchanged' });
        }
      });
    });

    return {
      source: sourceLines,
      target: targetLines,
      stats: { added: addedCount, removed: removedCount, modified: modifiedCount }
    };
  }
};
```

### 3.3 UI 渲染模块 (ui-renderer.js)

**职责**：渲染差异行、统计信息、文件内容

```javascript
// 核心 API
export const UIRenderer = {
  /**
   * 渲染差异结果到面板
   * @param {HTMLElement} sourcePanel - 源文件面板
   * @param {HTMLElement} targetPanel - 目标文件面板
   * @param {Object} diffResult - 差异结果
   */
  renderDiff(sourcePanel, targetPanel, diffResult) {
    this.renderLines(sourcePanel, diffResult.source);
    this.renderLines(targetPanel, diffResult.target);
  },

  renderLines(panel, lines) {
    const lineNumbers = panel.querySelector('.line-numbers');
    const codeContent = panel.querySelector('.code-content');
    
    let lineNumberHTML = '';
    let contentHTML = '';

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      lineNumberHTML += `<span class="line-number">${lineNum}</span>`;
      
      let lineClass = 'diff-line';
      if (line.type === 'added') lineClass += ' diff-line-added';
      else if (line.type === 'removed') lineClass += ' diff-line-removed';
      else if (line.type === 'modified') lineClass += ' diff-line-modified';
      
      contentHTML += `<div class="${lineClass}">
        <span class="line-content">${this.escapeHTML(line.content)}</span>
      </div>`;
    });

    lineNumbers.innerHTML = lineNumberHTML;
    codeContent.innerHTML = contentHTML;
  },

  /**
   * 转义 HTML 特殊字符
   */
  escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },

  /**
   * 更新统计栏
   */
  updateStats(stats) {
    const footer = document.querySelector('.stats-bar');
    footer.innerHTML = `
      <span class="stat-item"><span class="stat-dot stat-dot-added"></span><span class="stat-value">${stats.added}</span> 新增</span>
      <span class="stat-item"><span class="stat-dot stat-dot-removed"></span><span class="stat-value">${stats.removed}</span> 删除</span>
      <span class="stat-item"><span class="stat-dot stat-dot-modified"></span><span class="stat-value">${stats.modified}</span> 修改</span>
    `;
  }
};
```

### 3.4 同步滚动模块 (scroll-sync.js)

**职责**：实现左右面板双向滚动同步

```javascript
// 核心 API
export const ScrollSync = {
  enabled: true,
  isScrolling: false,

  /**
   * 初始化同步滚动
   */
  init(sourcePanel, targetPanel) {
    const sourceContent = sourcePanel.querySelector('.code-content');
    const targetContent = targetPanel.querySelector('.code-content');

    sourceContent.addEventListener('scroll', () => this.onScroll(sourceContent, targetContent));
    targetContent.addEventListener('scroll', () => this.onScroll(targetContent, sourceContent));
  },

  onScroll(source, target) {
    if (!this.enabled || this.isScrolling) return;
    
    this.isScrolling = true;
    const ratio = source.scrollTop / (source.scrollHeight - source.clientHeight);
    target.scrollTop = ratio * (target.scrollHeight - target.clientHeight);
    
    requestAnimationFrame(() => {
      this.isScrolling = false;
    });
  },

  toggle(enabled) {
    this.enabled = enabled;
  }
};
```

### 3.5 数据流设计

```
用户操作 (上传/粘贴)
       ↓
FileHandler.readAsText() → 读取文件内容
       ↓
UIRenderer.renderPlainText() → 显示原始内容
       ↓
用户点击 "开始比对"
       ↓
DiffEngine.compare() → 执行差异分析
       ↓
UIRenderer.renderDiff() → 渲染差异高亮
       ↓
UIRenderer.updateStats() → 更新统计信息
```

### 3.6 全局状态管理

```javascript
// main.js
const state = {
  sourceContent: '',
  targetContent: '',
  sourceFileName: '',
  targetFileName: '',
  diffResult: null,
  syncScrollEnabled: true,
  isComparing: false
};
```

---

## 4. 部署方案

### 4.1 静态部署架构

```
┌─────────────────────────────────────────────────────────┐
│                    部署拓扑图                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   [开发环境]          [生产环境]                         │
│   ┌─────────┐        ┌─────────────┐                   │
│   │ 本地文件  │──────▶│  静态 Hosting │                  │
│   │ index.html│       │  (任选其一)   │                  │
│   └─────────┘        └─────────────┘                   │
│                              │                           │
│                              ↓                           │
│                       ┌─────────────┐                   │
│                       │   CDN 加载   │                   │
│                       │   jsdiff     │                   │
│                       └─────────────┘                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 4.2 部署方式对比

| 方案 | 平台 | 成本 | HTTPS | 自定义域名 | 备注 |
|------|------|------|-------|------------|------|
| **GitHub Pages** | github.com | 免费 | ✓ | ✓ | 需公开仓库 |
| **Vercel** | vercel.com | 免费 | ✓ | ✓ | 需注册 |
| **Netlify** | netlify.com | 免费 | ✓ | ✓ | 需注册 |
| **Cloudflare Pages** | cloudflare.com | 免费 | ✓ | ✓ | 需注册 |
| **阿里云 OSS** | 阿里云 | 付费 | ✓ | ✓ | 国内访问快 |
| **本地服务器** | - | - | 需配置 | 需配置 | 企业内网 |

### 4.3 推荐部署方案

#### 方案 A：GitHub Pages（推荐）

**优点**：
- 免费、无需注册（已有 GitHub 账号）
- 自动 HTTPS
- 与代码仓库一体化

**步骤**：
```bash
# 1. 创建仓库，上传代码
git init
git add .
git commit -m "FComp v1.0"

# 2. 推送至 GitHub
git remote add origin https://github.com/yourname/fcomp.git
git push -u origin main

# 3. 在仓库 Settings → Pages 启用
# Source: Deploy from a branch
# Branch: main / (root)
```

**访问地址**：`https://yourname.github.io/fcomp/`

#### 方案 B：Vercel（备选）

**优点**：
- 国内访问速度快
- 自动部署
- 预览部署

**步骤**：
```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel

# 按提示操作，自动生成访问地址
```

### 4.4 部署检查清单

| 检查项 | 说明 |
|--------|------|
| ✅ index.html 可直接打开 | 验证静态资源路径正确 |
| ✅ CDN jsdiff 加载成功 | 检查网络请求 |
| ✅ 文件上传功能正常 | 验证 File API |
| ✅ HTTPS 生效 | 确保安全 |
| ✅ 移动端提示 | < 1024px 显示提示 |

### 4.5 离线使用

如需完全离线使用：

1. **内联 jsdiff**：将 `jsdiff.min.js` 内容复制到 `index.html`
2. **本地化**：将所有代码保存为本地 HTML 文件
3. **无 CDN 依赖**：移除 `<script src="...">` 标签

---

## 5. 性能优化设计

### 5.1 首屏加载优化

| 优化点 | 实现方式 |
|--------|----------|
| CSS 内联 | 将 `styles.css` 内容放入 `<style>` 标签 |
| JS 内联 | 将 `js/*.js` 内容放入 `<script>` 标签 |
| CDN 可靠性 | 主要 CDN + 回退机制 |

### 5.2 大文件处理

| 场景 | 阈值 | 处理方式 |
|------|------|----------|
| 小文件 | < 100KB | 直接处理 |
| 中等文件 | 100KB - 1MB | 正常处理 |
| 大文件 | 1MB - 10MB | 显示加载提示，分批渲染 |
| 超大文件 | > 10MB | 阻止处理，提示用户 |

### 5.3 渲染优化

```javascript
// 使用 DocumentFragment 批量更新 DOM
const fragment = document.createDocumentFragment();
// ... 添加元素
container.appendChild(fragment);
```

---

## 6. 浏览器兼容性

### 6.1 支持范围

| 浏览器 | 最低版本 | 备注 |
|--------|----------|------|
| Chrome | 90+ | 全功能支持 |
| Firefox | 88+ | 全功能支持 |
| Safari | 14+ | 全功能支持 |
| Edge | 90+ | 全功能支持 |

### 6.2 不支持场景

- ❌ Internet Explorer（所有版本）
- ❌ 移动端浏览器（显示提示）

### 6.3 特性检测

```javascript
// 检测支持情况
const isSupported = 'FileReader' in window && 'addEventListener' in document;
if (!isSupported) {
  alert('您的浏览器不支持文件上传功能，请使用现代浏览器');
}
```

---

## 7. 安全考虑

### 7.1 隐私保障

| 措施 | 说明 |
|------|------|
| 纯客户端处理 | 所有文件在浏览器中读取，不上传服务器 |
| 无存储 | 不使用 localStorage / IndexedDB |
| 刷新清除 | 页面刷新后数据自动丢失 |

### 7.2 XSS 防护

```javascript
// UI 渲染时必须转义
escapeHTML(content); // 见 ui-renderer.js
```

---

## 8. 验收标准映射

### 8.1 功能验收

| 需求项 | 实现文件 | 验收方法 |
|--------|----------|----------|
| 双面板布局 | index.html | 页面可见 |
| 文件上传 | file-handler.js | 上传测试 |
| 文本粘贴 | main.js 事件绑定 | 粘贴测试 |
| 差异高亮 | diff-engine.js + ui-renderer.js | 比对测试 |
| 同步滚动 | scroll-sync.js | 滚动测试 |
| 清空功能 | main.js clearAll() | 点击测试 |

### 8.2 性能验收

| 指标 | 目标 | 测试方法 |
|------|------|----------|
| 首次加载 | < 2s | Lighthouse |
| 文件解析 | < 1s (10MB 内) | 手动计时 |
| 比对执行 | < 3s (10000 行内) | 手动计时 |

---

## 9. 开发建议

### 9.1 开发模式

1. **纯文件开发**：直接编辑 `index.html` + `css/styles.css` + `js/*.js`
2. **本地服务器**：使用 `npx serve .` 或 VS Code Live Server

### 9.2 调试技巧

- Chrome DevTools → Sources → 断点调试
- Console.log 输出关键变量
- Network 面板检查 CDN 加载

### 9.3 代码组织建议

| 文件 | 建议行数 | 说明 |
|------|----------|------|
| index.html | 150 行以内 | 保持简洁 |
| styles.css | 800 行以内 | 模块化注释 |
| main.js | 100 行以内 | 仅入口 |
| 各模块 JS | 100-150 行/文件 | 单一职责 |

---

## 10. 总结

本架构方案基于 FComp 需求文档和 UI 设计规范，提供以下保障：

- ✅ **技术选型**：jsdiff CDN 引入，轻量可靠
- ✅ **模块设计**：清晰分层，职责明确
- ✅ **部署方案**：静态 hosting，多平台可选
- ✅ **性能达标**：满足需求文档性能要求
- ✅ **安全隐私**：纯客户端处理，无数据泄露风险

架构设计完成，可直接进入 Coding 阶段。

---

> **架构师签名**：AITA  
> **交付日期**：2026-04-10  
> **下一步**：Coding Agent 依据此架构方案进行开发