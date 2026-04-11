/**
 * FComp 主入口文件
 * 负责初始化应用、绑定事件、全局状态管理
 * 严格遵循架构方案设计规范
 */

(function() {
  'use strict';

  // ========================================
  // Toast 通知工具函数
  // ========================================
  
  function showToast(message, type) {
    type = type || 'info';
    var container = document.getElementById('toast-container');
    if (!container) return;
    
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(function() {
      toast.style.animation = 'toastFadeOut 0.3s ease-out';
      setTimeout(function() {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  // ========================================
  // 全局状态
  // ========================================
  
  var state = {
    sourceContent: '',
    targetContent: '',
    sourceFileName: '',
    targetFileName: '',
    diffResult: null,
    syncScrollEnabled: true,
    isComparing: false
  };

  // ========================================
  // DOM 元素引用
  // ========================================
  
  var elements = {
    // 面板
    sourcePanel: null,
    targetPanel: null,
    sourceCodeContent: null,
    targetCodeContent: null,
    sourceLineNumbers: null,
    targetLineNumbers: null,
    
    // 文件名显示
    sourceFileName: null,
    targetFileName: null,
    
    // 文件输入
    sourceFileInput: null,
    targetFileInput: null,
    
    // 按钮
    sourceUploadBtn: null,
    targetUploadBtn: null,
    compareBtn: null,
    clearLeftBtn: null,
    clearRightBtn: null,
    clearAllBtn: null,
    
    // 开关
    syncScrollToggle: null,
    
    // 统计
    statTotal: null,
    statAdded: null,
    statRemoved: null,
    statModified: null
  };

  // ========================================
  // 初始化
  // ========================================
  
  /**
   * 清除差异结果并恢复原始编辑状态
   * 当用户在显示差异的面板上再次输入时调用
   * @param {HTMLElement} panel - 面板元素
   * @param {string} side - 'source' 或 'target'
   */
  function clearDiffAndRestoreEdit(panel, side) {
    var codeContent = panel.querySelector('.code-content');
    var lineNumbers = panel.querySelector('.line-numbers');
    var stateKey = side === 'source' ? 'sourceContent' : 'targetContent';
    
    // 使用 setPanelContent 恢复原始内容（保持正确的 DOM 结构）
    setPanelContent(codeContent, state[stateKey] || '');
    
    // 清除行号
    lineNumbers.innerHTML = '';
    
    // 清除差异摘要
    var summaryList = document.getElementById('diff-summary-list');
    if (summaryList) summaryList.innerHTML = '';
    var statTotal = document.getElementById('stat-total');
    var statAdded = document.getElementById('stat-added');
    var statRemoved = document.getElementById('stat-removed');
    var statModified = document.getElementById('stat-modified');
    if (statTotal) statTotal.textContent = '0';
    if (statAdded) statAdded.textContent = '0';
    if (statRemoved) statRemoved.textContent = '0';
    if (statModified) statModified.textContent = '0';
    
    // 清除差异结果状态
    state.diffResult = null;
  }

  /**
   * 初始化应用
   */
  function init() {
    // 缓存 DOM 元素
    cacheElements();
    
    // 绑定事件
    bindEvents();
    
    // 初始化同步滚动
    ScrollSync.init(elements.sourcePanel, elements.targetPanel);
    
    // 检测 jsdiff 是否加载成功
    checkJsDiffLoaded();
    
    console.log('FComp 初始化完成');
  }

  /**
   * 缓存 DOM 元素引用
   */
  function cacheElements() {
    elements.sourcePanel = document.getElementById('source-panel');
    elements.targetPanel = document.getElementById('target-panel');
    elements.sourceCodeContent = document.getElementById('source-code-content');
    elements.targetCodeContent = document.getElementById('target-code-content');
    elements.sourceLineNumbers = document.getElementById('source-line-numbers');
    elements.targetLineNumbers = document.getElementById('target-line-numbers');
    
    elements.sourceFileName = document.getElementById('source-file-name');
    elements.targetFileName = document.getElementById('target-file-name');
    
    elements.sourceFileInput = document.getElementById('source-file-input');
    elements.targetFileInput = document.getElementById('target-file-input');
    
    elements.sourceUploadBtn = document.getElementById('source-upload-btn');
    elements.targetUploadBtn = document.getElementById('target-upload-btn');
    elements.compareBtn = document.getElementById('compare-btn');
    elements.clearLeftBtn = document.getElementById('clear-left');
    elements.clearRightBtn = document.getElementById('clear-right');
    elements.clearAllBtn = document.getElementById('clear-all');
    
    elements.syncScrollToggle = document.getElementById('sync-scroll-toggle');
    
    elements.statTotal = document.getElementById('stat-total');
    elements.statAdded = document.getElementById('stat-added');
    elements.statRemoved = document.getElementById('stat-removed');
    elements.statModified = document.getElementById('stat-modified');
  }

  /**
   * 检查 jsdiff 是否加载成功
   */
  function checkJsDiffLoaded() {
    if (typeof Diff === 'undefined') {
      showToast('错误：jsdiff 库加载失败，请检查网络连接后刷新页面重试。', 'error');
      elements.compareBtn.disabled = true;
      return false;
    }
    return true;
  }

  // ========================================
  // 事件绑定
  // ========================================
  
  /**
   * 绑定所有事件
   */
  function bindEvents() {
    // 文件上传按钮
    elements.sourceUploadBtn.addEventListener('click', function() {
      elements.sourceFileInput.click();
    });
    
    elements.targetUploadBtn.addEventListener('click', function() {
      elements.targetFileInput.click();
    });
    
    // 文件选择
    elements.sourceFileInput.addEventListener('change', function(e) {
      handleFileSelect(e, 'source');
    });
    
    elements.targetFileInput.addEventListener('change', function(e) {
      handleFileSelect(e, 'target');
    });
    
    // 文本编辑区输入（支持粘贴）- 使用 getPanelContent 正确处理换行
    elements.sourceCodeContent.addEventListener('input', function(e) {
      if (state.diffResult) {
        clearDiffAndRestoreEdit(elements.sourcePanel, 'source');
      }
      state.sourceContent = getPanelContent(elements.sourceCodeContent);
    });
    
    elements.targetCodeContent.addEventListener('input', function(e) {
      if (state.diffResult) {
        clearDiffAndRestoreEdit(elements.targetPanel, 'target');
      }
      state.targetContent = getPanelContent(elements.targetCodeContent);
    });
    
    // 粘贴事件
    elements.sourceCodeContent.addEventListener('paste', handlePaste);
    elements.targetCodeContent.addEventListener('paste', handlePaste);
    
    // 开始比对按钮
    elements.compareBtn.addEventListener('click', handleCompare);
    
    // 清空按钮
    elements.clearLeftBtn.addEventListener('click', handleClearLeft);
    elements.clearRightBtn.addEventListener('click', handleClearRight);
    elements.clearAllBtn.addEventListener('click', handleClearAll);
    
    // 同步滚动开关
    elements.syncScrollToggle.addEventListener('change', function(e) {
      state.syncScrollEnabled = e.target.checked;
      ScrollSync.toggle(state.syncScrollEnabled);
    });
    
    // 键盘快捷键
    document.addEventListener('keydown', handleKeyDown);
  }

  // ========================================
  // 事件处理函数
  // ========================================
  
  /**
   * 处理文件选择
   * @param {Event} e - 事件对象
   * @param {string} panel - 面板类型 ('source' 或 'target')
   */
  async function handleFileSelect(e, panel) {
    var fileInput = e.target;
    var file = fileInput.files[0];
    
    if (!file) {
      return;
    }
    
    try {
      // 读取文件
      var result = await FileHandler.handleFile(file);
      
      // 更新状态
      if (panel === 'source') {
        state.sourceContent = result.content;
        state.sourceFileName = result.name;
        UIRenderer.setFileName(elements.sourcePanel, result.name);
      } else {
        state.targetContent = result.content;
        state.targetFileName = result.name;
        UIRenderer.setFileName(elements.targetPanel, result.name);
      }
      
      // 渲染内容 - 使用 setPanelContent 保持正确的 DOM 结构
      var codeContent = panel === 'source' ? elements.sourceCodeContent : elements.targetCodeContent;
      setPanelContent(codeContent, result.content);
      
      // 同步滚动位置
      ScrollSync.syncScroll();
      
    } catch (error) {
      showToast('文件读取失败：' + error.message, 'error');
    }
    
    // 清除文件输入，以便再次选择同一文件
    fileInput.value = '';
  }

  /**
   * 处理粘贴事件
   * @param {Event} e - 粘贴事件对象
   */
  function handlePaste(e) {
    // 延迟处理，确保粘贴完成
    setTimeout(function() {
      // 使用 getPanelContent 正确获取带换行的内容
      var sourceText = getPanelContent(elements.sourceCodeContent);
      var targetText = getPanelContent(elements.targetCodeContent);
      
      // 如果有差异结果，需要先恢复编辑状态
      if (state.diffResult) {
        var currentTarget = e.target === elements.targetCodeContent ? targetText : '';
        var currentSource = e.target === elements.sourceCodeContent ? sourceText : '';
        
        if (e.target === elements.sourceCodeContent) {
          clearDiffAndRestoreEdit(elements.sourcePanel, 'source');
        } else if (e.target === elements.targetCodeContent) {
          clearDiffAndRestoreEdit(elements.targetPanel, 'target');
        }
        
        // 恢复用户新粘贴的内容
        if (currentTarget && e.target === elements.targetCodeContent) {
          setPanelContent(elements.targetCodeContent, currentTarget);
          targetText = currentTarget;
        }
        if (currentSource && e.target === elements.sourceCodeContent) {
          setPanelContent(elements.sourceCodeContent, currentSource);
          sourceText = currentSource;
        }
      }
      
      // 更新状态
      state.sourceContent = sourceText;
      state.targetContent = targetText;
      
      // 如果是粘贴到空面板，更新文件名显示
      if (e.target === elements.sourceCodeContent && !state.sourceFileName && sourceText) {
        elements.sourceFileName.innerHTML = '<span class="file-name-placeholder">粘贴内容</span>';
      }
      if (e.target === elements.targetCodeContent && !state.targetFileName && targetText) {
        elements.targetFileName.innerHTML = '<span class="file-name-placeholder">粘贴内容</span>';
      }
    }, 0);
  }
  
  /**
   * 设置面板内容（处理 contenteditable div 的特殊结构）
   * @param {HTMLElement} element - 面板元素
   * @param {string} content - 要设置的内容
   */
  function setPanelContent(element, content) {
    if (!element || !content) {
      if (element) element.textContent = '';
      return;
    }
    
    // 按换行分割内容
    var lines = content.split('\n');
    
    // 清空现有内容
    element.innerHTML = '';
    
    // 为每一行创建 div 元素
    lines.forEach(function(line, index) {
      var div = document.createElement('div');
      div.textContent = line;
      element.appendChild(div);
    });
  }

  /**
   * 获取面板内容的统一方法
   * 保留原始格式，包括空行
   * 处理 contenteditable div 的特殊结构：换行在 DOM 中表现为 <div> 分隔
   */
  function getPanelContent(element) {
    if (!element) return '';
    
    // 获取子元素和文本节点
    var childNodes = element.childNodes;
    var lines = [];
    
    for (var i = 0; i < childNodes.length; i++) {
      var node = childNodes[i];
      
      if (node.nodeType === Node.TEXT_NODE) {
        // 文本节点：直接添加内容（可能包含换行符）
        var text = node.textContent;
        if (text) {
          // 文本节点可能包含换行符，需要按换行分割
          var textLines = text.split('\n');
          textLines.forEach(function(t, idx) {
            if (t || idx === 0) {
              lines.push(t);
            }
          });
        }
      } else if (node.nodeName === 'DIV' || node.nodeName === 'P' || node.nodeName === 'BR') {
        // 元素节点：如果不是 BR（BR 表示换行），则内容为一行
        if (node.nodeName === 'BR') {
          // BR 标签表示换行，但不需要额外处理（下一个元素就是新行）
          continue;
        }
        // DIV 或 P：内容为一行
        var content = node.textContent || '';
        lines.push(content);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // 其他元素：递归处理
        var childContent = getPanelContent(node);
        if (childContent) {
          lines.push(childContent);
        }
      }
    }
    
    return lines.join('\n');
  }

   /**
   * 处理比对
   */
  function handleCompare() {
    // 检查输入
    if (!state.sourceContent && !state.targetContent) {
      showToast('请至少在一个面板中输入或上传文件内容', 'warning');
      return;
    }
    
    if (!checkJsDiffLoaded()) {
      return;
    }
    
    // 显示加载状态
    state.isComparing = true;
    UIRenderer.setLoadingState(elements.compareBtn, true);
    
    // 使用 setTimeout 确保 UI 更新
    setTimeout(function() {
      try {
        // 执行比对
        var diffResult = DiffEngine.compare(state.sourceContent, state.targetContent);
        
        // 保存结果到状态
        state.diffResult = diffResult;
        
        // 在独立的差异面板中显示结果（不覆盖原始内容）
        renderDiffResultsPanel(diffResult);
        
        // 显示差异面板
        var diffPanel = document.getElementById('diff-results-panel');
        if (diffPanel) {
          diffPanel.classList.add('active');
        }
        
        showToast('比对完成，发现 ' + diffResult.stats.total + ' 处差异', 'info');
        
      } catch (error) {
        showToast('比对失败：' + error.message, 'error');
        console.error(error);
      } finally {
        state.isComparing = false;
        UIRenderer.setLoadingState(elements.compareBtn, false);
      }
    }, 50);
  }

  /**
   * 渲染差异结果到独立面板（不覆盖原始内容）
   */
  function renderDiffResultsPanel(diffResult) {
    var contentEl = document.getElementById('diff-results-content');
    if (!contentEl) return;
    
    var stats = diffResult.stats || { added: 0, removed: 0, modified: 0, total: 0 };
    
    // 更新统计
    var statTotal = document.getElementById('stat-total');
    var statAdded = document.getElementById('stat-added');
    var statRemoved = document.getElementById('stat-removed');
    var statModified = document.getElementById('stat-modified');
    if (statTotal) statTotal.textContent = stats.total;
    if (statAdded) statAdded.textContent = stats.added;
    if (statRemoved) statRemoved.textContent = stats.removed;
    if (statModified) statModified.textContent = stats.modified;
    
    // 清空并渲染差异列表
    contentEl.innerHTML = '';
    
    var sourceLines = diffResult.source || [];
    var targetLines = diffResult.target || [];
    
    var items = [];
    
    // 收集差异项
    sourceLines.forEach(function(line, index) {
      if (line.type === 'removed' || line.type === 'modified') {
        items.push({
          side: 'source',
          lineNum: index + 1,
          type: line.type,
          content: line.content || '(空行)'
        });
      }
    });
    
    targetLines.forEach(function(line, index) {
      if (line.type === 'added' || line.type === 'modified') {
        items.push({
          side: 'target',
          lineNum: index + 1,
          type: line.type,
          content: line.content || '(空行)'
        });
      }
    });
    
    // 渲染差异项
    if (items.length === 0) {
      contentEl.innerHTML = '<div class="diff-results-placeholder">两份内容完全相同，无差异</div>';
      return;
    }
    
    items.forEach(function(item) {
      var el = document.createElement('div');
      el.className = 'diff-result-item ' + item.type;
      
      var typeLabel = item.type === 'added' ? '新增' : (item.type === 'removed' ? '删除' : '修改');
      var sideLabel = item.side === 'source' ? '左侧' : '右侧';
      
      el.innerHTML = '<span class="diff-result-line">' + sideLabel + ' 第' + item.lineNum + '行</span>' +
        '<span class="diff-result-content">' + escapeHtml(item.content) + '</span>';
      
      el.addEventListener('click', function() {
        // 滚动到对应面板的对应行
        var containerId = item.side === 'source' ? 'source-code-content' : 'target-code-content';
        var container = document.getElementById(containerId);
        if (container) {
          container.scrollTop = 0;
        }
        showToast('已定位到 ' + sideLabel + ' 第' + item.lineNum + '行', 'info');
      });
      
      contentEl.appendChild(el);
    });
  }

  /**
   * HTML 转义
   */
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * 清空左侧面板
   */
  function handleClearLeft() {
    if (state.sourceContent) {
      setPanelContent(elements.sourceCodeContent, '');
      state.sourceContent = '';
      state.sourceFileName = '';
      elements.sourceFileName.innerHTML = '<span class="file-name-placeholder">未选择文件</span>';
      UIRenderer.clearPanel(elements.sourcePanel);
      showToast('左侧已清空', 'info');
    }
  }

  /**
   * 清空右侧面板
   */
  function handleClearRight() {
    if (state.targetContent) {
      setPanelContent(elements.targetCodeContent, '');
      state.targetContent = '';
      state.targetFileName = '';
      elements.targetFileName.innerHTML = '<span class="file-name-placeholder">未选择文件</span>';
      UIRenderer.clearPanel(elements.targetPanel);
      showToast('右侧已清空', 'info');
    }
  }

  /**
   * 清空所有面板
   */
  function handleClearAll() {
    setPanelContent(elements.sourceCodeContent, '');
    setPanelContent(elements.targetCodeContent, '');
    state.sourceContent = '';
    state.targetContent = '';
    state.sourceFileName = '';
    state.targetFileName = '';
    state.diffResult = null;
    elements.sourceFileName.innerHTML = '<span class="file-name-placeholder">未选择文件</span>';
    elements.targetFileName.innerHTML = '<span class="file-name-placeholder">未选择文件</span>';
    UIRenderer.clearBothPanels(elements.sourcePanel, elements.targetPanel);
    // 清空对比结果摘要
    var summaryList = document.getElementById('diff-summary-list');
    if (summaryList) summaryList.innerHTML = '';
    var statTotal = document.getElementById('stat-total');
    var statAdded = document.getElementById('stat-added');
    var statRemoved = document.getElementById('stat-removed');
    var statModified = document.getElementById('stat-modified');
    if (statTotal) statTotal.textContent = '0';
    if (statAdded) statAdded.textContent = '0';
    if (statRemoved) statRemoved.textContent = '0';
    if (statModified) statModified.textContent = '0';
    showToast('已清空所有内容', 'info');
  }

  /**
   * 处理键盘快捷键
   * @param {Event} e - 键盘事件
   */
  function handleKeyDown(e) {
    // Ctrl+Enter 开始比对
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      handleCompare();
    }
  }

  // 初始化应用
  init();

})();

// 导出全局状态（用于调试）
// window.FCompState = state;