# Changelog

## [1.3.0] - 2026-05-21

### feat: Diffchecker 级别产品力升级

- 差异面板工具栏：Split/Unified视图切换、隐藏相同行、自动换行、导出按钮
- Unified视图：单栏内联差异展示，+/-标记和双列行号
- 暗色主题：完整CSS变量覆盖，主题切换持久化
- 导出功能：差异报告导出为 .txt 文件
- 隐藏相同行：Split和Unified视图均支持
- 自动换行：全局 pre/pre-wrap 切换

### 涉及文件

- `css/styles.css` — 暗色主题CSS变量、工具栏样式、Unified视图、wrap模式
- `index.html` — 工具栏DOM结构、主题切换按钮、导出按钮
- `js/main.js` — 视图切换逻辑、主题持久化、导出功能、隐藏相同行、自动换行

## [1.2.0] - 2026-05-21

### feat: 产品力全面提升

- 面板添加编辑器容器结构 (`editor-container` + `line-numbers` + `code-content`)，显示行号 gutter
- 差异结果直接在面板内渲染，修改/新增/删除行带颜色高亮
- 行号 gutter 对差异行做颜色标记（added=绿, removed=红, modified=橙）
- 词级内联差异高亮，精确标出修改行内变化的词
- 同步滚动真正生效，通过 ScrollSync.init() 接入模块
- 文件大小校验（10MB）和类型提示
- 清空操作增加确认弹窗防误操作
- 支持文本粘贴输入
- 底部差异面板增加拖拽手柄视觉指示

### 涉及文件

- `css/styles.css` — 新增 line-numbers、code-content、word-diff 等样式
- `index.html` — 重构面板结构，添加 editor-container、diff-results-panel resize-handle
- `js/main.js` — 扩展状态管理、粘贴处理、确认弹窗逻辑
- `js/scroll-sync.js` — 实现 ScrollSync.init() 双向同步滚动

## [1.1.0] - 2026-05-20

### 新增

- feat: 点击差异项跳转到对应行并高亮（@a6b8220）
- feat: 差异面板可拖拽调整高度，优化布局间距（@7a176fb）

### 修复

- fix: 底部结果面板固定，内容区可交互（@7cdda36）

## [1.0.0] - 2026-05-17

### 初始版本

FComp 文件比对工具首个可用版本，基于 HTML + CSS + Vanilla JavaScript + jsdiff CDN。

- 文件拖放/选择上传
- 文本粘贴输入
- 行级差异对比
- 差异统计面板
- 差异摘要列表
- Vercel 静态部署
