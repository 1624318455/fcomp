# FComp — 文件比对工具

- GitHub: https://github.com/1624318455/fcomp
- chat_id: `oc_208d1beb7a4f10e4bb74093644964ec9`

## 技术栈

HTML + CSS + Vanilla JavaScript (ES5 IIFE) | jsdiff 8.0.2 (CDN) | 无构建步骤 | Vercel 静态托管

## 架构

```
fcomp/
├── index.html          # 入口（单页应用）
├── css/styles.css      # CSS 变量设计系统
├── js/
│   ├── main.js         # 主入口: 初始化、事件绑定、全局 state
│   ├── file-handler.js # 文件: 上传/读取/编码/验证
│   ├── diff-engine.js  # 比对: 行级/词级差异
│   ├── ui-renderer.js  # 渲染: 差异行/统计/摘要
│   └── scroll-sync.js  # 左右面板滚动同步
└── vercel.json
```

### 模块加载

IIFE 模块模式，`<script>` 标签按序加载，暴露全局对象: FileHandler, DiffEngine, UIRenderer, ScrollSync

### 核心数据流

1. 拖放/选择文件 → FileHandler 读取为文本
2. 存入 main.js state (sourceContent / targetContent)
3. "开始比对" → DiffEngine.compare() 调用 jsdiff
4. renderDiffResultsPanel() 渲染差异（可点击跳转）
5. ScrollSync 左右面板滚动同步

### 关键约束

- 无构建步骤: 直接打开 index.html 开发
- CSS 变量设计系统: styles.css 顶部 `:root`
- 文件限制: 10MB (`FileHandler.MAX_FILE_SIZE`)
- XSS 防护: 所有动态内容必须 `escapeHtml()`
- 支持类型: txt, js, jsx, ts, tsx, json, html, css, md, xml, yaml, sql, sh 等

## 常用命令

```bash
start index.html          # 本地开发（无需构建）
git add <files> && git commit -m "<type>(<scope>): <subject>" && git push
vercel ls                 # 检查部署状态
```

## 测试

无自动化测试框架 | 用 Playwright MCP 截图验证 UI | 提交前: 功能正常、无 XSS、无硬编码密钥

## 部署

Vercel 静态托管 | push 到 master 自动部署 | https://fcomp.vercel.app
